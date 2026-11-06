import type { Action, Command, Condition, ContentPack, Effect, GameState, Transition } from './contracts.ts';
import { firstSceneOf, sceneOf, scenesOf } from './scenes.ts';

export function createState(content: ContentPack): GameState {
  return {
    schemaVersion: 2, contentId: content.id, contentVersion: content.version,
    phase: 'title', chapterId: content.firstChapter, visited: [], flags: [], clues: [],
    inventory: {}, metrics: Object.fromEntries(content.metrics.map(m => [m.id, 0])),
    quests: {}, rewards: [], decisions: {}, achievements: [], dialogue: null,
    sceneId: firstSceneOf(content.chapters.find(c => c.id === content.firstChapter)!), seenScenes: [],
  };
}
export function matches(state: GameState, condition?: Condition): boolean {
  if (!condition) return true;
  switch (condition.kind) {
    case 'flag': return state.flags.includes(condition.id);
    case 'clue': return state.clues.includes(condition.id);
    case 'item': return (state.inventory[condition.id] ?? 0) >= (condition.count ?? 1);
    case 'metric': return (state.metrics[condition.id] ?? 0) >= condition.min;
    case 'quest': return state.quests[condition.id] === condition.status;
    case 'all': return condition.conditions.every(c => matches(state, c));
    case 'any': return condition.conditions.some(c => matches(state, c));
    case 'not': return !matches(state, condition.condition);
  }
}
function addUnique(list: string[], id: string) { if (!list.includes(id)) list.push(id); }
function applyEffects(state: GameState, effects: Effect[]) {
  for (const effect of effects) {
    switch (effect.kind) {
      case 'flag': addUnique(state.flags, effect.id); break;
      case 'clue': addUnique(state.clues, effect.id); break;
      case 'item': state.inventory[effect.id] = Math.max(0, (state.inventory[effect.id] ?? 0) + effect.amount); break;
      case 'metric': state.metrics[effect.id] = Math.max(0, (state.metrics[effect.id] ?? 0) + effect.amount); break;
      case 'quest': state.quests[effect.id] = effect.status; break;
    }
  }
}
function applyAction(state: GameState, action: Action) {
  const key = action.onceKey ?? action.id;
  if (state.rewards.includes(key)) return;
  applyEffects(state, action.effects);
  state.rewards.push(key);
}
function enterChapter(state: GameState, id: string, content: ContentPack) {
  const chapter = content.chapters.find(c => c.id === id)!;
  state.chapterId = id;
  state.sceneId = firstSceneOf(chapter); addUnique(state.seenScenes, state.sceneId);
  addUnique(state.visited, id);
  state.quests[chapter.questId] ??= 'active';
  for (const quest of content.quests.filter(q => q.chapterId === id && q.autoStart)) state.quests[quest.id] ??= 'active';
  if (!chapter.next) state.quests[chapter.questId] = 'completed';
  state.dialogue = null;
  state.phase = chapter.next ? 'playing' : 'ending';
}
export function resolveEnding(state: GameState, content: ContentPack) {
  return content.endings.find(ending => matches(state, ending.condition))!;
}
// All commands are validated here, including those triggered outside the UI.
export function transition(previous: GameState, command: Command, content: ContentPack): Transition {
  const state = structuredClone(previous);
  let feedback = '';
  const deny = (message: string): Transition => ({ state: previous, changed: false, message });
  const chapter = content.chapters.find(c => c.id === state.chapterId)!;
  const scene = sceneOf(state, content);
  if (command.type === 'start') {
    if (state.phase !== 'title') return deny('旅程已经开始。');
    enterChapter(state, content.firstChapter, content);
  } else {
    if (state.phase !== 'playing') return deny('当前不能进行这项操作。');
    if (state.dialogue && !['choose', 'close-dialogue'].includes(command.type)) return deny('请先结束眼前的交谈。');
    if (command.type === 'move') {
      const link = scene.links.find(l => l.sceneId === command.sceneId);
      if (!link || !matches(state, link.condition)) return deny(link?.unavailable ?? '这边暂时过不去。');
      if (!scenesOf(chapter).some(s => s.id === command.sceneId)) return deny('没有这处地方。');
      state.sceneId = command.sceneId; addUnique(state.seenScenes, state.sceneId);
    } else if (command.type === 'travel') {
      if (!chapter.next || !matches(state, chapter.exit)) return deny(chapter.exitHint ?? '还有事情需要处理。');
      enterChapter(state, chapter.next, content);
    } else if (command.type === 'close-dialogue') {
      if (!state.dialogue) return deny('当前没有对话。');
      state.dialogue = null;
    } else if (command.type === 'choose') {
      const active = state.dialogue;
      const node = content.dialogues.find(d => d.id === active?.id)?.nodes.find(n => n.id === active?.nodeId);
      const choice = node?.choices.find(c => c.id === command.choiceId);
      if (!choice) return deny('对话选项已失效。');
      if (!matches(state, choice.condition)) return deny(choice.unavailable ?? '还需要了解更多。');
      if (choice.decision && state.decisions[choice.decision] && state.decisions[choice.decision] !== choice.id) return deny('这项决定已经发生，可以读取之前的存档尝试另一条路。');
      applyAction(state, choice);
      if (choice.decision) state.decisions[choice.decision] = choice.id;
      state.dialogue = choice.next ? { id: active!.id, nodeId: choice.next } : null;
    } else if (command.type === 'finish-minigame') {
      const game = content.minigames.find(g => g.id === command.gameId && g.chapterId === chapter.id);
      const hotspot = scene.hotspots.find(h => h.interaction.kind === 'minigame' ? h.interaction.gameId === game?.id : h.interaction.kind === 'inspect' && h.interaction.activityId === game?.id);
      if (!game || !hotspot || !matches(state, hotspot.condition) || !matches(state, game.condition)) return deny(game?.unavailable ?? '当前无法完成这个操作。');
      if (command.result.status === 'cancelled') return deny('已放下物件，进度没有改变。');
      if (!Number.isFinite(command.result.score) || command.result.score < 0 || command.result.score > 100) return deny('操作结果无效。');
      if (!matches(state, game.reward.condition)) return deny(game.reward.unavailable ?? '暂时不能领取这份回馈。');
      applyAction(state, game.reward);
    } else {
      const hotspot = scene.hotspots.find(h => h.id === command.hotspotId);
      if (!hotspot || !matches(state, hotspot.condition)) return deny('这里暂时无法交互。');
      const interaction = hotspot.interaction;
      if (command.type === 'talk') {
        if (interaction.kind !== 'dialogue') return deny('这里没有可交谈的人。');
        const dialogue = content.dialogues.find(d => d.id === interaction.dialogueId)!;
        state.dialogue = { id: dialogue.id, nodeId: dialogue.entries?.find(e => matches(state, e.condition))?.nodeId ?? dialogue.entry };
      } else {
        if (interaction.kind !== 'inspect') return deny('这里不能这样操作。');
        const action = command.type === 'inspect' ? interaction.action : interaction.options?.find(a => a.id === command.actionId);
        if (!action) return deny('仔细看了看，没有新的变化。');
        if (!matches(state, action.condition)) return deny(action.unavailable ?? '需要另一种办法。');
        if (!state.rewards.includes(action.onceKey ?? action.id)) feedback = action.feedback ?? '';
        applyAction(state, action);
      }
    }
  }
  for (const achievement of content.achievements) {
    if (matches(state, achievement.condition)) addUnique(state.achievements, achievement.id);
  }
  const changed = JSON.stringify(state) !== JSON.stringify(previous);
  const discovered = content.clues.find(c => state.clues.includes(c.id) && !previous.clues.includes(c.id));
  return { state: changed ? state : previous, changed, message: feedback || (discovered ? `记下了：${discovered.title}` : changed ? '进度已保存。' : '没有新的变化。') };
}
