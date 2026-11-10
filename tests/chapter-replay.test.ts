import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { createState, transition } from '../src/core/engine.ts';
import { firstSceneOf } from '../src/core/scenes.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { useGame } from '../src/runtime/useGame.ts';
import { completeArrival, enterMorning, finishMorning, finishNoon, finishNight, choices, morningDecision } from './helpers.ts';

const replay = (s: ReturnType<typeof createState>) => transition(s, { type: 'replay-chapter' }, content).state;
const travel = (s: ReturnType<typeof createState>) => transition(s, { type: 'travel' }, content).state;
const roundtrip = (s: ReturnType<typeof createState>) => decodeSave(JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: s }), content);

for (const branch of ['trial', 'table', 'defer'] as const) {
  test(`replaying chapter two clears the ${branch} branch and preserves chapter one exactly`, () => {
    const finished = finishMorning(branch), original = structuredClone(finished);
    const next = replay(finished);
    assert.deepEqual(next, enterMorning());
    assert.deepEqual(finished, original);
    assert.ok(roundtrip(next).ok);
    assert.deepEqual(replay(next), next);
    // The original once-only reward can be earned again after replay.
    let s = transition(next, { type: 'talk', hotspotId: 'morning-person' }, content).state;
    s = choices(s, ['morning-listen', 'morning-thanks']);
    assert.ok(s.flags.includes('morning-listened'));
    assert.equal(s.metrics.listening, 1);
  });
}

test('later chapters return to their real first scene and keep all prior results', () => {
  for (const [finished, expected] of [
    [finishNoon(), travel(finishMorning())],
    [finishNight(), travel(finishNoon())],
  ]) {
    const next = replay(finished);
    assert.deepEqual(next, expected);
    assert.ok(roundtrip(next).ok);
  }
});

test('replaying during a revisit clears the viewed chapter and all later progress', () => {
  const s = finishNight();
  s.chapterId = 'morning'; s.sceneId = 'morning-yard';
  const next = replay(s);
  assert.deepEqual(next, enterMorning());
  assert.ok(roundtrip(next).ok);
});

test('the first chapter starts fresh; title cannot be replayed', () => {
  const fresh = createState(content);
  assert.equal(transition(fresh, { type: 'replay-chapter' }, content).changed, false);
  assert.deepEqual(replay(completeArrival()), transition(fresh, { type: 'start' }, content).state);
});

test('replaying the completed final chapter clears its ending choice', () => {
  const initial = travel(finishNight());
  const s = structuredClone(initial);
  s.phase = 'ending'; s.quests.epilogue = 'completed';
  const chapter = content.chapters.find(c => c.id === 'epilogue')!;
  s.sceneId = firstSceneOf(chapter);
  assert.deepEqual(replay(s), initial);
});

test('replay replaces automatic and decision checkpoints, keeps manual saves and survives refresh', () => {
  const map = new Map<string, string>();
  const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); }, removeItem: (k: string) => { map.delete(k); } };
  const game = useGame(content, storage);
  game.restore(choices(morningDecision(), ['morning-later-plan']));
  game.dispatch({ type: 'choose', choiceId: 'morning-overpromise' });
  game.save('manual-1');
  const manual = game.saves.read('manual-1');
  assert.ok(game.dispatch({ type: 'replay-chapter' }));
  assert.deepEqual(game.state.value, enterMorning());
  assert.deepEqual(game.saves.read('manual-1'), manual);
  for (const slot of ['auto', 'checkpoint'] as const) {
    const save = game.saves.read(slot);
    assert.ok(save.ok && save.value);
    assert.deepEqual(save.value.state, game.state.value);
  }
  const refreshed = useGame(content, storage);
  assert.ok(refreshed.load('auto'));
  assert.deepEqual(refreshed.state.value, game.state.value);
  game.setDeveloper(true);
  game.dispatch({ type: 'dev-jump', chapterId: 'arrival' });
  game.dispatch({ type: 'replay-chapter' });
  game.setDeveloper(false);
  assert.deepEqual(game.state.value, enterMorning());
});
