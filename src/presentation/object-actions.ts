import type { Action, GameState, Hotspot } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';

// A physical action with one outcome belongs to the object itself. Reading,
// opening and genuine alternatives retain their own view. Core grants rewards.
export function directObjectAction(hotspot: Hotspot, state: GameState, developer = false): Action | undefined {
  const inspection = hotspot.interaction;
  if (inspection.kind !== 'inspect' || inspection.manipulation || inspection.action || inspection.activityId || inspection.journalLink || inspection.exhibit) return;
  const options = inspection.options ?? [];
  const outcome = options[0];
  if (options.length > 1 && !options.every(action => action === outcome || outcome?.onceKey && action.onceKey === outcome.onceKey && JSON.stringify(action.effects) === JSON.stringify(outcome.effects))) return;
  const choices = options.filter(action =>
    !state.rewards.includes(action.onceKey ?? action.id) && (developer || matches(state, action.condition)));
  // Borrowing with a key or by asking are the same authorised transfer. Preserve
  // both saved action IDs, without asking the player to confirm it twice.
  return choices[0];
}
