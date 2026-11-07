import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { matches } from '../src/core/conditions.ts';
import { hotspotsOf } from '../src/core/scenes.ts';
import { transition } from '../src/core/engine.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { act, choices, finishMorning, finishNoon, noonDecision } from './helpers.ts';

const chapter = content.chapters.find(c=>c.id==='noon')!;
const rooms = chapter.scenes!;
const front = rooms.find(s=>s.id==='noon-front')!;
const allObjects = hotspotsOf(chapter);
const bowl = allObjects.find(h=>h.id==='untouched-bowl')!;

test('serving and ending the lunch changes the bowl, removes Tian and retains exactly one empty seat', () => {
  const before=act(finishMorning(),{type:'travel'});
  assert.equal(bowl.variants?.find(v=>matches(before,v.condition)),undefined);
  const served=act(noonDecision(),{type:'close-dialogue'});
  assert.equal(bowl.variants!.find(v=>matches(served,v.condition))!.asset,'plain-noodle');
  assert.ok(matches(served,allObjects.find(h=>h.id==='tian')!.condition));
  for(const ending of ['limit','counter','overload'] as const){
    const state=finishNoon(finishMorning(),ending);
    assert.equal(bowl.variants!.find(v=>matches(state,v.condition))!.asset,'noon-bowl-empty');
    assert.equal(matches(state,allObjects.find(h=>h.id==='tian')!.condition),false);
    assert.equal(front.decorations!.filter(d=>d.id==='tian-empty-seat'&&matches(state,d.condition)).length,1);
    const notes=content.clues.filter(c=>c.category==='life'&&state.clues.includes(c.id));
    assert.ok(notes.some(c=>c.id===(ending==='overload'?'noon-unfinished':'noon-record')));
  }
});

test('Chuan is at the cashier before service, at the front afterward, and returns to the cashier on a later visit', () => {
  const before=act(finishMorning(),{type:'travel'});
  const served=act(noonDecision(),{type:'close-dialogue'});
  const ended=finishNoon();
  const revisit=act(act(ended,{type:'travel'}),{type:'revisit',chapterId:'noon'});
  for(const[state,id]of [[before,'chuan'],[served,'chuan-front'],[ended,'chuan-front'],[revisit,'chuan']] as const){
    const people=allObjects.filter(h=>h.interaction.kind==='dialogue'&&h.interaction.dialogueId==='chuan-talk'&&matches(state,h.condition));
    assert.deepEqual(people.map(h=>h.id),[id]);
  }
});

test('the curtain conversation shares the original hearing reward and cannot grant listening twice', () => {
  let state=act(finishMorning(),{type:'travel'});
  state=act(state,{type:'inspect',hotspotId:'patched-curtain'});
  const before=state.metrics.research??0;
  state=act(state,{type:'talk',hotspotId:'tian'});
  state=choices(state,['tian-ask-curtain','tian-curtain-story-close','tian-order-close']);
  assert.ok(state.flags.includes('tian-heard'));assert.equal(state.metrics.research,before+1);
  state=act(state,{type:'talk',hotspotId:'tian'});state=choices(state,['tian-order-close']);
  assert.equal(state.metrics.research,before+1);assert.equal(state.rewards.filter(r=>r==='tian-listen').length,1);
});

test('Qins recipe followup works after every ending while preserving the recorded decision and once-only game reward', () => {
  for(const ending of ['limit','counter','overload'] as const){
    let state=finishNoon(finishMorning(),ending);
    const decisions=structuredClone(state.decisions);
    state=act(state,{type:'talk',hotspotId:'noon-person'});
    assert.equal(state.dialogue?.nodeId,'after-'+ending);
    state=choices(state,['noon-after-'+ending+'-recipe','noon-record-qin-recipe']);
    assert.ok(state.clues.includes('qin-recipe-tip'));assert.deepEqual(state.decisions,decisions);
    assert.equal(state.rewards.filter(r=>r==='noon-game-reward').length,1);
  }
});

test('Tian can still discuss the curtain when the player discovered it after hearing her order', () => {
  let state=act(finishMorning(),{type:'travel'});
  state=choices(act(state,{type:'talk',hotspotId:'tian'}),['tian-listen','tian-order-close']);
  const research=state.metrics.research;
  state=act(state,{type:'inspect',hotspotId:'patched-curtain'});
  state=act(state,{type:'talk',hotspotId:'tian'});
  assert.equal(state.dialogue?.nodeId,'break');
  state=choices(state,['tian-break-curtain','tian-curtain-story-close','tian-order-close']);
  assert.equal(state.metrics.research,research);assert.equal(state.rewards.filter(r=>r==='tian-listen').length,1);
});

test('tea cannot be served to Tian after departure and late bowl inspection cannot invent a missed error', () => {
  let state=finishNoon();
  const rewards=[...state.rewards];
  assert.equal(transition(state,{type:'interact',hotspotId:'window-cup',actionId:'pour-tian-tea'},content).changed,false);
  const inspection=transition(state,{type:'inspect',hotspotId:'untouched-bowl'},content);
  assert.equal(inspection.changed,false);state=inspection.state;
  assert.equal(state.clues.includes('wrong-bowl'),false);assert.deepEqual(state.rewards,rewards);
});

test('menu inscriptions reject missing image regions and more lines than the frame can hold', () => {
  const pack=structuredClone(content);
  pack.assets['noon-menu']!.inscription!.lines.push('第四行');
  delete pack.assets['noon-menu']!.region;
  assert.ok(validateContent(pack).some(e=>e.includes('图像上的文字')));
});
