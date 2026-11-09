import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import type { Command, GameState } from '../src/core/contracts.ts';
import { createState, transition } from '../src/core/engine.ts';
import { featureUnlocked } from '../src/core/progression.ts';
import { scenesOf } from '../src/core/scenes.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { useGame } from '../src/runtime/useGame.ts';

const developer = { developer: true };
const debug = (state: GameState, command: Command) => transition(state, command, content, developer).state;
const initial = () => transition(createState(content), { type: 'start' }, content).state;
function assertSaveable(state: GameState) {
  const result = decodeSave(JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state }), content);
  assert.ok(result.ok, result.ok ? '' : result.error);
}
function memory() {
  const map = new Map<string, string>();
  return { map, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } };
}

test('developer commands are refused outside test mode, while all real scene targets can be tested', () => {
  let state = createState(content);
  for (const chapter of [...content.chapters, ...content.chapters.toReversed()]) {
    for (const scene of scenesOf(chapter)) {
      const command: Command = { type: 'dev-jump', chapterId: chapter.id, sceneId: scene.id };
      assert.equal(transition(initial(), command, content).changed, false);
      state = debug(state, command);
      assert.equal(state.chapterId, chapter.id); assert.equal(state.sceneId, scene.id);
      assert.equal(state.phase, chapter.next ? 'playing' : 'ending'); assertSaveable(state);
    }
  }
  for (const command of [
    { type: 'dev-jump', chapterId: 'missing' },
    { type: 'dev-jump', chapterId: 'arrival', sceneId: 'morning-front' },
    { type: 'dev-dialogue', dialogueId: 'missing', nodeId: 'missing' },
  ] as const) assert.equal(transition(state, command, content, developer).changed, false);
});

test('every dialogue node and choice can be reached without its narrative prerequisites', () => {
  for (const dialogue of content.dialogues) for (const node of dialogue.nodes) {
    const command: Command = { type: 'dev-dialogue', dialogueId: dialogue.id, nodeId: node.id };
    assert.equal(transition(initial(), command, content).changed, false);
    const state = debug(createState(content), command);
    assert.equal(state.dialogue?.nodeId, node.id); assertSaveable(state);
    for (const choice of node.choices) {
      const chosen = transition(state, { type: 'choose', choiceId: choice.id }, content, developer);
      assert.equal(chosen.state.dialogue?.nodeId ?? null, choice.next ?? null, choice.id);
      assert.ok(chosen.changed, `${dialogue.id}/${choice.id}: ${chosen.message}`); assertSaveable(chosen.state);
    }
  }
});

test('all feature gates open in test mode while normal play still enforces conditions', () => {
  const state = initial();
  for (const feature of ['journal', 'inventory', 'collection', 'lifeNotes', 'revisit'] as const) {
    assert.equal(featureUnlocked(state, content, feature), false);
    assert.equal(featureUnlocked(state, content, feature, developer), true);
  }
  assert.equal(transition(state, { type: 'travel' }, content).changed, false);
  assert.equal(debug(state, { type: 'travel' }).chapterId, 'morning');
  const morning = debug(state, { type: 'dev-jump', chapterId: 'morning' });
  assert.equal(transition(morning, { type: 'move', sceneId: 'morning-kitchen' }, content).changed, false);
  assert.equal(debug(morning, { type: 'move', sceneId: 'morning-kitchen' }).sceneId, 'morning-kitchen');
  assert.equal(transition(state, { type: 'study-collection', entryId: 'family-photo' }, content).changed, false);
  assert.ok(debug(state, { type: 'study-collection', entryId: 'family-photo' }).clues.includes('photo-margin'));
  const revisit = debug(state, { type: 'revisit', chapterId: 'noon' });
  assert.equal(revisit.chapterId, 'noon'); assert.equal(revisit.journey.chapterId, 'arrival'); assertSaveable(revisit);
});

test('every existing person and inspection action can be tested directly from its scene', () => {
  for (const chapter of content.chapters) for (const scene of scenesOf(chapter)) for (const hotspot of scene.hotspots) {
    const state = debug(initial(), { type: 'dev-jump', chapterId: chapter.id, sceneId: scene.id });
    if (hotspot.interaction.kind === 'dialogue') {
      const talked = debug(state, { type: 'talk', hotspotId: hotspot.id });
      assert.equal(talked.dialogue?.id, hotspot.interaction.dialogueId, hotspot.id); assertSaveable(talked);
    } else if (hotspot.interaction.kind === 'inspect') {
      const action = hotspot.interaction.action;
      if (action) {
        const inspected = debug(state, { type: 'inspect', hotspotId: hotspot.id });
        assert.ok(inspected.rewards.includes(action.onceKey ?? action.id), hotspot.id); assertSaveable(inspected);
      }
      for (const option of hotspot.interaction.options ?? []) {
        const inspected = debug(state, { type: 'interact', hotspotId: hotspot.id, actionId: option.id });
        assert.ok(inspected.rewards.includes(option.onceKey ?? option.id), option.id); assertSaveable(inspected);
      }
    }
  }
});

