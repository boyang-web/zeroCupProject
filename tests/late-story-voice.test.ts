import{test}from'node:test';import assert from'node:assert/strict';import{content}from'../src/content/index.ts';import{dialogueReadings}from'../src/presentation/dialogue-readings.ts';import{finishMorning,finishNoon,finishNight}from'./helpers.ts';
const ep=content.dialogues.find(d=>d.id==='epilogue-table-talk')!;const words=(node:string,state:ReturnType<typeof finishMorning>)=>dialogueReadings(ep.nodes.find(n=>n.id===node)!,state).map(b=>b.text).join('');
test('late conversations keep the actual breakfast and noodle agreements separate from personal recollection',()=>{
 assert.match(words('chen',finishMorning('trial')),/第一笼照旧，第二笼试/);
 assert.match(words('chen',finishMorning('table')),/还没把试三天定下/);
 assert.match(words('chen',finishMorning('defer')),/样面没约/);
 assert.match(words('qin',finishNoon(finishMorning(),'limit')),/试一周/);
 assert.match(words('qin',finishNoon(finishMorning(),'counter')),/接几单.*晚上再算/);
 assert.match(words('qin',finishNoon(finishMorning(),'overload')),/十五分钟还没改/);
});
test('an optional taste and a private note are never silently added by late prose',()=>{
 const state=finishNight();assert.ok(!state.flags.includes('night-tofu-tasted'));
 assert.doesNotMatch(words('recipe-night',state),/我还尝了一小块/);
 assert.match(words('recipe-night',{...state,flags:[...state.flags,'night-tofu-tasted']}),/我还尝了一小块/);
 const empty={...state,clues:state.clues.filter(id=>!id.startsWith('night-private-'))};assert.doesNotMatch(words('filed',empty),/人家单独跟我说/);
});
