import type { Action, ContentPack, DialogueChoice, GameState } from './contracts.ts';
import { matches } from './conditions.ts';
import { hotspotsOf, scenesOf } from './scenes.ts';

// Use content ownership rather than ID prefixes: many chapter actions and
// rewards deliberately retain their old, unprefixed save IDs.
export function clearChapterProgress(state: GameState, content: ContentPack) {
  const target = content.chapters.find(c => c.id === state.chapterId)!;
  const retained = content.chapters.filter(c => c.number < target.number);
  const removed = content.chapters.filter(c => c.number >= target.number);
  function actions(chapters: typeof content.chapters): DialogueChoice[] {
    const hotspots = chapters.flatMap(hotspotsOf);
    const dialogues = new Set(hotspots.flatMap(h => h.interaction.kind === 'dialogue' ? [h.interaction.dialogueId] : []));
    return [
      ...content.dialogues.filter(d => dialogues.has(d.id)).flatMap(d => d.nodes.flatMap(n => n.choices)),
      ...hotspots.flatMap(h => h.interaction.kind === 'inspect' ? [h.interaction.action, ...(h.interaction.options ?? [])].filter((a): a is Action => !!a) : []),
      ...content.minigames.filter(g => chapters.some(c => c.id === g.chapterId)).map(g => g.reward),
    ];
  }
  const before = actions(retained), after = actions(removed);
  const keptKeys = new Set(before.map(a => a.onceKey ?? a.id));
  const removedKeys = new Set(after.map(a => a.onceKey ?? a.id).filter(id => !keptKeys.has(id)));
  const keptEffects = before.filter(a => state.rewards.includes(a.onceKey ?? a.id)).flatMap(a => a.effects);
  const deletedEffects = after.flatMap(a => a.effects);
  state.flags = state.flags.filter(id => !deletedEffects.some(e => e.kind === 'flag' && e.id === id) || keptEffects.some(e => e.kind === 'flag' && e.id === id));
  state.clues = state.clues.filter(id => !deletedEffects.some(e => e.kind === 'clue' && e.id === id) || keptEffects.some(e => e.kind === 'clue' && e.id === id));
  // Each onceKey contributes only once, including alternate ways to borrow
  // the same item. Preserve prior chapters' contributions to shared totals.
  for (const key of state.rewards.filter(id => removedKeys.has(id))) {
    const candidates = after.filter(a => (a.onceKey ?? a.id) === key);
    const action = candidates.find(a => a.decision && state.decisions[a.decision] === a.id) ?? candidates[0]!;
    for (const effect of action.effects) {
      if (effect.kind === 'item') state.inventory[effect.id] = Math.max(0, (state.inventory[effect.id] ?? 0) - effect.amount);
      if (effect.kind === 'metric') state.metrics[effect.id] = Math.max(0, (state.metrics[effect.id] ?? 0) - effect.amount);
    }
  }
  state.inventory = Object.fromEntries(Object.entries(state.inventory).filter(([, count]) => count > 0));
  state.rewards = state.rewards.filter(id => !removedKeys.has(id));
  for (const action of after) if (action.decision) delete state.decisions[action.decision];
  for (const quest of content.quests.filter(q => removed.some(c => c.id === q.chapterId))) delete state.quests[quest.id];
  for (const chapter of removed) delete state.quests[chapter.questId];
  // Collection study is available across scenes. Drop its dependent notes
  // when replay removes its source object or the collection unlock itself.
  for (const entry of content.collection ?? []) {
    if (!entry.study || matches(state, entry.condition) && matches(state, content.progression?.unlocks.collection)) continue;
    const key = entry.study.onceKey ?? entry.study.id;
    if (!state.rewards.includes(key)) continue;
    state.rewards = state.rewards.filter(id => id !== key);
    for (const effect of entry.study.effects) {
      if (effect.kind === 'clue') state.clues = state.clues.filter(id => id !== effect.id);
      if (effect.kind === 'flag') state.flags = state.flags.filter(id => id !== effect.id);
    }
  }
  state.visited = state.visited.filter(id => retained.some(c => c.id === id));
  const keptScenes = new Set(retained.flatMap(c => scenesOf(c).map(s => s.id)));
  state.seenScenes = state.seenScenes.filter(id => keptScenes.has(id));
  state.dialogue = null;
  state.achievements = state.achievements.filter(id => {
    const achievement = content.achievements.find(a => a.id === id);
    return achievement && matches(state, achievement.condition);
  });
}
