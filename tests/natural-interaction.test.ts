import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { createState, transition } from '../src/core/engine.ts';
import { matches } from '../src/core/conditions.ts';
import { sceneOf } from '../src/core/scenes.ts';
import { directObjectAction } from '../src/presentation/object-actions.ts';
import { sceneRoutes } from '../src/presentation/scene-routes.ts';
import { dialogueReadings } from '../src/presentation/dialogue-readings.ts';
import { act, choices, enterMorning, completeArrival } from './helpers.ts';
import type { Hotspot } from '../src/core/contracts.ts';

test('a natural click moves the stool once and removes its original target', () => {
  let state = enterMorning();
  const stool = sceneOf(state, content).hotspots.find(h => h.id === 'front-stool')!;
  const action = directObjectAction(stool, state)!;
  assert.equal(action.id, 'move-stool');
  assert.equal(stool.drag?.actionId, action.id);
  state = act(state, { type: 'interact', hotspotId: stool.id, actionId: action.id });
  assert.equal(matches(state, stool.condition), false);
  assert.equal(directObjectAction(stool, state), undefined);
  assert.equal(transition(state, { type: 'interact', hotspotId: stool.id, actionId: action.id }, content).changed, false);
  const chen = sceneOf(state, content).hotspots.find(h => h.id === 'morning-person')!;
  assert.equal(chen.variants?.find(v => matches(state, v.condition))?.asset, 'chen-seated');
});

test('equivalent borrowing methods use the same transfer while genuine alternatives stay explicit', () => {
  let state = enterMorning();
  state = choices(act(state, { type: 'talk', hotspotId: 'morning-person' }), ['morning-listen', 'morning-thanks']);
  state = act(state, { type: 'move', sceneId: 'morning-kitchen' });
  const bag = sceneOf(state, content).hotspots.find(h => h.id === 'cabinet')!;
  const action = directObjectAction(bag, state)!;
  assert.equal(action.onceKey, 'borrow-bag');
  state = act(state, { type: 'interact', hotspotId: bag.id, actionId: action.id });
  assert.equal(state.inventory['insulated-bag'], 1);
  assert.equal(matches(state, bag.condition), false);
  assert.equal(directObjectAction(bag, state), undefined);
  const alternatives: Hotspot = { ...bag, interaction: {kind:'inspect',text:'',options:[
    {id:'give',label:'送走',effects:[{kind:'flag',id:'a'}]},
    {id:'keep',label:'留下',effects:[{kind:'flag',id:'b'}]},
  ]} };
  assert.equal(directObjectAction(alternatives, state), undefined);
  if (alternatives.interaction.kind === 'inspect') alternatives.interaction.options![1]!.condition = {kind:'flag',id:'not-yet'};
  assert.equal(directObjectAction(alternatives, state), undefined);
});

test('opening a letter, photograph or phone retains the actual reveal before granting its clue', () => {
  const state = act(createState(content), { type: 'start' });
  for (const id of ['letter', 'photo', 'phone', 'book']) {
    const hotspot = sceneOf(state, content).hotspots.find(h => h.id === id)!;
    assert.equal(directObjectAction(hotspot, state), undefined);
  }
});

test('the spool picked up in conversation stays on the table after interruption and reopening', () => {
  let state = choices(act(act(createState(content), { type: 'start' }), { type: 'talk', hotspotId: 'grandma' }), ['arrival-hungry']);
  const spool = sceneOf(state, content).hotspots.find(h => h.id === 'thread-spool')!;
  assert.equal(state.dialogue?.nodeId, 'home');
  assert.equal(matches(state, spool.completed), true);
  assert.equal(transition(state,{type:'interact',hotspotId:spool.id,actionId:'return-spool'},content).changed,false);
  const attention = state.metrics.attention;
  state = act(act(state, {type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});
  assert.equal(state.dialogue?.nodeId, 'home-resume');
  const resumed = content.dialogues.find(d => d.id === 'commission')!.nodes.find(n => n.id === state.dialogue?.nodeId)!;
  assert.ok(!dialogueReadings(resumed,state).some(b=>b.text.includes('本想自己捡')));
  state = act(state,{type:'choose',choiceId:'arrival-resume-remember'});
  assert.equal(state.dialogue?.nodeId, 'request');
  assert.equal(state.metrics.attention, attention);
});

test('edge routes contain one journey continuation and retain the current room on a home visit', () => {
  const first = act(createState(content), {type:'start'});
  assert.deepEqual(sceneRoutes(first,content,{canTravel:false,home:false}),[]);
  let state = act(completeArrival(),{type:'travel'});
  let routes = sceneRoutes(state,content,{canTravel:false,home:true});
  assert.equal(routes.filter(r=>r.id==='home').length,1);
  assert.equal(routes.find(r=>r.id==='home')!.side,'left');
  state = act(state,{type:'revisit',chapterId:'arrival'});
  routes = sceneRoutes(state,content,{canTravel:true,home:true});
  assert.equal(routes.filter(r=>r.kind==='travel').length,1);
  assert.equal(routes[0]!.id,'resume');
  assert.match(routes[0]!.label,/陈家.*店门口/);
  assert.equal(routes[0]!.side,'right');
});

test('an earlier interrupted greeting without the new placement flag still reaches its original pickup scene', () => {
  let state = choices(act(act(createState(content), {type:'start'}), {type:'talk',hotspotId:'grandma'}), ['arrival-ate']);
  state = {...state, flags:state.flags.filter(f=>f!=='arrival-spool-story')};
  state = act(act(state,{type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});
  assert.equal(state.dialogue?.nodeId,'home');
  state = act(state,{type:'choose',choiceId:'arrival-remember'});
  const spool = sceneOf(state,content).hotspots.find(h=>h.id==='thread-spool')!;
  assert.equal(matches(state,spool.completed),true);
});
