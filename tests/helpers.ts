import type { GameState } from '../src/core/contracts.ts';
import { content } from '../src/content/index.ts';
import { createState, transition } from '../src/core/engine.ts';

export function reachArrivalApproach() {
  let s = transition(createState(content), { type: 'start' }, content).state;
  s = transition(s, { type: 'talk', hotspotId: 'grandma' }, content).state;
  for (const choiceId of ['arrival-ate', 'arrival-remember', 'arrival-ready']) s = transition(s, { type: 'choose', choiceId }, content).state;
  return s;
}
export function completeArrival(approach = 'accept-commission'): GameState {
  let s = reachArrivalApproach();
  for (const choiceId of [approach, 'arrival-set-off']) s = transition(s, { type: 'choose', choiceId }, content).state;
  s = transition(s, { type: 'inspect', hotspotId: 'book' }, content).state;
  return transition(s, { type: 'finish-minigame', gameId: 'arrival-route', result: { status: 'completed', score: 100, assisted: false } }, content).state;
}
export function act(s: GameState, command: import('../src/core/contracts.ts').Command) {
  const result=transition(s,command,content);
  if(!result.changed&&result.message!=='没有新的变化。')throw new Error(`${JSON.stringify(command)}: ${result.message}`);
  return result.state;
}
export function choices(s:GameState,ids:string[]){for(const choiceId of ids)s=act(s,{type:'choose',choiceId});return s;}
export function enterMorning(){return act(completeArrival(),{type:'travel'});}
export function morningDecision(deep=false){
  let s=enterMorning();s=act(s,{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-listen','morning-thanks']);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});
  if(deep)s=act(s,{type:'inspect',hotspotId:'morning-note'});
  s=act(s,{type:'move',sceneId:'morning-yard'});
  if(deep)s=act(s,{type:'inspect',hotspotId:'chen-bus-note'});
  s=act(s,{type:'talk',hotspotId:'ning'});s=choices(s,['ning-ask-school',...(deep?['ning-ask-plan','ning-plan-close']:['ning-school-close'])]);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'talk',hotspotId:'chen-kitchen'});s=act(s,{type:'choose',choiceId:'morning-return-stove'});s=act(s,{type:'finish-minigame',gameId:'morning-game',result:{status:'completed',score:90,assisted:false}});
  s=act(s,{type:'move',sceneId:'morning-yard'});s=act(s,{type:'talk',hotspotId:'ning'});s=choices(s,['ning-ready-bye']);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-front'});s=act(s,{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-invite']);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-yard'});return act(s,{type:'talk',hotspotId:'chen-yard'});
}
export function finishMorning(kind:'trial'|'table'|'defer'='trial'){
  let s=morningDecision(kind==='trial');
  s=choices(s,kind==='trial'?['morning-show-papers','morning-let-father-answer','morning-let-ning-answer','morning-agree','morning-trial-close']:kind==='table'?['morning-table-first','morning-table-agree','morning-table-close']:['morning-later-plan','morning-overpromise','morning-defer-close']);
  return s;
}
export function noonDecision(previous=finishMorning(),deep=false){
  let s=act(previous,{type:'travel'});s=act(s,{type:'talk',hotspotId:'noon-person'});s=choices(s,['noon-listen','noon-thanks']);
  s=act(s,{type:'talk',hotspotId:'tian'});s=choices(s,['tian-listen','tian-order-close']);
  s=act(s,{type:'move',sceneId:'noon-corner'});s=act(s,{type:'talk',hotspotId:'chuan'});s=choices(s,['chuan-listen','chuan-ask-limit','chuan-count-close']);
  if(deep){s=act(s,{type:'inspect',hotspotId:'receipt-printer'});s=act(s,{type:'inspect',hotspotId:'order-phone'});}
  s=act(s,{type:'move',sceneId:'noon-kitchen'});s=act(s,{type:'talk',hotspotId:'qin-kitchen'});s=choices(s,['noon-service-start']);s=act(s,{type:'finish-minigame',gameId:'noon-game',result:{status:'completed',score:90,assisted:false}});
  s=act(s,{type:'move',sceneId:'noon-front'});return act(s,{type:'talk',hotspotId:'noon-person'});
}
export function finishNoon(previous=finishMorning(),kind:'limit'|'counter'|'overload'='limit'){
  return choices(noonDecision(previous,kind==='limit'),kind==='limit'?['noon-show-limit','noon-limit-ask-qin','noon-agree','noon-limit-record']:kind==='counter'?['noon-write-counter','noon-counter-agree','noon-counter-record']:['noon-promise-fast','noon-overpromise','noon-overload-record']);
}
export function nightCounterReady(previous=finishNoon()) {
  let s=act(previous,{type:'travel'});
  s=act(s,{type:'talk',hotspotId:'night-person'});s=choices(s,['night-listen','night-thanks']);
  s=act(s,{type:'talk',hotspotId:'night-luo'});s=choices(s,['night-luo-order']);
  s=act(s,{type:'interact',hotspotId:'night-table',actionId:'night-wipe'});
  s=act(s,{type:'move',sceneId:'night-kitchen'});s=act(s,{type:'inspect',hotspotId:'night-phone'});
  s=act(s,{type:'finish-minigame',gameId:'night-game',result:{status:'completed',score:100,assisted:false}});
  return act(s,{type:'move',sceneId:'night-counter'});
}
export function nightDecision(previous=finishNoon()) {
  let s=act(nightCounterReady(previous),{type:'talk',hotspotId:'night-handoff-clip'});
  return choices(s,['night-xu-let-luo-leave','night-luo-leave']);
}
export function finishNight(kind:'pickup'|'cancelled'|'missed'='pickup',previous=finishNoon()) {
  let s=nightDecision(previous);
  s=choices(s,kind==='pickup'?['night-agree','night-pass-box','night-pickup-record','night-lock-up','night-farewell']:kind==='cancelled'?['night-cancel','night-cancel-record','night-fold-xu-note','night-farewell']:['night-overpromise','night-missed-record','night-fold-xu-note','night-farewell']);
  return s;
}
