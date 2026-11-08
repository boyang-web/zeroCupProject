import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content } from '../src/content/index.ts';
import { transition } from '../src/core/engine.ts';
import { matches } from '../src/core/conditions.ts';
import { scenesOf } from '../src/core/scenes.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { dialogueReadings } from '../src/presentation/dialogue-readings.ts';
import { entryText } from '../src/presentation/entry-text.ts';
import { ordersReady, packagingReady, type Serving } from '../src/features/minigames/breakfast.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { act, choices, enterMorning, finishMorning, finishNoon, morningDecision } from './helpers.ts';

const chapter=content.chapters.find(c=>c.id==='morning')!;
const rooms=scenesOf(chapter);
const father=content.dialogues.find(d=>d.id==='morning-talk')!;
const daughter=content.dialogues.find(d=>d.id==='ning-talk')!;
const game=content.minigames.find(g=>g.id==='morning-game')!;
const old=JSON.parse(readFileSync(new URL('./fixtures/morning-before-life-v2.json',import.meta.url),'utf8'));
function metBoth() {
  let s=act(enterMorning(),{type:'talk',hotspotId:'morning-person'});
  s=choices(s,['morning-listen','morning-thanks']);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-yard'});
  s=act(s,{type:'talk',hotspotId:'ning'});s=choices(s,['ning-ask-school','ning-school-close']);
  return act(s,{type:'move',sceneId:'morning-kitchen'});
}

test('the kitchen lesson is a real entry and cannot start cooking from another room or before meeting Ning',()=>{
  let s=act(enterMorning(),{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-listen','morning-thanks']);
  s=act(s,{type:'talk',hotspotId:'morning-person'});assert.equal(s.dialogue?.nodeId,'counter-busy');
  s=act(s,{type:'close-dialogue'});s=act(s,{type:'move',sceneId:'morning-kitchen'});
  assert.equal(matches(s,game.condition),false);
  s=act(s,{type:'talk',hotspotId:'chen-kitchen'});assert.equal(s.dialogue?.nodeId,'before-food');
  const denied=transition(s,{type:'choose',choiceId:'morning-return-stove'},content);
  assert.deepEqual(denied.state,s);
  s=metBoth();s=act(s,{type:'talk',hotspotId:'chen-kitchen'});
  const wrongRoom={...s,sceneId:'morning-front'};
  assert.deepEqual(transition(wrongRoom,{type:'choose',choiceId:'morning-return-stove'},content).state,wrongRoom);
  const learned=act(s,{type:'choose',choiceId:'morning-return-stove'});
  assert.equal(learned.dialogue,null);assert.ok(matches(learned,game.condition));
  assert.ok(matches(learned,{kind:'reward',id:'morning-return-stove'}));
  assert.equal(learned.rewards.filter(id=>id==='morning-return-stove').length,1);
});

test('the five buns include Xiaoman and the serving check requires separate bags and Chens bowl',()=>{
  const plan=game.breakfast!,servings:Record<string,Serving>={};
  assert.equal(plan.orders.reduce((n,o)=>n+o.count,0),5);
  assert.equal(plan.orders.find(o=>o.id==='xiaoman')?.filling,'鲜肉');
  for(const order of plan.orders)servings[order.id]={filling:order.filling,count:order.count};
  assert.ok(ordersReady(plan,servings));
  assert.equal(ordersReady(plan,{...servings,chen:{filling:'青菜',count:1}}),false);
  assert.equal(packagingReady(plan,{}),false);
  assert.equal(packagingReady(plan,{zhou:'one-bag',chen:'bowl'}),false);
  assert.equal(packagingReady(plan,{zhou:'two-bags',chen:'bag'}),false);
  assert.ok(packagingReady(plan,{zhou:'two-bags',chen:'bowl'}));
});

test('reading the ledger does not show it to Ning until the player chooses to put both papers together',()=>{
  let s=morningDecision(true);
  const ledger=rooms.find(r=>r.id==='morning-yard')!.hotspots.find(h=>h.id==='chen-bus-note')!;
  assert.equal(ledger.variants?.find(v=>matches(s,v.condition)),undefined);
  s=act(s,{type:'close-dialogue'});s=act(s,{type:'inspect',hotspotId:'chen-bus-note'});
  assert.equal(s.flags.includes('morning-papers-shared'),false);
  s=act(s,{type:'talk',hotspotId:'chen-yard'});s=act(s,{type:'choose',choiceId:'morning-show-papers'});
  assert.ok(s.flags.includes('morning-papers-shared'));
  assert.equal(ledger.variants?.find(v=>matches(s,v.condition))?.asset,'morning-ledger-flat');
});

test('an interrupted family ending resumes its last scene and then clears the breakfast table',()=>{
  let s=choices(morningDecision(true),['morning-show-papers','morning-let-father-answer','morning-let-ning-answer','morning-agree']);
  s=act(s,{type:'close-dialogue'});s=act(s,{type:'talk',hotspotId:'chen-yard'});
  assert.equal(s.dialogue?.nodeId,'trial-end');
  s=act(s,{type:'choose',choiceId:'morning-trial-close'});
  assert.ok(s.flags.includes('morning-meal-cleared'));
  const yard=rooms.find(r=>r.id==='morning-yard')!;
  assert.equal(matches(s,yard.decorations!.find(d=>d.id==='family-breakfast')!.condition),false);
  assert.ok(matches(s,rooms.find(r=>r.id==='morning-front')!.hotspots.find(h=>h.id==='front-trial-plan')!.condition));
});

test('each family route has its own Ning followup and later visits stop asking whether Qin is the next stop',()=>{
  for(const route of ['trial','table','defer']as const){
    let s=finishMorning(route);const node=daughter.nodes.find(n=>n.id==='after')!;
    const initial=node.versions!.find(v=>matches(s,v.condition))!;
    assert.deepEqual(dialogueReadings(node,s).map(b=>b.text).join(''),initial.beats.map(b=>b.text).join(''));
    const text=dialogueReadings(node,s).map(b=>b.text).join('');
    assert.ok(text.includes(route==='trial'?'头一笼先照旧':route==='table'?'没把试三天定完':'表我没撕'),route);
    s=act(s,{type:'travel'});
    const laterText=dialogueReadings(node,s).map(b=>b.text).join('');
    assert.ok(!laterText.includes('你待会儿去琴记'));
    assert.ok(laterText.includes('你下回顺路'));
  }
});

test('the journal distinguishes formal sample trials, looking at one sample, and an unagreed plan',()=>{
  const record=content.clues.find(c=>c.id==='morning-record')!,unfinished=content.clues.find(c=>c.id==='morning-unfinished')!;
  const trial=entryText(record,finishMorning());assert.ok(trial.includes('第一笼照旧，第二笼试'));
  const meal=entryText(record,finishMorning('table'));assert.ok(meal.includes('还没答应正式试三天'));assert.ok(!meal.includes('账本最后一页'));
  const deferred=entryText(unfinished,finishMorning('defer'));assert.ok(deferred.includes('今天送面的事没谈成'));
});

test('the lunchbox message is optional, learned from Ning and usable when talking to Qin',()=>{
  const fresh=act(finishMorning('table'),{type:'travel'});
  const opening=content.dialogues.find(d=>d.id==='noon-talk')!.nodes.find(n=>n.id==='opening')!;
  const option=opening.choices.find(c=>c.id==='noon-pass-ning-message')!;
  assert.equal(matches(fresh,option.condition),false);
  let s=finishMorning('table');s=act(s,{type:'talk',hotspotId:'ning'});s=act(s,{type:'choose',choiceId:'ning-after-bye'});
  assert.ok(s.clues.includes('ning-lunchbox'));
  s=act(s,{type:'travel'});s=act(s,{type:'talk',hotspotId:'noon-person'});s=act(s,{type:'choose',choiceId:'noon-pass-ning-message'});
  assert.equal(s.dialogue?.nodeId,'ning-lunchbox');
});

test('six genuine earlier v5 saves preserve all progress and their original dialogue cursor',()=>{
  for(const envelope of Object.values(old)){
    const result=decodeSave(JSON.stringify(envelope),content);assert.ok(result.ok);
    if(result.ok)assert.deepEqual(result.value.state,(envelope as {state:unknown}).state);
  }
  const lesson=decodeSave(JSON.stringify(old.lesson),content);assert.ok(lesson.ok);
  if(!lesson.ok)return;
  let s=act(lesson.value.state,{type:'close-dialogue'});
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-yard'});
  s=act(s,{type:'talk',hotspotId:'ning'});s=choices(s,['ning-ask-school','ning-school-close']);
  s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'talk',hotspotId:'chen-kitchen'});s=act(s,{type:'choose',choiceId:'morning-return-stove'});
  assert.ok(matches(s,game.condition));
});

