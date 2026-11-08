import {test}from'node:test';
import assert from'node:assert/strict';
import{content}from'../src/content/index.ts';
import{matches}from'../src/core/conditions.ts';
import type{GameState,Hotspot}from'../src/core/contracts.ts';
import{act,choices,enterMorning,finishMorning,morningDecision}from'./helpers.ts';
const morning=content.chapters.find(c=>c.id==='morning')!;
const yard=morning.scenes!.find(s=>s.id==='morning-yard')!;
function bounds(h:Hotspot,state:GameState){const pose=h.variants?.find(v=>matches(state,v.condition));const w=pose?.width??h.sprite!.width,hg=pose?.height??h.sprite!.height,x=pose?.x??h.x,y=pose?.y??h.y;return{left:x-w/2,right:x+w/2,top:y-hg,bottom:y};}
function overlaps(a:ReturnType<typeof bounds>,b:ReturnType<typeof bounds>){return Math.min(a.right,b.right)-Math.max(a.left,b.left)>0.001&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0.001;}

test('new Chen papers and chalk stay separate from other props before, during and after every meal route',()=>{
  let papers=act(morningDecision(true),{type:'choose',choiceId:'morning-show-papers'});
  const stages=[enterMorning(),morningDecision(),papers,...(['trial','table','defer']as const).flatMap(kind=>{const end=finishMorning(kind);return[end,act(end,{type:'travel'})];})];
  for(const state of stages){
    const props=yard.hotspots.filter(h=>h.interaction.kind!=='dialogue'&&matches(state,h.condition));
    for(const id of ['ning-drawing','ning-chalk','morning-table-plan']){
      const prop=props.find(h=>h.id===id);if(!prop)continue;
      for(const other of props.filter(h=>h.id!==id))assert.equal(overlaps(bounds(prop,state),bounds(other,state)),false,`${id} overlaps ${other.id}: ${state.flags.join(',')}`);
    }
  }
});

test('Zhou customer slip occupies its own counter space and has a framing that follows it',()=>{
  const front=morning.scenes!.find(s=>s.id==='morning-front')!;
  const state=enterMorning(),slip=front.hotspots.find(h=>h.id==='morning-customer')!;
  const steamer=front.hotspots.find(h=>h.id==='front-steamer')!;
  assert.equal(overlaps(bounds(slip,state),bounds(steamer,state)),false);
  const view=front.camera!.views.find(v=>v.id===slip.cameraView)!;
  assert.ok(view);assert.ok(Math.abs(view.x-slip.x)<2);
});
