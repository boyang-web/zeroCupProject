import type { Action, Command, Condition, ContentPack, Effect, GameState, RuleOptions, Transition } from './contracts.ts';
import { firstSceneOf, sceneOf, scenesOf } from './scenes.ts';
import { canAccess, matches } from './conditions.ts';
import { featureUnlocked, isRevisiting } from './progression.ts';
export { matches } from './conditions.ts';

export function createState(content: ContentPack): GameState {
  return {
    schemaVersion: 3, contentId: content.id, contentVersion: content.version,
    phase: 'title', chapterId: content.firstChapter, visited: [], flags: [], clues: [],
    inventory: {}, metrics: Object.fromEntries(content.metrics.map(m => [m.id, 0])),
    quests: {}, rewards: [], decisions: {}, achievements: [], dialogue: null,
    sceneId: firstSceneOf(content.chapters.find(c => c.id === content.firstChapter)!), seenScenes: [],
    journey: { chapterId: content.firstChapter, sceneId: firstSceneOf(content.chapters.find(c => c.id === content.firstChapter)!) },
  };
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
function applyAction(state: GameState, action: Action, options: RuleOptions = {}) {
  const key = action.onceKey ?? action.id;
  if (state.rewards.includes(key)) {
    // Repeat interactions in tests, while item and metric rewards stay once-only.
    if (options.developer) applyEffects(state, action.effects.filter(e => e.kind === 'flag' || e.kind === 'clue' || e.kind === 'quest'));
    return;
  }
  applyEffects(state, action.effects);
  state.rewards.push(key);
}
function enterChapter(state: GameState, id: string, content: ContentPack) {
  const chapter = content.chapters.find(c => c.id === id)!;
  state.chapterId = id;
  state.sceneId = firstSceneOf(chapter); addUnique(state.seenScenes, state.sceneId);
  state.journey = { chapterId: id, sceneId: state.sceneId };
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
export function transition(previous: GameState, command: Command, content: ContentPack, options: RuleOptions = {}): Transition {
  const state = structuredClone(previous);
  let feedback = '';
  const deny = (message: string): Transition => ({ state: previous, changed: false, message });
  const chapter = content.chapters.find(c => c.id === state.chapterId)!;
  const scene = sceneOf(state, content);
  const allowed = (condition?: Condition) => canAccess(state, condition, options);
  if (command.type === 'dev-jump' || command.type === 'dev-dialogue') {
    if (!options.developer) return deny('请先开启开发者测试模式。');
    let target = command.type === 'dev-jump' ? content.chapters.find(c => c.id === command.chapterId) : undefined;
    let targetScene = target && scenesOf(target).find(s => s.id === (command.type === 'dev-jump' ? command.sceneId ?? firstSceneOf(target!) : ''));
    if (command.type === 'dev-dialogue') {
      const dialogue = content.dialogues.find(d => d.id === command.dialogueId);
      if (!dialogue?.nodes.some(n => n.id === command.nodeId)) return deny('没有这个对话节点。');
      target = content.chapters.find(c => scenesOf(c).some(s => s.hotspots.some(h => h.interaction.kind === 'dialogue' && h.interaction.dialogueId === command.dialogueId)));
      targetScene = target && scenesOf(target).find(s => s.hotspots.some(h => h.interaction.kind === 'dialogue' && h.interaction.dialogueId === command.dialogueId));
    }
    if (!target || !targetScene) return deny('没有这个测试位置。');
    // Make the selected chapter the current journey, including after jumping back.
    state.visited = state.visited.filter(id => id !== target.id);
    enterChapter(state, target.id, content);
    state.sceneId = targetScene.id; state.journey.sceneId = targetScene.id;
    addUnique(state.seenScenes, targetScene.id);
    if (command.type === 'dev-dialogue') state.dialogue = { id: command.dialogueId, nodeId: command.nodeId };
    feedback = `测试位置：${target.title} · ${targetScene.title}`;
  } else if (command.type === 'start') {
    if (state.phase !== 'title') return deny('旅程已经开始。');
    enterChapter(state, content.firstChapter, content);
  } else {
    if (!options.developer && state.phase !== 'playing' && !['revisit', 'resume-journey'].includes(command.type)) return deny('当前不能进行这项操作。');
    if (state.dialogue && !['choose', 'close-dialogue'].includes(command.type)) {
      if (!options.developer) return deny('请先结束眼前的交谈。');
      state.dialogue = null;
    }
    if (command.type === 'revisit') {
      if (!options.developer && (!featureUnlocked(state, content, 'revisit') || !state.visited.includes(command.chapterId))) return deny('这处地方还不能回访。');
      const target = content.chapters.find(c => c.id === command.chapterId);
      if (!target || !target.next) return deny('请从当前行程继续。');
      if (command.chapterId === state.chapterId) return deny('已经在这里了。');
      state.chapterId = target.id;
      state.sceneId = target.id === state.journey.chapterId ? state.journey.sceneId : firstSceneOf(target);
      addUnique(state.visited, target.id);
      state.visited = [...state.visited.filter(id => id !== state.journey.chapterId), state.journey.chapterId];
      state.quests[target.questId] ??= 'active';
      addUnique(state.seenScenes, state.sceneId); state.dialogue = null; state.phase = 'playing';
      feedback = `回到${target.title}。先前发生的事仍然保留。`;
    } else if (command.type === 'resume-journey') {
      if (!isRevisiting(state)) return deny('已经在当前行程中了。');
      state.chapterId = state.journey.chapterId; state.sceneId = state.journey.sceneId;
      state.phase = content.chapters.find(c => c.id === state.chapterId)!.next ? 'playing' : 'ending';
      state.dialogue = null; feedback = '回到刚才的行程。';
    } else if (command.type === 'study-collection') {
      if (!featureUnlocked(state, content, 'collection', options)) return deny('物件收藏尚未开放。');
      const entry = content.collection?.find(e => e.id === command.entryId);
      if (!entry || !allowed(entry.condition)) return deny('还没有记下这件物品。');
      if (!entry.study || !allowed(entry.study.condition)) return deny('暂时没有更多可以确认的事。');
      applyAction(state, entry.study, options); feedback = entry.study.feedback ?? '记下了这个细节。';
    } else if (command.type === 'move') {
      const link = scene.links.find(l => l.sceneId === command.sceneId);
      if (!options.developer && (!link || !allowed(link.condition))) return deny(link?.unavailable ?? '这边暂时过不去。');
      if (!scenesOf(chapter).some(s => s.id === command.sceneId)) return deny('没有这处地方。');
      state.sceneId = command.sceneId; addUnique(state.seenScenes, state.sceneId);
      if (!isRevisiting(state)) state.journey.sceneId = command.sceneId;
    } else if (command.type === 'travel') {
      if (isRevisiting(state) && !options.developer) return deny('回访结束后，可以回到原来的行程。');
      if (!chapter.next || !allowed(chapter.exit)) return deny(chapter.exitHint ?? '还有事情需要处理。');
      if (options.developer) state.visited = state.visited.filter(id => id !== chapter.next);
      enterChapter(state, chapter.next, content);
    } else if (command.type === 'close-dialogue') {
      if (!state.dialogue) return deny('当前没有对话。');
      state.dialogue = null;
    } else if (command.type === 'choose') {
      const active = state.dialogue;
      const node = content.dialogues.find(d => d.id === active?.id)?.nodes.find(n => n.id === active?.nodeId);
      const choice = node?.choices.find(c => c.id === command.choiceId);
      if (!choice) return deny('对话选项已失效。');
      if (!allowed(choice.condition)) return deny(choice.unavailable ?? '还需要了解更多。');
      if (!options.developer && choice.decision && state.decisions[choice.decision] && state.decisions[choice.decision] !== choice.id) return deny('这项决定已经发生，可以读取之前的存档尝试另一条路。');
      if (options.developer && choice.decision) {
        const exclusiveFlags = content.dialogues.flatMap(d => d.nodes.flatMap(n => n.choices))
          .filter(c => c.decision === choice.decision).flatMap(c => c.effects.filter(e => e.kind === 'flag').map(e => e.id));
        state.flags = state.flags.filter(id => !exclusiveFlags.includes(id));
      }
      applyAction(state, choice, options);
      if (choice.decision) state.decisions[choice.decision] = choice.id;
      state.dialogue = choice.next ? { id: active!.id, nodeId: choice.next } : null;
    } else if (command.type === 'finish-minigame') {
      const game = content.minigames.find(g => g.id === command.gameId && g.chapterId === chapter.id);
      const hotspot = scene.hotspots.find(h => h.interaction.kind === 'minigame' ? h.interaction.gameId === game?.id : h.interaction.kind === 'inspect' && h.interaction.activityId === game?.id);
      if (!game || !hotspot || !allowed(hotspot.condition) || !allowed(game.condition)) return deny(game?.unavailable ?? '当前无法完成这个操作。');
      if (command.result.status === 'cancelled') return deny('已放下物件，进度没有改变。');
      if (!Number.isFinite(command.result.score) || command.result.score < 0 || command.result.score > 100) return deny('操作结果无效。');
      if (!allowed(game.reward.condition)) return deny(game.reward.unavailable ?? '暂时不能领取这份回馈。');
      applyAction(state, game.reward, options);
    } else {
      const hotspot = scene.hotspots.find(h => h.id === command.hotspotId);
      if (!hotspot || !allowed(hotspot.condition)) return deny('这里暂时无法交互。');
      const interaction = hotspot.interaction;
      if (command.type === 'talk') {
        if (interaction.kind !== 'dialogue') return deny('这里没有可交谈的人。');
        const dialogue = content.dialogues.find(d => d.id === interaction.dialogueId)!;
        state.dialogue = { id: dialogue.id, nodeId: dialogue.entries?.find(e => matches(state, e.condition))?.nodeId ?? dialogue.entry };
      } else {
        if (interaction.kind !== 'inspect') return deny('这里不能这样操作。');
        const action = command.type === 'inspect' ? interaction.action : interaction.options?.find(a => a.id === command.actionId);
        if (!action) return deny('仔细看了看，没有新的变化。');
        if (!allowed(action.condition)) return deny(action.unavailable ?? '需要另一种办法。');
        if (options.developer || !state.rewards.includes(action.onceKey ?? action.id)) feedback = action.feedback ?? '';
        applyAction(state, action, options);
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
