import type { MinigameDefinition } from '../../core/contracts.ts';
export type Itinerary = NonNullable<MinigameDefinition['itinerary']>;
export function placeBookmark(plan: Itinerary, placements: Record<string, string>, slipId: string, slotId: string) {
  if (!plan.slips.some(s => s.id === slipId) || !plan.slots.some(s => s.id === slotId)) return placements;
  const next = Object.fromEntries(Object.entries(placements).filter(([slot, slip]) => slot !== slotId && slip !== slipId));
  next[slotId] = slipId; return next;
}
export function isItineraryComplete(plan: Itinerary, placements: Record<string, string>) {
  return Object.keys(placements).length === plan.slots.length && plan.slips.every(s => placements[s.slot] === s.id);
}
