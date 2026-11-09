import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import type { GameState } from '../src/core/contracts.ts';
import { transition, matches } from '../src/core/engine.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { epilogueRecords } from '../src/content/epilogue-records.ts';
import { act, choices, finishMorning, finishNoon, finishNight } from './helpers.ts';

const saved = (state: GameState) => JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: '2026-11-09T00:00:00Z', state });
const currentNode = (state: GameState) => content.dialogues.find(d => d.id === state.dialogue?.id)!.nodes.find(n => n.id === state.dialogue?.nodeId)!;
function home(result: 'pickup' | 'cancelled' | 'missed' = 'pickup') {
  let state = act(finishNight(result), { type: 'travel' });
  state = act(state, { type: 'talk', hotspotId: 'epilogue-grandmother' });
  state = choices(state, ['epilogue-sit']);
  return act(state, { type: 'move', sceneId: 'epilogue-table' });
}

test('the optional tofu lesson permits an early mistake and saves every step without completing packing', () => {
  let state = act(finishNoon(), { type: 'travel' });
  state = act(state, { type: 'talk', hotspotId: 'night-person' });
  state = choices(state, ['night-listen', 'night-thanks']);
  state = act(state, { type: 'talk', hotspotId: 'night-luo' });
  state = choices(state, ['night-luo-order']);
  state = act(state, { type: 'interact', hotspotId: 'night-table', actionId: 'night-wipe' });
  state = act(state, { type: 'move', sceneId: 'night-kitchen' });
  state = act(state, { type: 'talk', hotspotId: 'night-xu-kitchen' });
  for (const id of ['night-watch-tofu', 'night-tofu-early', 'night-tofu-steady', 'night-tofu-sauce', 'night-tofu-taste']) {
    state = choices(state, [id]);
    const restored = decodeSave(saved(state), content);
    assert.ok(restored.ok, restored.ok ? '' : restored.error);
    assert.deepEqual(restored.value.state, state);
    assert.ok(!state.flags.includes('night-played'));
    assert.ok(!state.flags.includes('night-tofu-tasted'));
  }
  state = choices(state, ['night-tofu-finish']);
  assert.ok(state.flags.includes('night-tofu-tasted'));
  assert.ok(!state.flags.includes('night-played'));
  const rewards = [...state.rewards];
  state = act(state, { type: 'talk', hotspotId: 'night-xu-kitchen' });
  assert.equal(state.dialogue?.nodeId, 'again');
  state = choices(state, ['night-tofu-again-close']);
  assert.equal(state.rewards.filter(id => id === 'night-tofu-finish').length, 1);
  assert.ok(rewards.every(id => state.rewards.includes(id)));
});

test('the lamp story exposes only the actual night outcome and never unlocks another result', () => {
  for (const result of ['pickup', 'cancelled', 'missed'] as const) {
    let state = home(result);
    const decisions = structuredClone(state.decisions);
    state = act(state, { type: 'talk', hotspotId: 'epilogue-table-grandma' });
    state = choices(state, ['epilogue-open-stories']);
    const options = currentNode(state).choices.filter(c => c.id.startsWith('epilogue-tell-night-') && matches(state, c.condition));
    assert.deepEqual(options.map(c => c.next), [`night-${result}`]);
    for (const other of ['pickup', 'cancelled', 'missed'].filter(id => id !== result)) {
      assert.equal(transition(state, { type: 'choose', choiceId: `epilogue-tell-night-${other}` }, content).changed, false);
    }
    state = choices(state, [`epilogue-tell-night-${result}`, `epilogue-story-back-night-${result}`]);
    assert.ok(state.flags.includes('epilogue-story-told'));
    assert.deepEqual(state.decisions, decisions);
    assert.ok(decodeSave(saved(state), content).ok);
  }
});

test('the optional resume correction needs the discovered phone story and never sends a resume or chooses an ending', () => {
  const initial = home();
  const update = { type: 'interact' as const, hotspotId: 'epilogue-phone', actionId: 'epilogue-update-date' };
  assert.equal(transition(initial, update, content).changed, false);
  const known = { ...initial, clues: [...initial.clues, 'job-gap'] };
  const updated = act(known, update);
  assert.ok(updated.flags.includes('epilogue-updated-date'));
  assert.deepEqual(updated.decisions, known.decisions);
  assert.deepEqual(updated.quests, known.quests);
  assert.equal(transition(updated, update, content).changed, false);
  assert.ok(decodeSave(saved(updated), content).ok);
});

test('final shop pages distinguish a three-day sample agreement from one sample and keep bus knowledge separate', () => {
  const trial = epilogueRecords(finishMorning('trial'))[0]!.text!;
  const table = epilogueRecords(finishMorning('table'))[0]!.text!;
  const defer = epilogueRecords(finishMorning('defer'))[0]!.text!;
  assert.match(trial, /第一笼照旧，第二笼试/);
  assert.match(table, /试三天和晚开门都还没定/);
  assert.match(defer, /样面还没约/);
  for (const text of [trial, table, defer]) assert.ok(!text.includes('六点十分'));
});

test('missing result records do not invent an old agreement or infer a modern route from quest completion', () => {
  const earlier = finishNight();
  const missing = { ...earlier, flags: earlier.flags.filter(id => !['morning-plan', 'morning-table', 'morning-defer', 'noon-limited', 'noon-counter', 'noon-overload'].includes(id)) };
  const records = epilogueRecords(missing);
  assert.match(records[0]!.text!, /还没留下/);
  assert.match(records[1]!.text!, /还没记下/);
  for (const text of records.slice(0, 2).map(r => r.text!)) {
    assert.ok(!text.includes('原来的记录'));
    assert.ok(!text.includes('先试三天'));
    assert.ok(!text.includes('先试一周'));
  }
  assert.equal(missing.quests.morning, 'completed');
  assert.equal(missing.quests.noon, 'completed');
  assert.deepEqual(epilogueRecords(earlier).slice(0, 2).map(r => r.text!.includes('还没留下') || r.text!.includes('还没记下')), [false, false]);
});
