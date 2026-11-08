import type { MinigameDefinition } from '../../core/contracts.ts';
export type Breakfast = NonNullable<MinigameDefinition['breakfast']>;
export interface Serving { filling: string; count: number }
export function addBun(plan: Breakfast, servings: Record<string, Serving>, orderId: string, filling: string) {
  if (!plan.orders.some(o => o.id === orderId) || !plan.fillings.includes(filling)) return servings;
  const previous = servings[orderId];
  return { ...servings, [orderId]: { filling, count: previous?.filling === filling ? Math.min(3, previous.count + 1) : 1 } };
}
export function ordersReady(plan: Breakfast, servings: Record<string, Serving>) {
  return plan.orders.every(o => servings[o.id]?.filling === o.filling && servings[o.id]?.count === o.count);
}
export function steamReady(heat: number) { return Number.isFinite(heat) && heat >= 60 && heat <= 85; }
export function packagingReady(plan: Breakfast, choices: Record<string, string>) {
  return (plan.packaging ?? []).every(task => choices[task.orderId] === task.expected);
}
