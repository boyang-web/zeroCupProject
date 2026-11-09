import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { transition, resolveEnding } from '../src/core/engine.ts';
import type { GameState } from '../src/core/contracts.ts';
import { decodeSave, createSaveRepository } from '../src/infrastructure/saves.ts';
import { epilogueRecords } from '../src/content/epilogue-records.ts';
import { epilogueGame } from '../src/content/chapters/epilogue.ts';
import { sceneOf } from '../src/core/scenes.ts';
import { featureUnlocked } from '../src/core/progression.ts';
import { isItineraryComplete, placeBookmark } from '../src/features/minigames/itinerary.ts';
import { act, choices, finishMorning, finishNoon, finishNight } from './helpers.ts';
const raw = (s: GameState) => JSON.stringify({format:'baiwei-save',version:1,savedAt:new Date().toISOString(),state:s});
test('night remains explorable before sleep; dawn has a distinct camera and cannot return to last night',()=>{
  for(const id of ['breakfast','call','book']) {
    let s=epilogueReady();s=act(s,{type:'close-dialogue'});
    const tableAsset=sceneOf(s,content).asset;
    s=act(s,{type:'move',sceneId:'epilogue-yard'});assert.notEqual(sceneOf(s,content).asset,tableAsset);
    s=act(s,{type:'move',sceneId:'epilogue-table'});s=act(s,{type:'talk',hotspotId:'epilogue-ticket'});
    s=choices(s,[`epilogue-confirm-${id}`,`epilogue-finish-${id}`]);
    assert.equal(transition(s,{type:'move',sceneId:'epilogue-yard'},content).changed,false);
    assert.equal(featureUnlocked(s,content,'revisit'),false);
    s=act(s,{type:'move',sceneId:'epilogue-gate'});
    assert.notEqual(sceneOf(s,content).asset,tableAsset);assert.equal(sceneOf(s,content).links.length,0);
    assert.equal(transition(s,{type:'move',sceneId:'epilogue-table'},content).changed,false);
    assert.equal(transition(s,{type:'revisit',chapterId:'arrival'},content).changed,false);
    const restored=decodeSave(raw(s),content);assert.ok(restored.ok);s=restored.value.state;
    assert.equal(s.sceneId,'epilogue-gate');assert.equal(resolveEnding(s,content).id,id);
    s=act(s,{type:'inspect',hotspotId:'epilogue-morning'});s=act(s,{type:'travel'});
    assert.equal(featureUnlocked(s,content,'revisit'),true);
  }
});
export function epilogueReady(previous = finishNight()) {
  let s = act(previous,{type:'travel'});
  s=act(s,{type:'talk',hotspotId:'epilogue-grandmother'});s=choices(s,['epilogue-sit']);
  s=act(s,{type:'move',sceneId:'epilogue-table'});
  for(const id of ['morning','noon','night'])s=act(s,{type:'inspect',hotspotId:`epilogue-page-${id}`});
  s=act(s,{type:'finish-minigame',gameId:'epilogue-filing',result:{status:'completed',score:100,assisted:false}});
  s=act(s,{type:'talk',hotspotId:'epilogue-table-grandma'});s=choices(s,['epilogue-reviewed']);
  s=act(s,{type:'talk',hotspotId:'epilogue-ticket'});return choices(s,['epilogue-times']);
}
test('all 27 local result combinations reach all 3 explicit endings, preserving shop facts and quests',()=>{
  for(const a of ['trial','table','defer'] as const)for(const b of ['limit','counter','overload'] as const)for(const c of ['pickup','cancelled','missed'] as const){
    const earlier=finishNight(c,finishNoon(finishMorning(a),b));
    const ready=epilogueReady(earlier);
    for(const id of ['breakfast','call','book']){
      let s=choices(ready,[`epilogue-confirm-${id}`]);
      const resumed=decodeSave(raw(s),content);assert.ok(resumed.ok,resumed.ok?'':resumed.error);
      s=act(resumed.value.state,{type:'close-dialogue'});s=act(s,{type:'talk',hotspotId:'epilogue-ticket'});
      assert.equal(s.dialogue?.nodeId,id);s=choices(s,[`epilogue-finish-${id}`]);
      s=act(s,{type:'move',sceneId:'epilogue-gate'});s=act(s,{type:'inspect',hotspotId:'epilogue-morning'});s=act(s,{type:'travel'});
      assert.equal(s.phase,'ending');assert.equal(resolveEnding(s,content).id,id);
      for(const q of ['morning','noon','night']) assert.equal(s.quests[q],earlier.quests[q]);
      assert.deepEqual(epilogueRecords(s),epilogueRecords(earlier));
      assert.ok(decodeSave(raw(s),content).ok);
    }
  }
});
test('no premature finish, no alternative ending after confirmation, and pre-choice saves restore the choice',()=>{
  const ready=epilogueReady();const storage=new Map<string,string>();const repo=createSaveRepository({getItem:k=>storage.get(k)??null,setItem:(k,v)=>{storage.set(k,v)},removeItem:k=>{storage.delete(k)}},content);
  repo.write('checkpoint',ready);const selected=choices(ready,['epilogue-confirm-call']);
  const forced={...selected,dialogue:{id:'epilogue-departure',nodeId:'options'}};
  assert.equal(transition(forced,{type:'choose',choiceId:'epilogue-confirm-breakfast'},content).changed,false);
  const loaded=repo.read('checkpoint');assert.ok(loaded.ok&&loaded.value);assert.ok(!loaded.value.state.decisions.epilogue);
  assert.equal(resolveEnding(choices(loaded.value.state,['epilogue-confirm-book']),content).id,'book');
  const blocked=act(finishNight(),{type:'travel'});
  assert.equal(blocked.phase,'playing');assert.equal(transition(blocked,{type:'travel'},content).changed,false);
  assert.equal(transition(blocked,{type:'move',sceneId:'epilogue-table'},content).changed,false);
  assert.equal(transition(blocked,{type:'finish-minigame',gameId:'epilogue-filing',result:{status:'completed',score:100,assisted:false}},content).changed,false);
});
test('filing is cancelable, once-only, supports assistance and all wrong arrangements fail validation',()=>{
  let s=epilogueReady();s=act(s,{type:'close-dialogue'});const before=structuredClone(s);
  assert.equal(transition(s,{type:'finish-minigame',gameId:'epilogue-filing',result:{status:'cancelled'}},content).changed,false);
  s=transition(s,{type:'finish-minigame',gameId:'epilogue-filing',result:{status:'completed',score:80,assisted:true}},content).state;
  assert.deepEqual(s,before);
  const plan=epilogueGame.itinerary!;
  const ids=plan.slips.map(s=>s.id);let complete=0;
  for(const a of ids)for(const b of ids)for(const c of ids){let placed={};for(const [i,id] of [a,b,c].entries())placed=placeBookmark(plan,placed,id,plan.slots[i]!.id);if(isItineraryComplete(plan,placed))complete++;}
  assert.equal(complete,1);
});
test('optional discoveries and borrowed bags do not gate endings; private memories are not silently discovered',()=>{
  const s=epilogueReady();assert.equal(s.inventory['insulated-bag']??0,0);assert.ok(!s.clues.includes('night-riceball'));
  assert.equal(transition(s,{type:'choose',choiceId:'epilogue-tell-riceball'},content).changed,false);
  const withMemory={...s,clues:[...s.clues,'night-riceball']};const told=choices(withMemory,['epilogue-tell-riceball']);assert.ok(told.flags.includes('epilogue-riceball-told'));
  assert.deepEqual(told.clues,withMemory.clues);
});
test('v5 automatic ending reopens only chapter five and old file remains unchanged',()=>{
  const current=act(finishNight(),{type:'travel'});const old=structuredClone(current);old.contentVersion=5;old.phase='ending';old.sceneId='epilogue-main';old.journey.sceneId='epilogue-main';old.seenScenes=old.seenScenes.map(s=>s==='epilogue-yard'?'epilogue-main':s);old.quests.epilogue='completed';
  const original=raw(old),loaded=decodeSave(original,content);assert.ok(loaded.ok,loaded.ok?'':loaded.error);
  assert.equal(loaded.value.state.phase,'playing');assert.equal(loaded.value.state.sceneId,'epilogue-yard');assert.equal(loaded.value.state.quests.epilogue,'active');
  assert.deepEqual(epilogueRecords(loaded.value.state),epilogueRecords(old));assert.deepEqual(old,JSON.parse(original).state);
});
