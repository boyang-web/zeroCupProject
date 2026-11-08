import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content } from '../src/content/index.ts';
import { createState, transition } from '../src/core/engine.ts';
import { matches } from '../src/core/conditions.ts';
import { hotspotsOf } from '../src/core/scenes.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { dialogueReadings } from '../src/presentation/dialogue-readings.ts';
import { entryText } from '../src/presentation/entry-text.ts';
import { act, choices, completeArrival, finishMorning, finishNoon, noonDecision } from './helpers.ts';
const arrival=content.chapters.find(c=>c.id==='arrival')!;
const noon=content.chapters.find(c=>c.id==='noon')!;
const game=content.minigames.find(g=>g.id==='noon-game')!;
const commission=content.dialogues.find(d=>d.id==='commission')!;
const qin=content.dialogues.find(d=>d.id==='noon-talk')!;
const old=JSON.parse(readFileSync(new URL('./fixtures/arrival-noon-before-life-v3.json',import.meta.url),'utf8')) as Record<string,Record<string,string>>;
const speech=(id:string,state:Parameters<typeof dialogueReadings>[1])=>dialogueReadings(commission.nodes.find(n=>n.id===id)!,state).map(b=>b.text).join('');
function metNoon(){
  let s=act(finishMorning(),{type:'travel'});
  s=choices(act(s,{type:'talk',hotspotId:'noon-person'}),['noon-listen','noon-thanks']);
  s=choices(act(s,{type:'talk',hotspotId:'tian'}),['tian-listen','tian-order-close']);
  s=act(s,{type:'move',sceneId:'noon-corner'});
  s=choices(act(s,{type:'talk',hotspotId:'chuan'}),['chuan-listen','chuan-ask-limit','chuan-count-close']);
  return act(s,{type:'move',sceneId:'noon-kitchen'});
}

test('the grocery slip is revealed by opening the book and domestic discoveries stay optional',()=>{
  const start=act(createState(content),{type:'start'});
  const slip=arrival.hotspots.find(h=>h.id==='grocery-slip')!;
  assert.equal(matches(start,slip.condition),false);
  assert.deepEqual(transition(start,{type:'inspect',hotspotId:'grocery-slip'},content).state,start);
  let s=completeArrival();assert.ok(!s.clues.includes('osmanthus-note'));
  assert.ok(matches(s,slip.condition));s=act(s,{type:'inspect',hotspotId:'grocery-slip'});
  s=choices(act(s,{type:'talk',hotspotId:'grandma'}),['arrival-osmanthus-question']);
  assert.equal(s.dialogue?.nodeId,'osmanthus');
  const left=act(act(s,{type:'close-dialogue'}),{type:'travel'});
  assert.equal(left.chapterId,'morning');assert.equal(left.inventory['baiwei-book'],1);
});

test('returning the spool changes its placement and the home scene without a second reward or a second fall',()=>{
  let s=act(createState(content),{type:'start'});
  s=act(s,{type:'interact',hotspotId:'thread-spool',actionId:'return-spool'});
  const spool=arrival.hotspots.find(h=>h.id==='thread-spool')!;
  assert.ok(spool.variants?.some(v=>matches(s,v.condition)));
  assert.equal(s.metrics.attention,1);
  assert.deepEqual(transition(s,{type:'interact',hotspotId:'thread-spool',actionId:'return-spool'},content).state,s);
  s=choices(act(s,{type:'talk',hotspotId:'grandma'}),['arrival-ate']);
  assert.match(speech('home',s),/已经搁在小几/);assert.doesNotMatch(speech('home',s),/滚过去/);
  s=act(s,{type:'choose',choiceId:'arrival-remember'});
  assert.deepEqual(transition(s,{type:'interact',hotspotId:'thread-spool',actionId:'return-spool'},content).state,s);
  const usual=completeArrival();assert.ok(matches(usual,spool.completed));
  assert.equal(transition(usual,{type:'interact',hotspotId:'thread-spool',actionId:'return-spool'},content).changed,false);
});

test('missed domestic conversations can be learned during an early home revisit without changing the journey',()=>{
  let s=act(completeArrival(),{type:'travel'});const anchor=structuredClone(s.journey);
  s=act(s,{type:'revisit',chapterId:'arrival'});
  for(const hotspotId of ['thread-spool','grocery-slip','phone'])s=act(s,{type:'inspect',hotspotId});
  for(const suffix of ['arrival-thread-question','arrival-osmanthus-question','arrival-draft-question']){
    s=act(s,{type:'talk',hotspotId:'grandma'});
    assert.equal(s.dialogue?.nodeId,'grandma-early-return');
    s=act(s,{type:'choose',choiceId:'grandma-early-return-'+suffix});
    assert.ok(['thread','osmanthus','phone-draft'].includes(s.dialogue!.nodeId));s=act(s,{type:'close-dialogue'});
  }
  s=act(s,{type:'resume-journey'});assert.deepEqual(s.journey,anchor);assert.equal(s.sceneId,anchor.sceneId);
});

