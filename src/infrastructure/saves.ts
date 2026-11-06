import type { ContentPack, GameState } from '../core/contracts.ts';
import { firstSceneOf, hotspotsOf, scenesOf } from '../core/scenes.ts';

export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const slots = ['auto', 'checkpoint', 'manual-1', 'manual-2', 'manual-3'] as const;
export type SlotId = typeof slots[number];
export interface SaveEnvelope { format: 'baiwei-save'; version: 1; savedAt: string; state: GameState; notice?: string }
export type SaveResult<T> = { ok: true; value: T } | { ok: false; error: string };
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string') && new Set(v).size === v.length;
function actionsOf(content: ContentPack) {
  return [...content.dialogues.flatMap(d => d.nodes.flatMap(n => n.choices)), ...content.minigames.map(g => g.reward), ...content.chapters.flatMap(c => hotspotsOf(c).flatMap(h => h.interaction.kind === 'inspect' ? [h.interaction.action, ...(h.interaction.options ?? [])].filter(x => x !== undefined) : []))];
}
function migratePrevious(s: Record<string, unknown>, content: ContentPack) {
  if (s.schemaVersion !== 1 || s.contentId !== content.id || s.contentVersion !== 2 || content.version !== 3) return null;
  if (!strings(s.visited) || !strings(s.flags) || !strings(s.clues) || !strings(s.rewards) || !object(s.metrics) || !object(s.quests) || !object(s.decisions)) return null;
  const chapter = content.chapters.find(c => c.id === s.chapterId); if (!chapter) return null;
  const next = structuredClone(s); next.schemaVersion = 2; next.contentVersion = 3;
  next.sceneId = firstSceneOf(chapter); next.seenScenes = s.visited.map(id => firstSceneOf(content.chapters.find(c => c.id === id)!));
  next.metrics = { ...Object.fromEntries(content.metrics.map(m => [m.id, 0])), ...s.metrics };
  const actions = actionsOf(content); const knownRewards = new Set(actions.map(a => a.onceKey ?? a.id));
  next.rewards = s.rewards.filter(r => knownRewards.has(r));
  if (['morning','noon'].includes(String(s.chapterId)) && s.phase === 'playing') {
    const id=String(s.chapterId);
    next.flags = s.flags.filter(f => !f.startsWith(id+'-') && (id!=='morning'||f!=='chen-recognized'));
    next.rewards = (next.rewards as string[]).filter(r => !r.startsWith(id+'-'));
    next.clues = s.clues.filter(c => c !== (id==='morning'?'schedule':'orders'));
    next.metrics = { ...(next.metrics as object), [id==='morning'?'listening':'research']: 0 }; next.quests = { ...s.quests, [id]: 'active' };
    const decisions = { ...s.decisions }; delete decisions[id]; next.decisions = decisions; next.dialogue = null;
  }
  return next;
}

