import type { MinigameDefinition } from '../../core/contracts.ts';
export type PackingPlan = NonNullable<MinigameDefinition['packing']>;
export interface PackedOrder { vessel: string; rice: boolean; tofu: boolean; sauce: string; utensils: string }
export function packingErrors(plan: PackingPlan, packed: Record<string, PackedOrder>, latched: boolean, insulation: string, hasBag: boolean): string[] {
  const errors: string[] = [];
  for (const order of plan.orders) {
    const p = packed[order.id];
    if (!p || p.vessel !== order.vessel) errors.push(`${order.person}那份的容器再看一下。`);
    if (!p?.rice || !p?.tofu) errors.push(`${order.person}那份还要核对米饭和豆腐烧菜。`);
    if (p?.sauce !== order.sauce) errors.push(`${order.person}那份的辣酱${order.sauce === 'cup' ? '要另放小杯' : '搁在碗沿'}。`);
    if (p?.utensils !== order.utensils) errors.push(`${order.person}的筷子放在${order.utensils === 'outside' ? '盒外' : '碗边'}。`);
  }
  if (!latched) errors.push('试扣一下盒盖，看看搭扣有没有扣好。');
  if (!['sleeve', ...(hasBag ? ['bag'] : [])].includes(insulation)) errors.push('选店里的保温套，或带来的保温袋。');
  return errors;
}
