import{test}from'node:test';import assert from'node:assert/strict';import{content}from'../src/content/index.ts';import{journalLifeEntries,lifePageForEntry}from'../src/presentation/journal-life.ts';import{entryText}from'../src/presentation/entry-text.ts';import{finishNight,finishMorning,finishNoon}from'./helpers.ts';

test('personal pages follow actual discovery order and never turn private notes into public fragments',()=>{
 const state=finishNight();const before=structuredClone(state);const entries=journalLifeEntries(content,state);
 assert.deepEqual(entries.map(e=>e.id),state.clues.filter(id=>content.clues.find(c=>c.id===id)?.category==='life'));
 assert.ok(!entries.some(e=>e.id==='night-private-liang'||e.id==='night-private-xu'));
 const publicNight=entryText(content.clues.find(c=>c.id==='night-record-pickup')!,state);assert.doesNotMatch(publicNight,/替同事|顶班|闺女|女儿/);
 assert.deepEqual(state,before);
});

test('every discovered fragment is reachable on both facing desktop leaves and one-leaf mobile pages',()=>{
 const entries=journalLifeEntries(content,finishNight());const ids=entries.map(e=>e.id);
 for(const size of [1,2])for(const id of ids){const page=lifePageForEntry(ids,id,size);assert.ok(ids.slice(page*size,(page+1)*size).includes(id));}
 assert.equal(lifePageForEntry(ids,'missing',2),0);
 for(const outcome of ['table','defer']as const){const state=finishNoon(finishMorning(outcome));for(const entry of journalLifeEntries(content,state))assert.ok(state.clues.includes(entry.id));}
});