test('a message learned on a later Chen revisit can be delivered after every noon ending without changing that decision',()=>{
  for(const outcome of ['limit','counter','overload']as const){
    let s=finishNoon(finishMorning(),outcome);const decision=s.decisions.noon;
    s=act(s,{type:'revisit',chapterId:'morning'});s=act(s,{type:'move',sceneId:'morning-kitchen'});s=act(s,{type:'move',sceneId:'morning-yard'});
    s=act(s,{type:'talk',hotspotId:'ning'});s=act(s,{type:'choose',choiceId:'ning-take-lunchbox-message'});s=act(s,{type:'resume-journey'});
    s=act(s,{type:'talk',hotspotId:'noon-person'});
    const node=content.dialogues.find(d=>d.id==='noon-talk')!.nodes.find(n=>n.id===s.dialogue!.nodeId)!;
    const option=node.choices.find(c=>c.id.startsWith('noon-pass-ning-message'))!;
    assert.ok(option);assert.ok(matches(s,option.condition));
    s=act(s,{type:'choose',choiceId:option.id});s=act(s,{type:'choose',choiceId:'noon-ning-lunchbox-close'});
    assert.equal(s.decisions.noon,decision);
    s=act(s,{type:'talk',hotspotId:'noon-person'});
    assert.equal(matches(s,option.condition),false);
  }
});

test('the new activity, explicit scene entry, record versions and packaging references are validated',()=>{
  const pack=structuredClone(content);
  pack.dialogues.find(d=>d.id==='morning-talk')!.nodes.find(n=>n.id==='before-food')!.choices.find(c=>c.id==='morning-return-stove')!.activityId='missing-game';
  const teacher=pack.chapters.find(c=>c.id==='morning')!.scenes!.find(s=>s.id==='morning-kitchen')!.hotspots.find(h=>h.id==='chen-kitchen')!;
  if(teacher.interaction.kind==='dialogue')teacher.interaction.entry='missing-node';
  pack.clues.find(c=>c.id==='morning-record')!.versions![0]!.condition={kind:'reward',id:'missing-reward'};
  pack.minigames.find(g=>g.id==='morning-game')!.breakfast!.packaging![0]!.expected='missing-bag';
  const errors=validateContent(pack).join('\n');
  for(const expected of ['missing-game','对白入口不存在','missing-reward','missing-bag'])assert.ok(errors.includes(expected),expected);
});
