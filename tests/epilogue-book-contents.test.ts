import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {transition} from '../src/core/engine.ts';
import {act,choices,finishNight} from './helpers.ts';

test('the three original shop pages are contained in the table book; ticket waits for grandmas invitation',()=>{
  let s=act(finishNight(),{type:'travel'});
  s=choices(act(s,{type:'talk',hotspotId:'epilogue-grandmother'}),['epilogue-sit']);
  s=act(s,{type:'move',sceneId:'epilogue-table'});
  const scene=content.chapters.find(c=>c.id==='epilogue')!.scenes!.find(s=>s.id==='epilogue-table')!;
  const book=scene.hotspots.find(h=>h.id==='epilogue-open-book')!;
  assert.equal(book.interaction.kind,'inspect');
  if(book.interaction.kind!=='inspect')return;
  assert.deepEqual(book.interaction.contents,['epilogue-page-morning','epilogue-page-noon','epilogue-page-night']);
  assert.ok(!scene.decorations?.some(d=>d.id===book.id));
  assert.equal(transition(s,{type:'talk',hotspotId:'epilogue-ticket'},content).changed,false);
  for(const id of book.interaction.contents!)s=act(s,{type:'inspect',hotspotId:id});
  for(const id of ['morning','noon','night'])assert.ok(s.flags.includes(`epilogue-read-${id}`));
  s=act(s,{type:'finish-minigame',gameId:'epilogue-filing',result:{status:'completed',score:100,assisted:false}});
  assert.equal(transition(s,{type:'talk',hotspotId:'epilogue-ticket'},content).changed,false);
  s=choices(act(s,{type:'talk',hotspotId:'epilogue-table-grandma'}),['epilogue-reviewed']);
  assert.equal(act(s,{type:'talk',hotspotId:'epilogue-ticket'}).dialogue?.nodeId,'ticket');
});
