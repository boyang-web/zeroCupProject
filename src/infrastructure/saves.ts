import { epilogue as legacyEpilogue } from '../content/chapters/epilogue-v5.ts';
import { legacyEndings } from '../content/legacy-endings-v5.ts';
import type { ContentPack, GameState } from '../core/contracts.ts';
import { firstSceneOf, hotspotsOf, scenesOf } from '../core/scenes.ts';
import { createState, transition } from '../core/engine.ts';
import { shopChapters, shopDialogues, shopGames } from '../content/chapters/shops.ts';

export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const slots = ['auto', 'checkpoint', 'manual-1', 'manual-2', 'manual-3'] as const;
export type SlotId = typeof slots[number];
export interface SaveEnvelope { format: 'baiwei-save'; version: 1; savedAt: string; state: GameState; notice?: string }
export type SaveResult<T> = { ok: true; value: T } | { ok: false; error: string };
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string') && new Set(v).size === v.length;
function actionsOf(content: ContentPack) {
  return [...content.dialogues.flatMap(d => d.nodes.flatMap(n => n.choices)), ...content.minigames.map(g => g.reward), ...(content.collection ?? []).flatMap(e => e.study ? [e.study] : []), ...content.chapters.flatMap(c => hotspotsOf(c).flatMap(h => h.interaction.kind === 'inspect' ? [h.interaction.action, ...(h.interaction.options ?? [])].filter(x => x !== undefined) : []))];
}
function migratePrevious(s: Record<string, unknown>, content: ContentPack) {
  if (s.schemaVersion !== 1 || s.contentId !== content.id || s.contentVersion !== 2 || content.version < 3) return null;
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
    if (content.version === 6 && object(s) && s.contentId === content.id && [2, 3, 4, 5].includes(Number(s.contentVersion))) {
      const legacy: ContentPack = { ...content, version: 5,
        chapters: content.chapters.map(c => c.id === 'epilogue' ? legacyEpilogue : c),
        dialogues: content.dialogues.filter(d => !d.id.startsWith('epilogue-')),
        minigames: content.minigames.filter(g => g.chapterId !== 'epilogue'), endings: legacyEndings,
      };
      const checked = decodeSave(raw, legacy);
      if (!checked.ok) throw new Error(checked.error);
      const updated = structuredClone(checked.value.state);
      updated.contentVersion = 6;
      updated.seenScenes = updated.seenScenes.map(id => id === 'epilogue-main' ? 'epilogue-yard' : id);
      if (updated.sceneId === 'epilogue-main') updated.sceneId = 'epilogue-yard';
      if (updated.journey.sceneId === 'epilogue-main') updated.journey.sceneId = 'epilogue-yard';
      if (updated.visited.includes('epilogue')) {
        updated.quests.epilogue = 'active';
        if (updated.chapterId === 'epilogue') { updated.phase = 'playing'; updated.dialogue = null; }
      }
      data.state = s = updated;
      data.notice = updated.visited.includes('epilogue') ? '前三店的结果保留。旧自动结局从第五章归院重新展开，由你确认车次与下一步；原文件没有改动。' : checked.value.notice;
    }
    if (content.version === 5 && object(s) && s.contentId === content.id && [2, 3, 4].includes(Number(s.contentVersion))) {
      // Validate against the actual short chapter before changing any records.
      const legacy: ContentPack = { ...content, version: 4,
        chapters: content.chapters.map(c => c.id === 'night' ? shopChapters[0]! : c),
        dialogues: [...content.dialogues.filter(d => !d.id.startsWith('night-')), ...shopDialogues],
        minigames: [...content.minigames.filter(g => g.chapterId !== 'night'), ...shopGames],
      };
      const checked = decodeSave(raw, legacy);
      if (!checked.ok) throw new Error(checked.error);
      const updated = structuredClone(checked.value.state);
      updated.contentVersion = content.version;
      const hasNight = updated.visited.includes('night');
      const concluded = ['completed', 'failed'].includes(updated.quests.night ?? '');
      updated.seenScenes = updated.seenScenes.map(id => id === 'night-main' ? 'night-front' : id);
      if (updated.sceneId === 'night-main') updated.sceneId = 'night-front';
      if (updated.journey.sceneId === 'night-main') updated.journey.sceneId = 'night-front';
      if (hasNight && !concluded) {
        updated.flags = updated.flags.filter(id => !id.startsWith('night-'));
        updated.rewards = updated.rewards.filter(id => !id.startsWith('night-'));
        updated.metrics.care = 0;
        delete updated.decisions.night;
        if (updated.chapterId === 'night') { updated.sceneId = 'night-front'; updated.dialogue = null; }
      } else if (hasNight) {
        // A short-version success is not proof that the new pickup occurred.
        updated.flags = [...new Set([...updated.flags, 'night-legacy', 'night-ended'])];
        if (updated.chapterId === 'night') updated.dialogue = null;
      }
      const knownRewards = new Set(actionsOf(content).map(a => a.onceKey ?? a.id));
      updated.rewards = updated.rewards.filter(id => knownRewards.has(id));
      data.state = s = updated;
      data.notice = hasNight ? concluded ? '已保留第四章短版结果；没有补写取餐、回信或私话。可回访查看旧记录。' : '第四章已扩写，从店门重新读起；前三章及已看过的纸条保留。' : checked.value.notice ?? '已接上原进度，第四章将使用新版内容。';
    }
    if (object(s)) {
      const migrated = migratePrevious(s, content);
      if (migrated) { s = migrated; data.state = migrated; data.notice = migrated.chapterId==='morning'?'已接上旧进度。第二章从陈家店门口重新读起。':migrated.chapterId==='noon'?'已接上旧进度。第三章从琴记店堂重新读起。':'已接上原来的进度。'; }
      if (object(s) && s.schemaVersion === 2 && s.contentId === content.id && s.contentVersion === 3 && content.version === 4) {
        const updated = structuredClone(s); updated.schemaVersion = 3; updated.contentVersion = 4;
        const visited = Array.isArray(s.visited) ? s.visited : [];
        const furthest = content.chapters.find(c => c.id === visited.at(-1)) ?? (s.phase === 'title' ? content.chapters.find(c => c.id === content.firstChapter) : undefined);
        if (!furthest) throw new Error('旧存档缺少行程记录。');
        updated.journey = { chapterId: furthest.id, sceneId: furthest.id === s.chapterId ? s.sceneId : firstSceneOf(furthest) };
        // Run the complete current validator before any intentional chapter restart.
        // This recursive call cannot migrate again: its schema/content versions are current.
        const checkedLegacy = decodeSave(JSON.stringify({ ...data, state: updated }), content);
        if (!checkedLegacy.ok) throw new Error(checkedLegacy.error);
        if (s.chapterId === content.firstChapter) {
          s = s.phase === 'title' ? createState(content) : transition(createState(content), { type: 'start' }, content).state;
          data.notice = '第一章已精修，将从新的入口开始；原存档文件没有改动。';
        } else {
          s = checkedLegacy.value.state; data.notice ??= '已接上旧进度，并补齐回访行程记录。';
        }
        data.state = s;
      }
    }
    if (!object(s) || s.schemaVersion !== 3 || s.contentId !== content.id || s.contentVersion !== content.version) throw new Error('这份存档不适用于当前版本，原文件未改动。');
    if (!['title', 'playing', 'ending'].includes(String(s.phase)) || typeof s.chapterId !== 'string' || !content.chapters.some(c => c.id === s.chapterId)) throw new Error('章节状态无效。');
    for (const key of ['visited', 'flags', 'clues', 'rewards', 'achievements', 'seenScenes']) if (!strings(s[key])) throw new Error(`存档字段 ${key} 无效。`);
    for (const key of ['inventory', 'metrics', 'quests', 'decisions']) if (!object(s[key])) throw new Error(`存档字段 ${key} 无效。`);
    const state = s as unknown as GameState;
    if (!object(state.journey) || typeof state.journey.chapterId !== 'string' || typeof state.journey.sceneId !== 'string') throw new Error('行程记录无效。');
    const journeyChapter = content.chapters.find(c => c.id === state.journey.chapterId);
    if (!journeyChapter || !scenesOf(journeyChapter).some(scene => scene.id === state.journey.sceneId)) throw new Error('行程位置无效。');
    if (state.phase !== 'title' && (!state.visited.includes(journeyChapter.id) || !state.seenScenes.includes(state.journey.sceneId) || state.visited.at(-1) !== journeyChapter.id)) throw new Error('行程与走访记录不一致。');
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
    if (state.phase === 'playing' && !chapter.next && !chapter.exit || state.phase === 'ending' && (chapter.next || chapter.exit && state.quests[chapter.questId] !== 'completed')) throw new Error('章节与阶段不匹配。');
    if (state.phase !== 'title' && (!state.visited.includes(state.chapterId) || !state.quests[chapter.questId])) throw new Error('当前章节记录不完整。');
    if (state.phase !== 'playing' && state.dialogue) throw new Error('当前阶段不应有未完成对话。');
    return { ok: true, value: data as unknown as SaveEnvelope };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : '无法读取存档。' }; }
}
export function createSaveRepository(storage: StoragePort, content: ContentPack, channel?: 'developer') {
  const prefix = `baiwei:${content.id}:${channel ? `${channel}:` : ''}v1:`;
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
