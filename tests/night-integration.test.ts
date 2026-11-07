import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content } from '../src/content/index.ts';
import type { GameState } from '../src/core/contracts.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { act,choices } from './helpers.ts';

type Fixture={format:string;version:number;savedAt:string;state:GameState};
const local:Record<string,Fixture>=JSON.parse(readFileSync(new URL('./fixtures/local-v4-before-night.json',import.meta.url),'utf8'));
const remote:Record<string,Fixture>=JSON.parse(readFileSync(new URL('./fixtures/remote-v5-night.json',import.meta.url),'utf8'));
function load(fixture:Fixture){
 const result=decodeSave(JSON.stringify(fixture),content);
 assert.ok(result.ok,result.ok?'':result.error);
 return result.value.state;
}

test('actual local v4 noon evidence survives migration with every choice, recipe and reward intact',()=>{
 const fixture=local.noonEvidence!,expected=structuredClone(fixture.state);
 expected.contentVersion=5;
 const state=load(fixture);
 assert.deepEqual(state,expected);
 assert.ok(state.clues.includes('tian-curtain') && state.clues.includes('qin-recipe-tip'));
 assert.equal(fixture.state.contentVersion,4);
});

test('a local v4 new dialogue cursor resumes its authored recipe route and cannot farm its reward',()=>{
 let state=load(local.noonDialogue!);
 assert.deepEqual(state.dialogue,{id:'noon-talk',nodeId:'after-limit'});
 const decision=structuredClone(state.decisions),metrics=structuredClone(state.metrics);
 state=choices(state,['noon-after-limit-recipe','noon-record-qin-recipe']);
 const rewards=[...state.rewards];
 state=act(state,{type:'talk',hotspotId:'noon-person'});
 state=choices(state,['noon-after-limit-recipe','noon-record-qin-recipe']);
 assert.deepEqual(state.rewards,rewards);
 assert.deepEqual(state.decisions,decision);assert.deepEqual(state.metrics,metrics);
});

test('an actual v4 early home visit keeps its new dialogue, phone evidence and original journey',()=>{
 let state=load(local.earlyHome!);
 assert.deepEqual(state.dialogue,{id:'commission',nodeId:'grandma-early-return'});
 assert.ok(state.clues.includes('job-gap'));
 const anchor=structuredClone(state.journey);
 state=act(state,{type:'close-dialogue'});state=act(state,{type:'resume-journey'});
 assert.equal(state.chapterId,anchor.chapterId);assert.equal(state.sceneId,anchor.sceneId);
 assert.equal(state.quests.morning,'active');
});

test('actual short-night v4 progress restarts only that chapter and preserves completed earlier chapters',()=>{
 const previous=local.shortActive!.state,state=load(local.shortActive!);
 assert.equal(state.sceneId,'night-front');assert.equal(state.dialogue,null);
 assert.equal(state.quests.night,'active');assert.equal(state.metrics.care,0);
 assert.ok(state.clues.includes('late-note'));
 for(const id of ['morning','noon'])assert.equal(state.quests[id],previous.quests[id]);
 assert.deepEqual(state.decisions.noon,previous.decisions.noon);
 assert.ok(!state.flags.some(f=>f.startsWith('night-')));
});

test('a completed local v4 night preserves its outcome without inventing the new handoff or private notes',()=>{
 const previous=local.shortFinished!.state,state=load(local.shortFinished!);
 assert.equal(state.quests.night,previous.quests.night);
 assert.equal(state.decisions.night,previous.decisions.night);
 assert.ok(state.flags.includes('night-legacy') && state.flags.includes('night-ended'));
 assert.ok(!state.flags.includes('night-pickup') && !state.flags.includes('night-arrived'));
 assert.ok(!state.clues.some(c=>c.startsWith('night-private-')));
 assert.equal(act(state,{type:'travel'}).chapterId,'epilogue');
});

test('remote v5 pickup progress and all three finished routes remain byte-for-byte equivalent as game states',()=>{
 for(const [id,fixture] of Object.entries(remote)) assert.deepEqual(load(fixture),fixture.state,id);
 let state=load(remote.pendingPickup!);
 state=choices(state,['night-pickup-record','night-lock-up','night-farewell']);
 assert.ok(state.flags.includes('night-ended') && state.flags.includes('night-pickup'));
});

test('migration still rejects invented records in a genuine local v4 save',()=>{
 const altered=structuredClone(local.noonEvidence!);altered.state.clues.push('made-up-record');
 assert.equal(decodeSave(JSON.stringify(altered),content).ok,false);
});
