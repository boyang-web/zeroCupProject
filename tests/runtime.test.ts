import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {useGame} from '../src/runtime/useGame.ts';
import {choices,morningDecision} from './helpers.ts';
function memory(){const map=new Map<string,string>();return{getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};}
test('runtime saves before decision and loads a genuinely different branch',()=>{
  const game=useGame(content,memory());game.restore(choices(morningDecision(),['morning-later-plan']));
  assert.ok(game.dispatch({type:'choose',choiceId:'morning-overpromise'}));assert.equal(game.state.value.quests.morning,'failed');
  const checkpoint=game.saves.read('checkpoint');assert.ok(checkpoint.ok&&checkpoint.value);assert.equal(checkpoint.value.state.dialogue?.nodeId,'defer');assert.equal(checkpoint.value.state.decisions.morning,undefined);
  assert.ok(game.load('checkpoint'));game.dispatch({type:'choose',choiceId:'morning-reconsider'});game.dispatch({type:'choose',choiceId:'morning-table-agree'});assert.equal(game.state.value.quests.morning,'completed');
  const auto=game.saves.read('auto');assert.ok(auto.ok&&auto.value);assert.equal(auto.value.state.quests.morning,'completed');
});
test('storage failure preserves the current-session checkpoint and reports it',()=>{
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('full');},removeItem(){throw new Error('blocked');}};
  const game=useGame(content,blocked);game.restore(choices(morningDecision(),['morning-later-plan']));game.dispatch({type:'choose',choiceId:'morning-overpromise'});assert.match(game.message.value,/刷新前请导出/);assert.ok(game.load('checkpoint'));assert.equal(game.state.value.dialogue?.nodeId,'defer');
});
