import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';

const yard=content.chapters.find(c=>c.id==='morning')!.scenes!.find(s=>s.id==='morning-yard')!;
type Box={left:number;right:number;top:number;bottom:number};
const overlap=(a:Box,b:Box)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const bounds=(x:number,y:number,width:number,height:number):Box=>({left:x-width/2,right:x+width/2,top:y-height,bottom:y});
// Occupied pixels in the unchanged 1671×941 yard background, in scene percent.
const fixed:Record<string,Box>={
  'left bowl':{left:60.5,right:64.3,top:59.2,bottom:63.4},
  'right bowl':{left:72.2,right:76.2,top:60.1,bottom:64},
  'cloth':{left:64.8,right:70.4,top:62,bottom:65.5},
  'left chopsticks':{left:58.2,right:64.3,top:62.8,bottom:64.3},
  'right chopsticks':{left:70.8,right:78,top:64,bottom:65.4},
};
test('the served bowl, tea and displayed papers leave the baked-in tableware and each other clear',()=>{
  const bun=yard.decorations!.find(d=>d.id==='family-breakfast')!;
  const tea=yard.hotspots.find(h=>h.id==='yard-cup')!;
  const drawing=yard.hotspots.find(h=>h.id==='ning-drawing')!.variants![0]!;
  const plan=yard.hotspots.find(h=>h.id==='morning-table-plan')!;
  const folded=plan.variants![0]!;
  for(const pose of [{...plan,...plan.sprite},...plan.variants!]){
    const box=bounds(pose.x!,pose.y!,pose.width!,pose.height!);
    assert.ok(box.top>=57.3&&box.bottom<=59.1&&box.left>=60&&box.right<=64.5,'prep sheet must stay on the rear-left tabletop, above the bowl');
  }
  assert.equal(bun.asset,'morning-breakfast-bowl');
  const objects={bun:bounds(bun.x,bun.y,bun.width,bun.height),tea:bounds(tea.x,tea.y,tea.sprite!.width,tea.sprite!.height),drawing:bounds(drawing.x!,drawing.y!,drawing.width!,drawing.height!),folded:bounds(folded.x!,folded.y!,folded.width!,folded.height!)};
  for(const [name,box]of Object.entries(objects)){
    // All four bases sit well within the tabletop's inner back area.
    assert.ok(box.left>=60&&box.right<=80.5&&box.bottom>=58&&box.bottom<=61,name);
    for(const [obstacle,occupied]of Object.entries(fixed))assert.equal(overlap(box,occupied),false,`${name} overlaps ${obstacle}`);
  }
  const entries=Object.entries(objects);
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)assert.equal(overlap(entries[i]![1],entries[j]![1]),false,`${entries[i]![0]} overlaps ${entries[j]![0]}`);
});
