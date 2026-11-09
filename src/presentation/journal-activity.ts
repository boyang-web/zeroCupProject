import type { ContentPack, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';
import { sceneOf } from '../core/scenes.ts';

// The current book owns its unfinished task, regardless of which UI opened it.
export function journalActivity(state: GameState, content: ContentPack, developer = false) {
  if (state.phase !== 'playing') return;
  for (const hotspot of sceneOf(state, content).hotspots) {
    const inspection = hotspot.interaction;
    if (inspection.kind !== 'inspect' || !inspection.journalLink || !inspection.activityId) continue;
    const activity = content.minigames.find(g => g.id === inspection.activityId && g.chapterId === state.chapterId);
    if (activity && (developer || matches(state, hotspot.condition) && matches(state, activity.condition)
      && !state.rewards.includes(activity.reward.onceKey ?? activity.reward.id))) return activity;
  }
}
