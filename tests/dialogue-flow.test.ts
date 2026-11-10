import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content} from '../src/content/index.ts';
import {createState,transition} from '../src/core/engine.ts';
import {matches} from '../src/core/conditions.ts';
import {validateContent} from '../src/core/validate-content.ts';
import {journalActivity} from '../src/presentation/journal-activity.ts';
import type {GameState} from '../src/core/contracts.ts';
import {act,choices,completeArrival,reachArrivalApproach,finishMorning,noonDecision,finishNight} from './helpers.ts';
import {dialogueChoices} from '../src/presentation/dialogue-choices.ts';
import {sceneOf} from '../src/core/scenes.ts';
import {decodeSave} from '../src/infrastructure/saves.ts';
import {currentGuide} from '../src/core/progression.ts';

const commission=content.dialogues.find(d=>d.id==='commission')!;

test('old rewarded opening actions recover missing tutorial flags instead of trapping the conversation lesson',()=>{
  const finished=choices(reachArrivalApproach(),['accept-commission','arrival-set-off']);
  const old={...finished,flags:finished.flags.filter(f=>!['arrival-greeted','arrival-spool-story','arrival-introduced','entrusted','arrival-instructions'].includes(f))};
  // On the old save, closing and repeating the instructions never adds the flag:
  // arrival-set-off is already in the reward ledger.
  const missingInstructions={...finished,flags:finished.flags.filter(f=>f!=='arrival-instructions')};
  const trapped=choices(act(missingInstructions,{type:'talk',hotspotId:'grandma'}),['arrival-set-off']);
  assert.equal(currentGuide(trapped,content)?.id,'arrival-talk');
  const loaded=decodeSave(JSON.stringify({format:'baiwei-save',version:1,savedAt:'2026-11-10T00:00:00Z',state:old}),content);
  assert.ok(loaded.ok,loaded.ok?'':loaded.error);
  assert.equal(currentGuide(loaded.value.state,content)?.id,'arrival-read');
  assert.deepEqual(loaded.value.state.inventory,old.inventory);
  assert.deepEqual(loaded.value.state.rewards,old.rewards);
  assert.equal(act(finish(loaded.value.state),{type:'travel'}).chapterId,'morning');
});
function available(state:GameState){return commission.nodes.find(n=>n.id===state.dialogue?.nodeId)!.choices.filter(c=>matches(state,c.condition)&&(!c.decision||!state.decisions[c.decision]||state.decisions[c.decision]===c.id));}
function finish(state:GameState){
  let current=state;
  for(let step=0;step<commission.nodes.length+5;step++){
    if(current.dialogue){const candidates=available(current);assert.ok(candidates.length,JSON.stringify(current.dialogue));current=act(current,{type:'choose',choiceId:candidates[0]!.id});}
    else if(!current.flags.includes('entrusted')||!current.flags.includes('arrival-instructions'))current=act(current,{type:'talk',hotspotId:'grandma'});
    else {current=act(current,{type:'inspect',hotspotId:'book'});assert.equal(journalActivity(current,content)?.id,'arrival-route');return act(current,{type:'finish-minigame',gameId:'arrival-route',result:{status:'completed',score:100,assisted:false}});}
  }
  assert.fail('The first chapter did not finish within its finite dialogue graph.');
}

