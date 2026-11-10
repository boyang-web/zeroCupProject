import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {createState} from '../src/core/engine.ts';
import {discoveryNotice} from '../src/presentation/discovery-notice.ts';
import {act,morningDecision} from './helpers.ts';

test('finishing the bun lesson announces Chen buns and selects its page instead of the known rice wine',()=>{
  const served=morningDecision();
  const game=content.minigames.find(g=>g.id==='morning-game')!;
  const before={...served,dialogue:null,sceneId:'morning-kitchen',journey:{chapterId:'morning',sceneId:'morning-kitchen'},flags:served.flags.filter(f=>f!=='morning-played'),rewards:served.rewards.filter(r=>r!==(game.reward.onceKey??game.reward.id))};
  const after=act(before,{type:'finish-minigame',gameId:'morning-game',result:{status:'completed',score:90,assisted:false}});
  assert.ok(before.clues.includes('book'));
  assert.deepEqual(discoveryNotice(before,after,content),{entryId:'chen-buns',title:'陈家包子',text:'食谱添了一页'});
  assert.equal(discoveryNotice(after,act(after,{type:'move',sceneId:'morning-yard'}),content),undefined);
});

test('continuing a breakfast save never presents old recipes as newly learned',()=>{
  const title=createState(content),continued=morningDecision();
  assert.equal(discoveryNotice(title,continued,content),undefined);
});

test('reading the old book for the first time still announces rice wine in chapter one',()=>{
  const before=act(createState(content),{type:'start'});
  const after=act(before,{type:'inspect',hotspotId:'book'});
  assert.equal(discoveryNotice(before,after,content)?.entryId,'osmanthus-rice');
});
