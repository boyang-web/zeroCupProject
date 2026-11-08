import type { Entry, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';
export function entryText(entry: Entry, state: GameState) {
  return entry.versions?.find(version => matches(state, version.condition))?.text ?? entry.text;
}