test('opening breakfast responds to having eaten at home while keeping the default scene',()=>{
  const morning=content.dialogues.find(d=>d.id==='morning-talk')!.nodes.find(n=>n.id==='opening')!;
  const ate=act(completeArrival(),{type:'travel'});
  assert.match(dialogueReadings(morning,ate).map(b=>b.text).join(''),/吃了一点/);
  const hungry={...ate,rewards:ate.rewards.filter(r=>r!=='arrival-ate')};
  assert.ok(dialogueReadings(morning,hungry).some(b=>b.kind==='speech'&&b.speaker==='小满'&&b.text==='还没。'));
});

test('hearing only the wrong-door story does not invent the separate rice-wine conversation',()=>{
  let s=act(act(finishMorning(),{type:'travel'}),{type:'revisit',chapterId:'arrival'});
  s=act(s,{type:'inspect',hotspotId:'photo'});s=act(s,{type:'study-collection',entryId:'family-photo'});
  s=choices(act(s,{type:'talk',hotspotId:'grandma'}),['grandma-ask-photo-margin','grandma-photo-story-close']);
  const record=content.clues.find(c=>c.id==='grandma-first-page')!;
  const onlyNeighbor=entryText(record,s);assert.match(onlyNeighbor,/走错过门/);assert.doesNotMatch(onlyNeighbor,/米酒|煮糊/);
  s=choices(act(s,{type:'talk',hotspotId:'grandma'}),['grandma-ask-first-page','grandma-record-first-story']);
  const both=entryText(record,s);assert.match(both,/煮糊/);assert.match(both,/走错过门/);
});

test('new players must take the kitchen lesson even after hearing everyone or closing the old front explanation',()=>{
  let s=metNoon();assert.equal(matches(s,game.condition),false);
  assert.deepEqual(transition(s,{type:'finish-minigame',gameId:game.id,result:{status:'completed',score:100,assisted:false}},content).state,s);
  s=act(s,{type:'move',sceneId:'noon-front'});s=choices(act(s,{type:'talk',hotspotId:'noon-person'}),['noon-before-game-close']);
  assert.equal(matches(s,game.condition),false);
  s=act(s,{type:'move',sceneId:'noon-kitchen'});s=act(s,{type:'talk',hotspotId:'qin-kitchen'});
  assert.equal(s.dialogue?.nodeId,'before-service');
  const wrong={...s,sceneId:'noon-front'};
  assert.deepEqual(transition(wrong,{type:'choose',choiceId:'noon-service-start'},content).state,wrong);
  s=act(s,{type:'choose',choiceId:'noon-service-start'});
  assert.equal(s.dialogue,null);assert.ok(matches(s,game.condition));
  const cancelled=transition(s,{type:'finish-minigame',gameId:game.id,result:{status:'cancelled'}},content);
  assert.deepEqual(cancelled.state,s);assert.ok(!s.flags.includes('noon-played'));
});

test('the kitchen start refuses a missing customer conversation without granting its lesson reward',()=>{
  let s=act(finishMorning(),{type:'travel'});
  s=choices(act(s,{type:'talk',hotspotId:'noon-person'}),['noon-listen','noon-thanks']);
  s=act(s,{type:'move',sceneId:'noon-kitchen'});s=act(s,{type:'talk',hotspotId:'qin-kitchen'});
  assert.deepEqual(transition(s,{type:'choose',choiceId:'noon-service-start'},content).state,s);
  s=act(s,{type:'choose',choiceId:'noon-service-look'});
  assert.ok(s.rewards.includes('noon-service-look'));assert.equal(matches(s,game.condition),false);
});

test('Tians work slip opens a real question, uses the same listening reward and leaves with her',()=>{
  let s=act(finishMorning(),{type:'travel'});
  const slip=hotspotsOf(noon).find(h=>h.id==='tian-work-slip')!;
  assert.equal(matches(s,slip.condition),false);
  s=choices(act(s,{type:'talk',hotspotId:'tian'}),['tian-listen','tian-order-close']);
  const metric=s.metrics.research;
  s=act(s,{type:'inspect',hotspotId:'tian-work-slip'});s=act(s,{type:'talk',hotspotId:'tian'});
  s=choices(s,['tian-break-work','tian-work-close']);
  assert.equal(s.dialogue?.nodeId,'break');assert.equal(s.metrics.research,metric);
  assert.equal(s.rewards.filter(r=>r==='tian-listen').length,1);
  assert.equal(matches(finishNoon(),slip.condition),false);
});

