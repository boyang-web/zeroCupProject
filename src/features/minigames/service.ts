import type { MinigameDefinition } from '../../core/contracts.ts';
export type ServicePlan = NonNullable<MinigameDefinition['service']>;
export function placeTicket(plan: ServicePlan, queues: string[][], ticketId: string, pot: number) {
  if (!plan.tickets.some(t => t.id === ticketId) || !Number.isSafeInteger(pot) || pot < 0 || pot >= plan.pots) return queues;
  const next = Array.from({length:plan.pots},(_,i)=>(queues[i]??[]).filter(id=>id!==ticketId)); next[pot].push(ticketId); return next;
}
export function serviceResult(plan: ServicePlan, queues: string[][], half: boolean, noScallion: boolean) {
  const errors: string[] = []; const seen = new Set<string>(); const finishTimes: Record<string,number> = {};
  if (queues.length !== plan.pots) errors.push('锅数不对。');
  for (const queue of queues) { let time=0; for(const id of queue) {
    const t=plan.tickets.find(t=>t.id===id); if(!t||seen.has(id)){errors.push('有一张单放重了。');continue;}
    seen.add(id);time+=t.cook;finishTimes[id]=time;
    if(time>t.deadline)errors.push(`${t.person}要等${time}分钟，赶不上。`);
    if(t.half&&!half)errors.push(`${t.person}要半份。`);
    if(t.noScallion&&!noScallion)errors.push(`${t.person}不放葱。`);
  }}
  if(seen.size!==plan.tickets.length)errors.push('还有单子没放进去。');
  return {complete:errors.length===0,errors,finishTimes};
}
export function suggestService(plan: ServicePlan) {
  const queues:string[][]=Array.from({length:plan.pots},()=>[]), loads=Array(plan.pots).fill(0);
  for(const t of [...plan.tickets].sort((a,b)=>a.deadline-b.deadline)){
    const i=loads.indexOf(Math.min(...loads));queues[i].push(t.id);loads[i]+=t.cook;
  }
  return queues;
}
