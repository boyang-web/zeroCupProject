import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { createState, transition } from '../src/core/engine.ts';
import { createSaveRepository, decodeSave, type StoragePort } from '../src/infrastructure/saves.ts';
import { reachArrivalApproach } from './helpers.ts';
function memory(): StoragePort {
  const values = new Map<string, string>();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v); }, removeItem: k => { values.delete(k); } };
}
const active = () => transition(createState(content), { type: 'start' }, content).state;
test('manual, auto and pre-choice slots remain independent and restore dialogue cursor', () => {
  const repo = createSaveRepository(memory(), content); const s = active();
  const talking = reachArrivalApproach();
  assert.ok(repo.write('checkpoint', talking).ok); assert.ok(repo.write('manual-1', s).ok);
  const accepted = transition(talking, { type: 'choose', choiceId: 'accept-commission' }, content).state;
  repo.write('auto', accepted);
  const before = repo.read('checkpoint'); const after = repo.read('auto');
  assert.ok(before.ok && before.value); assert.ok(after.ok && after.value);
  assert.deepEqual(before.value.state.dialogue, { id: 'commission', nodeId: 'approach' });
  assert.ok(!before.value.state.flags.includes('entrusted')); assert.ok(after.value.state.flags.includes('entrusted'));
  talking.flags.push('mutated-after-write'); assert.ok(!before.value.state.flags.includes('mutated-after-write'));
});
test('malformed, incompatible and inconsistent saves are rejected without overwriting good slots', () => {
  const repo = createSaveRepository(memory(), content); const saved = repo.write('manual-1', active()); assert.ok(saved.ok);
  const mutations = [
    (v: any) => { v.version = 999; }, (v: any) => { v.state.contentVersion = 999; },
    (v: any) => { v.state.clues = ['missing']; }, (v: any) => { v.state.inventory = { 'small-key': -1 }; },
    (v: any) => { v.state.metrics.listening = 'a lot'; }, (v: any) => { v.state.dialogue = { id: 'commission', nodeId: 'missing' }; },
    (v: any) => { v.state.phase = 'ending'; }, (v: any) => { v.state.quests.commission = 'unknown'; },
    (v: any) => { v.state.decisions.morning = 'accept-commission'; }, (v: any) => { v.state.metrics = null; },
  ];
  for (const mutate of mutations) { const copy = structuredClone(saved.value); mutate(copy); assert.equal(decodeSave(JSON.stringify(copy), content).ok, false); }
  assert.equal(decodeSave('{broken', content).ok, false);
  const loaded = repo.read('manual-1'); assert.ok(loaded.ok && loaded.value); assert.deepEqual(loaded.value.state, active());
});
test('blocked storage and full quota return usable errors instead of crashing', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); }, removeItem() { throw new Error('blocked'); } };
  const repo = createSaveRepository(storage, content);
  assert.equal(repo.read('auto').ok, false); assert.equal(repo.write('auto', active()).ok, false); assert.equal(repo.remove('auto').ok, false);
});
