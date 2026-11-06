import type { ContentPack, FeatureId, GameState, RuleOptions } from './contracts.ts';
import { matches } from './conditions.ts';
export function featureUnlocked(state: GameState, content: ContentPack, feature: FeatureId, options: RuleOptions = {}) {
  return !!options.developer || state.phase !== 'title' && matches(state, content.progression?.unlocks[feature]);
}
export function currentGuide(state: GameState, content: ContentPack) {
  if (state.phase !== 'playing' || state.dialogue || state.chapterId !== state.journey.chapterId) return undefined;
  return content.progression?.guides.find(step => step.chapterId === state.chapterId && matches(state, step.condition) && !matches(state, step.complete));
}
export function isRevisiting(state: GameState) { return state.chapterId !== state.journey.chapterId; }
