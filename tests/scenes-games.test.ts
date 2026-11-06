import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {transition} from '../src/core/engine.ts';
import {scenesOf,hotspotsOf} from '../src/core/scenes.ts';
import {createSaveRepository,decodeSave} from '../src/infrastructure/saves.ts';
import {addBun,ordersReady,steamReady} from '../src/features/minigames/breakfast.ts';
import {placeTicket,serviceResult,suggestService} from '../src/features/minigames/service.ts';
import {act,choices,enterMorning,finishMorning,finishNoon,morningDecision,noonDecision} from './helpers.ts';

test('movement only follows open links and cannot click a different rooms objects',()=>{
  let s=enterMorning();assert.equal(s.sceneId,'morning-front');
  assert.equal(transition(s,{type:'move',sceneId:'morning-yard'},content).changed,false);
  assert.equal(transition(s,{type:'move',sceneId:'morning-kitchen'},content).changed,false);
  assert.equal(transition(s,{type:'inspect',hotspotId:'school-letter'},content).changed,false);
  s=act(s,{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-listen','morning-thanks']);s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-yard'});
  assert.ok(s.seenScenes.includes('morning-front')&&s.seenScenes.includes('morning-kitchen')&&s.seenScenes.includes('morning-yard'));
  assert.equal(transition(s,{type:'finish-minigame',gameId:'morning-game',result:{status:'completed',score:100,assisted:false}},content).changed,false);
});
test('the three family endings are reachable and the quiet table path needs no collected clues',()=>{
  for(const path of ['trial','table','defer'] as const){const s=finishMorning(path);assert.equal(s.quests.morning,path==='defer'?'failed':'completed');assert.ok(s.flags.includes(`morning-${path==='trial'?'plan':path}`));if(path==='table')assert.ok(!s.clues.includes('schedule')&&!s.clues.includes('bus-note'));}
});
test('the two-paper option needs evidence and enough of the conversation',()=>{
  const s=morningDecision(false);assert.equal(transition(s,{type:'choose',choiceId:'morning-show-papers'},content).changed,false);
  assert.ok(transition(morningDecision(true),{type:'choose',choiceId:'morning-show-papers'},content).changed);
});
test('the three noodle-shop endings remain local and all allow the journey to continue',()=>{
  for(const path of ['limit','counter','overload'] as const){const s=finishNoon(finishMorning('table'),path);assert.equal(s.quests.noon,path==='overload'?'failed':'completed');assert.equal(transition(s,{type:'travel'},content).state.chapterId,'night');}
});
test('noodle service cannot start before hearing all three people',()=>{
  let s=act(finishMorning(),{type:'travel'});s=act(s,{type:'talk',hotspotId:'noon-person'});s=choices(s,['noon-listen','noon-thanks']);s=act(s,{type:'move',sceneId:'noon-kitchen'});
  assert.equal(transition(s,{type:'finish-minigame',gameId:'noon-game',result:{status:'completed',score:100,assisted:false}},content).changed,false);
});
test('breakfast quantities and fillings support correction and the heat window is bounded',()=>{
  const plan=content.minigames.find(g=>g.id==='morning-game')!.breakfast!;let servings={};
  for(const order of plan.orders)for(let i=0;i<order.count;i++)servings=addBun(plan,servings,order.id,order.filling);
  assert.ok(ordersReady(plan,servings));assert.ok(!ordersReady(plan,addBun(plan,servings,'zhou','豆沙')));
  assert.ok(!steamReady(59));assert.ok(steamReady(60));assert.ok(steamReady(85));assert.ok(!steamReady(86));assert.ok(!steamReady(NaN));
});
test('service helper produces a feasible schedule, catches lateness and validates food notes',()=>{
  const plan=content.minigames.find(g=>g.id==='noon-game')!.service!;
  const queues=suggestService(plan);assert.ok(serviceResult(plan,queues,true,true).complete);
  assert.ok(!serviceResult(plan,[['inside','tian'],['delivery']],true,true).complete);
  assert.ok(!serviceResult(plan,queues,false,true).complete);assert.ok(!serviceResult(plan,queues,true,false).complete);
  assert.ok(!serviceResult(plan,[['tian','tian'],['inside','delivery']],true,true).complete);
  const moved=placeTicket(plan,queues,'tian',1);assert.equal(moved.flat().filter(id=>id==='tian').length,1);
  assert.deepEqual(placeTicket(plan,queues,'tian',.5),queues);
});
test('all new interactive objects are independent assets with valid scene placement',()=>{
  for(const c of content.chapters.slice(0,3))for(const h of hotspotsOf(c)){assert.ok(h.sprite,`${c.id}/${h.id}`);assert.ok(content.assets[h.sprite!.asset]);}
  for(const id of ['morning','noon'])assert.equal(scenesOf(content.chapters.find(c=>c.id===id)!).length,3);
});
test('every second and third chapter scene and local decision roundtrips without becoming another scene',()=>{
  const map=new Map<string,string>();const repo=createSaveRepository({getItem:k=>map.get(k)??null,setItem:(k,v)=>{map.set(k,v);},removeItem:k=>{map.delete(k);}},content);
  for(const s of [enterMorning(),morningDecision(),finishMorning(),noonDecision(),finishNoon()]){
    assert.ok(repo.write('manual-1',s).ok);const loaded=repo.read('manual-1');assert.ok(loaded.ok&&loaded.value);assert.equal(loaded.value.state.sceneId,s.sceneId);assert.deepEqual(loaded.value.state.decisions,s.decisions);
  }
});
test('previous first-chapter saves migrate explicitly while old main-chapter drafts restart safely',()=>{
  const s:any=enterMorning();s.schemaVersion=1;s.contentVersion=2;delete s.sceneId;delete s.seenScenes;
  const parsed=decodeSave(JSON.stringify({format:'baiwei-save',version:1,savedAt:new Date().toISOString(),state:s}),content);
  assert.ok(parsed.ok);assert.equal(parsed.value.state.schemaVersion,2);assert.equal(parsed.value.state.sceneId,'morning-front');assert.ok(parsed.value.state.flags.includes('entrusted'));assert.equal(parsed.value.state.quests.morning,'active');assert.ok(parsed.value.notice);
});
