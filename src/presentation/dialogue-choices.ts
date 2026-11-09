import type { Condition, DialogueNode, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';

function consumed(condition: Condition | undefined, state: GameState): boolean {
  if (!condition) return false;
  if (condition.kind === 'all') return condition.conditions.some(c => consumed(c, state));
  // These facts only accumulate in ordinary play. A negative prerequisite that
  // has become true marks a finished topic, rather than evidence still to find.
  return condition.kind === 'not' && ['clue','flag','reward'].includes(condition.condition.kind) && matches(state, condition.condition);
}
export function dialogueChoices(node: DialogueNode, state: GameState, developer = false) {
  return developer ? node.choices : node.choices.filter(choice => !consumed(choice.condition, state));
}
