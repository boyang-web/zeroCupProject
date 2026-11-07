import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {createState,resolveEnding,transition} from '../src/core/engine.ts';
import {validateContent} from '../src/core/validate-content.ts';
import {act,choices,enterMorning,finishMorning,finishNoon,finishNight,morningDecision} from './helpers.ts';
test('five chapters and all scene/content references are valid',()=>{assert.equal(content.chapters.length,5);assert.deepEqual(validateContent(content),[]);});
test('locked travel, out-of-scene objects and unknown dialogue commands do not mutate state',()=>{
  const s=act(createState(content),{type:'start'});const copy=structuredClone(s);
  assert.equal(transition(s,{type:'travel'},content).changed,false);
  assert.equal(transition(s,{type:'choose',choiceId:'accept-commission'},content).changed,false);
  assert.equal(transition(s,{type:'inspect',hotspotId:'morning-note'},content).changed,false);assert.deepEqual(s,copy);
});
test('all twenty-seven shop outcome combinations can leave chapter four',()=>{
  const endings=new Set<string>();
  for(const a of ['trial','table','defer'] as const)for(const b of ['limit','counter','overload'] as const)for(const result of ['pickup','cancelled','missed'] as const){
    let s=finishNight(result,finishNoon(finishMorning(a),b));
    assert.equal(s.quests.morning,a==='defer'?'failed':'completed');assert.equal(s.quests.noon,b==='overload'?'failed':'completed');
    s=act(s,{type:'travel'});
    assert.equal(s.phase,'ending');assert.equal(s.chapterId,'epilogue');assert.deepEqual(s.visited,['arrival','morning','noon','night','epilogue']);endings.add(resolveEnding(s,content).id);
  }
  assert.equal(endings.size,3);
});
test('repeat inspection and minigames cannot farm rewards or alternative bag paths',()=>{
  let s=enterMorning();s=act(s,{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-listen','morning-thanks']);s=act(s,{type:'move',sceneId:'morning-kitchen'});
  s=act(s,{type:'inspect',hotspotId:'morning-note'});const before=s.metrics.listening;s=transition(s,{type:'inspect',hotspotId:'morning-note'},content).state;assert.equal(s.metrics.listening,before);
  s=act(s,{type:'interact',hotspotId:'cabinet',actionId:'borrow-with-key'});s=transition(s,{type:'interact',hotspotId:'cabinet',actionId:'borrow-by-asking'},content).state;assert.equal(s.inventory['insulated-bag'],1);
  s=act(s,{type:'move',sceneId:'morning-yard'});s=act(s,{type:'talk',hotspotId:'ning'});s=choices(s,['ning-ask-school','ning-school-close']);s=act(s,{type:'move',sceneId:'morning-kitchen'});
  const game={type:'finish-minigame' as const,gameId:'morning-game',result:{status:'completed' as const,score:90,assisted:false}};s=act(s,game);const after=s.metrics.listening;s=transition(s,game,content).state;assert.equal(s.metrics.listening,after);
});
test('borrowing by asking works without the key',()=>{
  let s=enterMorning();s.inventory['small-key']=0;s=act(s,{type:'talk',hotspotId:'morning-person'});s=choices(s,['morning-listen','morning-thanks']);s=act(s,{type:'move',sceneId:'morning-kitchen'});
  assert.equal(transition(s,{type:'interact',hotspotId:'cabinet',actionId:'borrow-with-key'},content).changed,false);
  s=act(s,{type:'interact',hotspotId:'cabinet',actionId:'borrow-by-asking'});assert.equal(s.inventory['insulated-bag'],1);
});
test('a recorded family decision cannot be reversed within the same branch',()=>{
  let s=choices(morningDecision(),['morning-later-plan','morning-overpromise']);s.dialogue={id:'morning-talk',nodeId:'sit-down'};
  assert.equal(transition(s,{type:'choose',choiceId:'morning-table-agree'},content).changed,false);assert.equal(s.quests.morning,'failed');
});
test('cancelled, unavailable and out-of-scene minigames do not award anything',()=>{
  const s=enterMorning();for(const result of [{status:'cancelled' as const},{status:'completed' as const,score:90,assisted:false}])assert.deepEqual(transition(s,{type:'finish-minigame',gameId:'morning-game',result},content).state,s);
});
test('cross-chapter notes need both chapters evidence',()=>{
  let s=act(finishMorning(),{type:'travel'});assert.ok(!s.achievements.includes('echo'));s=act(s,{type:'talk',hotspotId:'noon-person'});s=choices(s,['noon-listen','noon-thanks']);s=act(s,{type:'move',sceneId:'noon-kitchen'});s=act(s,{type:'inspect',hotspotId:'noon-note'});assert.ok(s.achievements.includes('echo'));
});
test('validation detects duplicate ids, cycles, missing references and bad sprites',()=>{
  const broken=structuredClone(content);broken.chapters[0].next='arrival';broken.chapters[0].asset='missing';broken.chapters[0].exit={kind:'flag',id:'missing-flag'};broken.dialogues[0].nodes[0].choices[0].next='absent';broken.items.push({...broken.items[0]});const text=validateContent(broken).join('\n');for(const word of ['循环','场景资产','absent','重复','missing-flag'])assert.ok(text.includes(word),word);
});
test('copy and art replacement do not alter domain transitions',()=>{
  const copy=structuredClone(content);copy.chapters[0].description='换过的文字';copy.assets[copy.chapters[0].asset].url='/new.png';assert.deepEqual(transition(createState(content),{type:'start'},content).state,transition(createState(copy),{type:'start'},copy).state);
});
test('side quests still register without engine modifications',()=>{
  const copy=structuredClone(content);copy.quests.push({id:'optional',chapterId:'arrival',autoStart:true,title:'看看窗外',text:'桂花开了。'});assert.deepEqual(validateContent(copy),[]);assert.equal(transition(createState(copy),{type:'start'},copy).state.quests.optional,'active');
});
