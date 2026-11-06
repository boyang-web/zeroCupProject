import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { createState, transition, matches } from '../src/core/engine.ts';
import { completeArrival, reachArrivalApproach } from './helpers.ts';
import { createSaveRepository } from '../src/infrastructure/saves.ts';
import { isItineraryComplete, placeBookmark } from '../src/features/minigames/itinerary.ts';

test('chapter one is complete without collecting optional memories', () => {
  const s = completeArrival();
  assert.equal(s.chapterId, 'arrival'); assert.equal(s.quests.commission, 'completed');
  assert.ok(matches(s, content.chapters[0].exit)); assert.equal(s.inventory['baiwei-book'], 1);
  assert.ok(!s.clues.includes('family-photo')); assert.ok(!s.clues.includes('calendar'));
  assert.equal(transition(s, { type: 'travel' }, content).state.chapterId, 'morning');
});
test('both arrival commitments are playable, mutually exclusive and give one key', () => {
  for (const choiceId of ['accept-commission', 'accept-brief']) {
    let s = completeArrival(choiceId); assert.equal(s.inventory['small-key'], 1);
    assert.equal(s.decisions['arrival-approach'], choiceId);
    s.dialogue = { id: 'commission', nodeId: 'approach' };
    const other = choiceId === 'accept-brief' ? 'accept-commission' : 'accept-brief';
    assert.equal(transition(s, { type: 'choose', choiceId: other }, content).changed, false);
  }
});
test('book arrangement cannot skip the conversation or receive rewards after cancellation', () => {
  let s = transition(createState(content), { type: 'start' }, content).state;
  s = transition(s, { type: 'inspect', hotspotId: 'book' }, content).state;
  assert.equal(transition(s, { type: 'finish-minigame', gameId: 'arrival-route', result: { status: 'completed', score: 100, assisted: false } }, content).changed, false);
  s = reachArrivalApproach(); s = transition(s, { type: 'choose', choiceId: 'accept-brief' }, content).state;
  s = transition(s, { type: 'close-dialogue' }, content).state;
  s = transition(s, { type: 'inspect', hotspotId: 'book' }, content).state;
  const cancelled = transition(s, { type: 'finish-minigame', gameId: 'arrival-route', result: { status: 'cancelled' } }, content);
  assert.equal(cancelled.changed, false); assert.equal(s.inventory['baiwei-book'], undefined);
});
test('observations unlock evidence-based dialogue and rewards are not farmed', () => {
  let s = transition(createState(content), { type: 'start' }, content).state;
  s = transition(s, { type: 'inspect', hotspotId: 'photo' }, content).state;
  s = transition(s, { type: 'inspect', hotspotId: 'photo' }, content).state; assert.equal(s.metrics.attention, 1);
  for (const hotspotId of ['calendar', 'letter']) s = transition(s, { type: 'inspect', hotspotId }, content).state;
  assert.ok(s.achievements.includes('home-again'));
  s = transition(s, { type: 'talk', hotspotId: 'grandma' }, content).state;
  for (const choiceId of ['arrival-hungry', 'arrival-remember', 'arrival-photo-question', 'arrival-photo-reply']) s = transition(s, { type: 'choose', choiceId }, content).state;
  assert.ok(s.clues.includes('chen-memory'));
});
test('reopening conversations responds to progress and tea action', () => {
  let s = completeArrival();
  s = transition(s, { type: 'interact', hotspotId: 'tea', actionId: 'offer-tea' }, content).state;
  s = transition(s, { type: 'talk', hotspotId: 'grandma' }, content).state;
  assert.equal(s.dialogue?.nodeId, 'followup');
  s = transition(s, { type: 'choose', choiceId: 'arrival-followup-tea' }, content).state;
  assert.equal(s.dialogue?.nodeId, 'tea-reply');
});
test('every arrival dialogue position roundtrips through a save', () => {
  const data = new Map<string, string>();
  const repo = createSaveRepository({ getItem: k => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, removeItem: k => { data.delete(k); } }, content);
  for (const node of content.dialogues.find(d => d.id === 'commission')!.nodes) {
    const s = completeArrival(); s.dialogue = { id: 'commission', nodeId: node.id };
    assert.ok(repo.write('manual-1', s).ok, node.id);
    const loaded = repo.read('manual-1'); assert.ok(loaded.ok && loaded.value); assert.equal(loaded.value.state.dialogue?.nodeId, node.id);
  }
});
test('bookmark placement permits correction, prevents duplicates and validates actual route', () => {
  const plan = content.minigames.find(g => g.id === 'arrival-route')!.itinerary!;
  const initial = { morning: 'night-slip' };
  const moved = placeBookmark(plan, initial, 'night-slip', 'evening');
  assert.deepEqual(initial, { morning: 'night-slip' }); assert.equal(moved.morning, undefined);
  assert.equal(isItineraryComplete(plan, moved), false);
  const next = placeBookmark(plan, moved, 'morning-slip', 'morning');
  const complete = placeBookmark(plan, next, 'noon-slip', 'noon'); assert.equal(isItineraryComplete(plan, complete), true);
  assert.deepEqual(placeBookmark(plan, complete, 'unknown', 'morning'), complete);
  const wrong = placeBookmark(plan, complete, 'noon-slip', 'morning'); assert.equal(isItineraryComplete(plan, wrong), false);
});
test('closing the commission before instructions resumes the necessary explanation', () => {
  let s = reachArrivalApproach(); s = transition(s, { type: 'choose', choiceId: 'accept-commission' }, content).state;
  s = transition(s, { type: 'close-dialogue' }, content).state;
  s = transition(s, { type: 'talk', hotspotId: 'grandma' }, content).state;
  assert.equal(s.dialogue?.nodeId, 'instructions');
});
test('a memory learned in chapter one becomes a concrete conversation in chapter two', () => {
  let s = completeArrival();
  s = transition(s, { type: 'inspect', hotspotId: 'photo' }, content).state;
  s = transition(s, { type: 'talk', hotspotId: 'grandma' }, content).state;
  for (const choiceId of ['arrival-followup-photo', 'arrival-remember-bye']) s = transition(s, { type: 'choose', choiceId }, content).state;
  s = transition(s, { type: 'travel' }, content).state;
  s = transition(s, { type: 'talk', hotspotId: 'morning-person' }, content).state;
  s = transition(s, { type: 'choose', choiceId: 'morning-shared-memory' }, content).state;
  assert.equal(s.dialogue?.nodeId, 'old-photo');
  s = transition(s, { type: 'choose', choiceId: 'morning-memory-return' }, content).state;
  assert.ok(s.flags.includes('chen-recognized'));
});