test('all first-conversation choices and every interruption can finish without walking a dialogue cycle',()=>{
  let initial=act(createState(content),{type:'start'});initial=act(initial,{type:'inspect',hotspotId:'photo'});
  const states:GameState[]=[];let endings=0;
  function explore(state:GameState,path:string[]){
    states.push(state);if(!state.dialogue){endings++;return;}
    assert.ok(!path.includes(state.dialogue.nodeId),path.join(' -> '));
    for(const choice of available(state)){const next=act(state,{type:'choose',choiceId:choice.id});assert.ok(state.flags.every(f=>next.flags.includes(f)));explore(next,[...path,state.dialogue.nodeId]);}
  }
  explore(act(initial,{type:'talk',hotspotId:'grandma'}),[]);assert.equal(endings,32);
  for(const state of states){
    for(const interrupted of [false,true]){
      let resumed=state;if(interrupted&&resumed.dialogue)resumed=act(act(resumed,{type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});
      const result=finish(resumed);assert.equal(result.inventory['small-key'],1);assert.equal(result.inventory['baiwei-book'],1);
      assert.ok(matches(result,content.chapters[0]!.exit));assert.equal(act(result,{type:'travel'}).chapterId,'morning');
    }
  }
});

test('an interrupted question or commitment resumes that pending step instead of restarting the request',()=>{
  const base=choices(act(act(createState(content),{type:'start'}),{type:'talk',hotspotId:'grandma'}),['arrival-ate','arrival-remember']);
  for(const [id,node]of [['arrival-why-book','people'],['arrival-why-me','why-you'],['arrival-ready','approach']]as const){
    const selected=act(base,{type:'choose',choiceId:id});const resumed=act(act(selected,{type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});assert.equal(resumed.dialogue?.nodeId,node);
  }
  for(const id of ['accept-brief','accept-commission']){
    const state=act(reachArrivalApproach(),{type:'choose',choiceId:id});const resumed=act(act(state,{type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});
    assert.equal(resumed.dialogue?.nodeId,'instructions');assert.equal(resumed.inventory['small-key'],1);
  }
});

test('a save left in the old first-chapter question loop can finish without restarting or repeating rewards',()=>{
  let state=choices(act(act(createState(content),{type:'start'}),{type:'talk',hotspotId:'grandma'}),['arrival-ate','arrival-remember']);
  // The old build returned to request after answering all three optional topics.
  state={...state,clues:[...state.clues,'family-photo','book-purpose','chen-memory'],flags:[...state.flags,'phone-away'],rewards:[...state.rewards,'arrival-why-book','arrival-understand-book','arrival-why-me','arrival-admit','arrival-photo-question','arrival-photo-reply']};
  const raw=JSON.stringify({format:'baiwei-save',version:1,savedAt:'2026-11-09T12:35:00Z',state});
  const loaded=decodeSave(raw,content);assert.ok(loaded.ok,loaded.ok?'':loaded.error);
  for(const interrupted of [false,true]){
    let resumed=loaded.value.state;
    if(interrupted)resumed=act(act(resumed,{type:'close-dialogue'}),{type:'talk',hotspotId:'grandma'});
    const result=finish(resumed);
    assert.equal(result.dialogue,null);assert.equal(result.inventory['small-key'],1);assert.equal(result.inventory['baiwei-book'],1);
    assert.equal(act(result,{type:'travel'}).chapterId,'morning');
  }
});

test('the unfinished book task is available from either book entry and disappears after completion',()=>{
  let state=act(createState(content),{type:'start'});state=act(state,{type:'inspect',hotspotId:'book'});assert.equal(journalActivity(state,content),undefined);
  state=act(choices(reachArrivalApproach(),['accept-commission','arrival-set-off']),{type:'inspect',hotspotId:'book'});
  assert.equal(journalActivity(state,content)?.id,'arrival-route');
  const completed=act(state,{type:'finish-minigame',gameId:'arrival-route',result:{status:'completed',score:100,assisted:false}});
  assert.equal(journalActivity(completed,content),undefined);
  const revisit=act(act(completeArrival(),{type:'travel'}),{type:'revisit',chapterId:'arrival'});assert.equal(journalActivity(revisit,content),undefined);
});

test('validation rejects a self-loop and a multi-node loop even when there is an exit choice',()=>{
  const self=structuredClone(content);self.dialogues[0]!.nodes[0]!.choices[0]!.next=self.dialogues[0]!.nodes[0]!.id;assert.ok(validateContent(self).some(e=>e.includes('对话接续出现循环')));
  self.dialogues[0]!.nodes[0]!.choices[0]!.condition={kind:'not',condition:{kind:'reward',id:self.dialogues[0]!.nodes[0]!.choices[0]!.id}};
  assert.ok(validateContent(self).some(e=>e.includes('对话接续出现循环')));
  const cycle=structuredClone(content);const d=cycle.dialogues.find(d=>d.id==='commission')!;d.nodes.find(n=>n.id==='people')!.choices[0]!.next='request';assert.ok(validateContent(cycle).some(e=>e.includes('对话接续出现循环')));
  assert.deepEqual(validateContent(content),[]);
});

test('finished optional topics leave the answers while undiscovered evidence still has a visible hint',()=>{
  const followup=commission.nodes.find(n=>n.id==='followup')!;
  let state=completeArrival();assert.ok(dialogueChoices(followup,state).some(c=>c.id==='arrival-followup-people'));
  state={...state,clues:[...state.clues,'book-purpose','chen-memory'],flags:[...state.flags,'phone-away']};
  const ids=dialogueChoices(followup,state).map(c=>c.id);
  for(const id of ['arrival-followup-people','arrival-followup-why','arrival-followup-photo-memory'])assert.ok(!ids.includes(id));
  assert.ok(ids.includes('arrival-followup-bye'));
  const request=commission.nodes.find(n=>n.id==='request')!;assert.ok(dialogueChoices(request,state).some(c=>c.id==='arrival-photo-question'));
  assert.equal(dialogueChoices(followup,state,true).length,followup.choices.length);
});

test('each interrupted noon ending must resume and finish the meal before departure opens',()=>{
  const chapter=content.chapters.find(c=>c.id==='noon')!;
  for(const path of [
    {choices:['noon-show-limit','noon-limit-ask-qin','noon-agree'],node:'limited-end',record:'noon-limit-record'},
    {choices:['noon-write-counter','noon-counter-agree'],node:'counter-end',record:'noon-counter-record'},
    {choices:['noon-promise-fast','noon-overpromise'],node:'overload-end',record:'noon-overload-record'},
  ]){
    let state=choices(noonDecision(finishMorning(),true),path.choices);assert.equal(matches(state,chapter.exit),false);
    state=act(state,{type:'close-dialogue'});assert.equal(transition(state,{type:'travel'},content).changed,false);
    state=act(state,{type:'talk',hotspotId:'noon-person'});assert.equal(state.dialogue?.nodeId,path.node);
    state=act(state,{type:'choose',choiceId:path.record});assert.ok(matches(state,chapter.exit));
    const sticks=chapter.scenes!.flatMap(s=>s.hotspots).find(h=>h.id==='noon-chopsticks')!;assert.equal(matches(state,sticks.condition),false);
    assert.equal(act(state,{type:'travel'}).chapterId,'night');
  }
});

test('questions skipped during the one-way opening can be learned on an early home visit without reopening the commission',()=>{
  let state=act(act(completeArrival(),{type:'travel'}),{type:'revisit',chapterId:'arrival'});
  const inventory=structuredClone(state.inventory),metrics=structuredClone(state.metrics);
  state=choices(act(state,{type:'talk',hotspotId:'grandma'}),['grandma-early-return-arrival-followup-people','arrival-more-people-close']);
  assert.equal(state.dialogue,null);assert.ok(state.clues.includes('book-purpose'));
  state=choices(act(state,{type:'talk',hotspotId:'grandma'}),['grandma-early-return-arrival-followup-why','arrival-more-why-close']);
  assert.equal(state.dialogue,null);assert.ok(state.flags.includes('phone-away'));
  assert.deepEqual(state.inventory,inventory);assert.deepEqual(state.metrics,metrics);
});

test('epilogue topic menus consume each question once and resume an interrupted answer before returning to their menu',()=>{
  let state=act(finishNight(),{type:'travel'});state=choices(act(state,{type:'talk',hotspotId:'epilogue-grandmother'}),['epilogue-sit']);state=act(state,{type:'move',sceneId:'epilogue-table'});
  const person=sceneOf(state,content).hotspots.find(h=>h.interaction.kind==='dialogue'&&h.interaction.dialogueId==='epilogue-table-talk')!;
  state=choices(act(state,{type:'talk',hotspotId:person.id}),['epilogue-open-stories','epilogue-tell-chen']);
  state=act(act(state,{type:'close-dialogue'}),{type:'talk',hotspotId:person.id});assert.equal(state.dialogue?.nodeId,'chen');
  state=act(state,{type:'choose',choiceId:'epilogue-story-back-chen'});assert.equal(state.dialogue?.nodeId,'stories');
  const node=content.dialogues.find(d=>d.id==='epilogue-table-talk')!.nodes.find(n=>n.id==='stories')!;
  assert.ok(!dialogueChoices(node,state).some(c=>c.id==='epilogue-tell-chen'));
  assert.equal(transition(state,{type:'choose',choiceId:'epilogue-tell-chen'},content).changed,false);
  state=choices(state,['epilogue-tell-qin','epilogue-story-back-qin','epilogue-stories-close']);assert.equal(state.dialogue,null);
});

test('v5 saves from the refined first chapter keep their new dialogue cursor when upgraded to the remote v6 content',()=>{
  let state=choices(act(completeArrival(),{type:'talk',hotspotId:'grandma'}),['arrival-followup-people']);
  const old={...state,contentVersion:5};const raw=JSON.stringify({format:'baiwei-save',version:1,savedAt:'2026-11-10T00:00:00Z',state:old});const loaded=decodeSave(raw,content);
  assert.ok(loaded.ok,loaded.ok?'':loaded.error);assert.deepEqual(loaded.value.state.dialogue,old.dialogue);
  assert.equal(loaded.value.state.inventory['small-key'],1);assert.equal(loaded.value.state.contentVersion,content.version);
});