export function decodeSave(raw: string, content: ContentPack): SaveResult<SaveEnvelope> {
  try {
    if (raw.length > 1_000_000) throw new Error('存档过大。');
    const data: unknown = JSON.parse(raw);
    if (!object(data) || data.format !== 'baiwei-save' || data.version !== 1 || typeof data.savedAt !== 'string' || !Number.isFinite(Date.parse(data.savedAt))) throw new Error('存档格式不受支持。');
    let s = data.state;
    if (object(s)) {
      const migrated = migratePrevious(s, content);
      if (migrated) { s = migrated; data.state = migrated; data.notice = migrated.chapterId==='morning'?'已接上旧进度。第二章从陈家店门口重新读起。':migrated.chapterId==='noon'?'已接上旧进度。第三章从琴记店堂重新读起。':'已接上原来的进度。'; }
    }
    if (!object(s) || s.schemaVersion !== 2 || s.contentId !== content.id || s.contentVersion !== content.version) throw new Error('这份存档不适用于当前版本，原文件未改动。');
    if (!['title', 'playing', 'ending'].includes(String(s.phase)) || typeof s.chapterId !== 'string' || !content.chapters.some(c => c.id === s.chapterId)) throw new Error('章节状态无效。');
    for (const key of ['visited', 'flags', 'clues', 'rewards', 'achievements', 'seenScenes']) if (!strings(s[key])) throw new Error(`存档字段 ${key} 无效。`);
    for (const key of ['inventory', 'metrics', 'quests', 'decisions']) if (!object(s[key])) throw new Error(`存档字段 ${key} 无效。`);
    const state = s as unknown as GameState;
    const actions = actionsOf(content);
    const flags = new Set(actions.flatMap(a => a.effects.filter(e => e.kind === 'flag').map(e => e.id)));
    const known = (values: string[], ids: string[]) => values.every(v => ids.includes(v));
    if (!known(state.visited, content.chapters.map(c => c.id)) || !known(state.clues, content.clues.map(c => c.id)) || !known(state.achievements, content.achievements.map(a => a.id)) || !known(state.flags, [...flags]) || !known(state.rewards, actions.map(a => a.onceKey ?? a.id))) throw new Error('存档引用了当前内容中不存在的记录。');
    for (const [key, value] of Object.entries(state.inventory)) if (!content.items.some(i => i.id === key) || !Number.isSafeInteger(value) || value < 0) throw new Error('道具数据无效。');
    for (const [key, value] of Object.entries(state.metrics)) if (!content.metrics.some(m => m.id === key) || !Number.isSafeInteger(value) || value < 0) throw new Error('属性数据无效。');
    if (content.metrics.some(m => !(m.id in state.metrics))) throw new Error('属性数据不完整。');
    for (const [key, value] of Object.entries(state.quests)) if (!content.quests.some(q => q.id === key) || !['active', 'completed', 'failed'].includes(value)) throw new Error('任务数据无效。');
    for (const [key, value] of Object.entries(state.decisions)) if (!actions.some(a => 'decision' in a && a.decision === key && a.id === value)) throw new Error('选择记录无效。');
    if (state.dialogue !== null) {
      if (!object(state.dialogue)) throw new Error('对话数据无效。');
      const d = content.dialogues.find(d => d.id === state.dialogue?.id);
      const chapter = content.chapters.find(c => c.id === state.chapterId)!;
      if (!d?.nodes.some(n => n.id === state.dialogue?.nodeId) || !scenesOf(chapter).find(s => s.id === state.sceneId)?.hotspots.some(h => h.interaction.kind === 'dialogue' && h.interaction.dialogueId === d.id)) throw new Error('对话位置无效。');
    }
    const chapter = content.chapters.find(c => c.id === state.chapterId)!;
    if (!scenesOf(chapter).some(s => s.id === state.sceneId) || !known(state.seenScenes, content.chapters.flatMap(c => scenesOf(c).map(s => s.id)))) throw new Error('场景位置无效。');
    if (state.phase !== 'title' && !state.seenScenes.includes(state.sceneId)) throw new Error('场景记录不完整。');
    if (state.phase === 'playing' && !chapter.next || state.phase === 'ending' && chapter.next) throw new Error('章节与阶段不匹配。');
    if (state.phase !== 'title' && (!state.visited.includes(state.chapterId) || !state.quests[chapter.questId])) throw new Error('当前章节记录不完整。');
    if (state.phase !== 'playing' && state.dialogue) throw new Error('当前阶段不应有未完成对话。');
    return { ok: true, value: data as unknown as SaveEnvelope };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : '无法读取存档。' }; }
}
export function createSaveRepository(storage: StoragePort, content: ContentPack) {
  const prefix = `baiwei:${content.id}:v1:`;
  return {
    read(slot: SlotId): SaveResult<SaveEnvelope | null> {
      try { const raw = storage.getItem(prefix + slot); return raw ? decodeSave(raw, content) : { ok: true, value: null }; }
      catch { return { ok: false, error: '浏览器未允许读取存档。' }; }
    },
    write(slot: SlotId, state: GameState): SaveResult<SaveEnvelope> {
      const value: SaveEnvelope = { format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: structuredClone(state) };
      const checked = decodeSave(JSON.stringify(value), content);
      if (!checked.ok) return checked;
      try { storage.setItem(prefix + slot, JSON.stringify(value)); return { ok: true, value }; }
      catch { return { ok: false, error: '存档未能写入，可能是空间不足或浏览器限制。请导出备份。' }; }
    },
    remove(slot: SlotId): SaveResult<null> {
      try { storage.removeItem(prefix + slot); return { ok: true, value: null }; }
      catch { return { ok: false, error: '无法删除该存档。' }; }
    },
  };
}