test('switching developer decisions updates the selected branch without duplicating rewards', () => {
  let state = initial();
  for (const [nodeId, choiceId, flag] of [
    ['trial', 'morning-agree', 'morning-plan'], ['sit-down', 'morning-table-agree', 'morning-table'],
    ['defer', 'morning-overpromise', 'morning-defer'], ['trial', 'morning-agree', 'morning-plan'],
  ]) {
    state = debug(state, { type: 'dev-dialogue', dialogueId: 'morning-talk', nodeId });
    state = debug(state, { type: 'choose', choiceId });
    assert.equal(state.decisions.morning, choiceId);
    assert.deepEqual(state.flags.filter(id => ['morning-plan', 'morning-table', 'morning-defer'].includes(id)), [flag]);
    assertSaveable(state);
  }
  assert.equal(state.metrics.listening, 1);
  state = debug(state, { type: 'dev-dialogue', dialogueId: 'commission', nodeId: 'approach' });
  state = debug(state, { type: 'choose', choiceId: 'accept-commission' });
  state = debug(state, { type: 'dev-dialogue', dialogueId: 'commission', nodeId: 'approach' });
  state = debug(state, { type: 'choose', choiceId: 'accept-brief' });
  assert.equal(state.inventory['small-key'], 1);
  assert.ok(state.flags.includes('arrival-recording')); assert.ok(!state.flags.includes('arrival-slow'));
});

test('minigames can be completed out of order, with cancellation, score validation and once-only rewards intact', () => {
  for (const game of content.minigames) {
    const chapter = content.chapters.find(c => c.id === game.chapterId)!;
    const location = scenesOf(chapter).find(s => s.hotspots.some(h => h.interaction.kind === 'minigame' ? h.interaction.gameId === game.id : h.interaction.kind === 'inspect' && h.interaction.activityId === game.id))!;
    const state = debug(initial(), { type: 'dev-jump', chapterId: chapter.id, sceneId: location.id });
    assert.equal(transition(state, { type: 'finish-minigame', gameId: game.id, result: { status: 'cancelled' } }, content, developer).changed, false);
    assert.equal(transition(state, { type: 'finish-minigame', gameId: game.id, result: { status: 'completed', score: NaN, assisted: false } }, content, developer).changed, false);
    const command: Command = { type: 'finish-minigame', gameId: game.id, result: { status: 'completed', score: 100, assisted: false } };
    const completed = debug(state, command); assert.ok(completed.rewards.includes(game.reward.onceKey ?? game.reward.id));
    assert.deepEqual(debug(completed, command), completed); assertSaveable(completed);
  }
});

test('test saves and checkpoints stay separate, and exiting restores the exact normal session', () => {
  const storage = memory(), runtime = useGame(content, storage);
  runtime.newGame(); runtime.save('manual-1');
  runtime.dispatch({ type: 'talk', hotspotId: 'grandma' });
  const normal = structuredClone(runtime.state.value), files = new Map(storage.map);
  runtime.setDeveloper(true);
  runtime.dispatch({ type: 'dev-dialogue', dialogueId: 'morning-talk', nodeId: 'defer' });
  runtime.dispatch({ type: 'choose', choiceId: 'morning-overpromise' });
  runtime.save('manual-1');
  const checkpoint = runtime.saves.read('checkpoint'); assert.ok(checkpoint.ok && checkpoint.value);
  assert.equal(checkpoint.value.state.chapterId, 'morning');
  for (const [key, value] of files) assert.equal(storage.map.get(key), value, key);
  assert.ok([...storage.map.keys()].some(key => key.includes(':developer:v1:')));
  runtime.setDeveloper(false);
  assert.deepEqual(runtime.state.value, normal);
  const normalCheckpoint = runtime.saves.read('checkpoint'); assert.ok(normalCheckpoint.ok); assert.equal(normalCheckpoint.value, null);
  assert.equal(runtime.dispatch({ type: 'dev-jump', chapterId: 'night' }), false);
  assert.deepEqual(runtime.state.value, normal);
  runtime.setDeveloper(true); assert.equal(runtime.state.value.chapterId, 'morning');
  const reopened = useGame(content, storage); assert.equal(reopened.developer.value, false);
  assert.ok(reopened.load('auto')); assert.equal(reopened.state.value.chapterId, 'arrival');
  reopened.setDeveloper(true); assert.equal(reopened.state.value.chapterId, 'morning');
});

test('test mode can open without any normal save and survives unavailable storage', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  const runtime = useGame(content, storage), normal = structuredClone(runtime.state.value);
  runtime.setDeveloper(true); assert.equal(runtime.state.value.phase, 'playing');
  assert.ok(runtime.dispatch({ type: 'dev-jump', chapterId: 'night' }));
  runtime.setDeveloper(false); assert.deepEqual(runtime.state.value, normal);
  runtime.setDeveloper(true); assert.equal(runtime.state.value.chapterId, 'night');
});