test('a timing copy appears at the kitchen only after copying and does not move the original or farm rewards',()=>{
  let s=act(metNoon(),{type:'move',sceneId:'noon-corner'});
  const paper=hotspotsOf(noon).find(h=>h.id==='noon-timing-copy')!;
  assert.equal(matches(s,paper.condition),false);
  s=act(s,{type:'interact',hotspotId:'receipt-printer',actionId:'copy-noon-timing'});
  const rewards=[...s.rewards];s=act(s,{type:'interact',hotspotId:'receipt-printer',actionId:'copy-noon-timing'});
  assert.deepEqual(s.rewards,rewards);assert.ok(matches(s,paper.condition));
  assert.ok(hotspotsOf(noon).some(h=>h.id==='receipt-printer'&&matches(s,h.condition)));
  s=act(s,{type:'move',sceneId:'noon-kitchen'});
  assert.deepEqual(transition(s,{type:'inspect',hotspotId:'noon-timing-copy'},content).state,s);
  assert.equal(s.flags.filter(f=>f==='noon-timing-copy').length,1);
});

test('every interrupted noon ending resumes its final scene and its journal records the actual agreement',()=>{
  for(const kind of ['limit','counter','overload']as const){
    let s=noonDecision(finishMorning(),kind==='limit');
    s=choices(s,kind==='limit'?['noon-show-limit','noon-limit-ask-qin','noon-agree']:kind==='counter'?['noon-write-counter','noon-counter-agree']:['noon-promise-fast','noon-overpromise']);
    s=act(s,{type:'close-dialogue'});s=act(s,{type:'talk',hotspotId:'noon-person'});
    assert.equal(s.dialogue?.nodeId,kind==='limit'?'limited-end':kind+'-end');
    const record=kind==='limit'?'noon-limit-record':kind==='counter'?'noon-counter-record':'noon-overload-record';
    s=act(s,{type:'choose',choiceId:record});
    const text=entryText(content.clues.find(c=>c.id===(kind==='overload'?'noon-unfinished':'noon-record'))!,s);
    if(kind==='limit')assert.match(text,/试一周再对账/);
    if(kind==='counter'){assert.match(text,/接多少单留到晚上算/);assert.doesNotMatch(text,/手机改成两单/);}
    if(kind==='overload')assert.match(text,/后头没法说/);
    s=act(s,{type:'talk',hotspotId:'noon-person'});assert.equal(s.dialogue?.nodeId,'after-'+kind);
  }
});

test('tasting is optional, repeatable without extra reward and cannot replace the pending ending',()=>{
  let s=act(noonDecision(),{type:'close-dialogue'});s=act(s,{type:'move',sceneId:'noon-kitchen'});
  s=choices(act(s,{type:'talk',hotspotId:'noon-tasting'}),['noon-taste-close']);
  const decisions=structuredClone(s.decisions),metric=s.metrics.research;
  s=choices(act(s,{type:'talk',hotspotId:'noon-tasting'}),['noon-taste-close']);
  assert.equal(s.metrics.research,metric);assert.deepEqual(s.decisions,decisions);
  s=act(s,{type:'move',sceneId:'noon-front'});s=act(s,{type:'talk',hotspotId:'noon-person'});
  assert.equal(s.dialogue?.nodeId,'decision');
});

test('ten actual preceding v5 saves keep every stored field and the old explained service remains playable',()=>{
  for(const[name,slots]of Object.entries(old)){
    const raw=Object.values(slots)[0]!,decoded=decodeSave(raw,content);
    assert.ok(decoded.ok&&decoded.value,name);if(!decoded.ok||!decoded.value)continue;
    const state=decoded.value.state;assert.deepEqual(state,JSON.parse(raw).state,name);
    if(name==='explained'){assert.ok(!state.flags.includes('noon-life-lesson'));assert.ok(matches(state,game.condition));assert.ok(transition(state,{type:'finish-minigame',gameId:game.id,result:{status:'completed',score:100,assisted:false}},content).state.flags.includes('noon-played'));}
  }
});

test('service dialogue cannot reference a nonexistent ticket',()=>{
  const broken=structuredClone(content);broken.minigames.find(g=>g.id===game.id)!.service!.copy!.tickets.unknown='一张不存在的单';
  assert.ok(validateContent(broken).some(e=>e.includes('unknown')));
  assert.ok(qin.nodes.some(n=>n.id==='before-service'));
});
