import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slots } from '../src/infrastructure/saves.ts';
import { resetLocalSaves } from '../src/infrastructure/local-save-reset.ts';

test('an explicitly configured local reset deletes only this game slots once, keeping settings and later progress', () => {
  const values = new Map<string,string>([['settings','keep'],['another-game:auto','keep']]);
  const storage = { getItem:(k:string)=>values.get(k)??null, setItem:(k:string,v:string)=>{values.set(k,v);}, removeItem:(k:string)=>{values.delete(k);} };
  for (const channel of ['', 'developer:']) for (const slot of slots) values.set(`baiwei:game:${channel}v1:${slot}`,'old');
  assert.equal(resetLocalSaves(storage,'game','127.0.0.1'),false);
  assert.equal(resetLocalSaves(storage,'game','example.com','requested'),false);
  assert.equal(resetLocalSaves(storage,'game','127.0.0.1','requested'),true);
  for (const channel of ['', 'developer:']) for (const slot of slots) assert.equal(values.has(`baiwei:game:${channel}v1:${slot}`),false);
  assert.equal(values.get('settings'),'keep');assert.equal(values.get('another-game:auto'),'keep');
  values.set('baiwei:game:v1:auto','new');
  assert.equal(resetLocalSaves(storage,'game','127.0.0.1','requested'),false);
  assert.equal(values.get('baiwei:game:v1:auto'),'new');
});
