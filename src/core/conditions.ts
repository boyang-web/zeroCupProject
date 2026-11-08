import type { Condition, GameState, RuleOptions } from './contracts.ts';
export function canAccess(state: GameState, condition?: Condition, options: RuleOptions = {}) {
  return !!options.developer || matches(state, condition);
}
export function matches(state: GameState, condition?: Condition): boolean {
  if (!condition) return true;
  switch (condition.kind) {
    case 'flag': return state.flags.includes(condition.id);
    case 'clue': return state.clues.includes(condition.id);
    case 'reward': return state.rewards.includes(condition.id);
    case 'item': return (state.inventory[condition.id] ?? 0) >= (condition.count ?? 1);
    case 'metric': return (state.metrics[condition.id] ?? 0) >= condition.min;
    case 'quest': return state.quests[condition.id] === condition.status;
    case 'all': return condition.conditions.every(c => matches(state, c));
    case 'any': return condition.conditions.some(c => matches(state, c));
    case 'not': return !matches(state, condition.condition);
  }
}
