import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { createState, matches, transition } from '../src/core/engine.ts';
import { currentGuide, featureUnlocked, isRevisiting } from '../src/core/progression.ts';
import { sceneOf } from '../src/core/scenes.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { createSaveRepository, decodeSave } from '../src/infrastructure/saves.ts';
import { frameSizes, frameSlices } from '../src/presentation/frame-layout.ts';
import { act, choices, completeArrival, finishMorning, finishNoon } from './helpers.ts';

test('the opening exposes observation first, recipes after the book, and no later systems', () => {
  let s = act(createState(content), { type: 'start' });
  assert.equal(currentGuide(s, content)?.target, 'phone');
  for (const id of ['journal', 'inventory', 'lifeNotes', 'collection', 'revisit', 'chapterTrack'] as const) assert.equal(featureUnlocked(s, content, id), false, id);
  s = act(s, { type: 'inspect', hotspotId: 'phone' });
  assert.equal(currentGuide(s, content)?.target, 'grandma');
  assert.equal(featureUnlocked(s, content, 'journal'), false);
  s = act(s, { type: 'inspect', hotspotId: 'book' });
  assert.equal(featureUnlocked(s, content, 'journal'), true);
  assert.deepEqual(content.recipes!.filter(r => matches(s, r.condition)).map(r => r.id), ['osmanthus-rice']);
  for (const id of ['lifeNotes', 'collection', 'revisit'] as const) assert.equal(featureUnlocked(s, content, id), false);
  s = completeArrival(); assert.equal(currentGuide(s, content), undefined); assert.equal(featureUnlocked(s, content, 'inventory'), true);
});
test('life records and revisits open after every family outcome, while collection opens later', () => {
  for (const outcome of ['trial', 'table', 'defer'] as const) {
    let s = finishMorning(outcome);
    assert.ok(featureUnlocked(s, content, 'lifeNotes')); assert.ok(featureUnlocked(s, content, 'revisit'));
    assert.equal(featureUnlocked(s, content, 'collection'), false);
    s = act(s, { type: 'travel' }); assert.ok(featureUnlocked(s, content, 'collection'));
  }
});
test('a revisit records grandmothers story and resumes the exact scene without resetting choices', () => {
  let s = finishMorning('table'); const anchor = structuredClone(s.journey), decisions = structuredClone(s.decisions), inventory = structuredClone(s.inventory);
  s = act(s, { type: 'revisit', chapterId: 'arrival' });
  assert.ok(isRevisiting(s)); assert.deepEqual(s.journey, anchor); assert.equal(sceneOf(s, content).time, '回访 · 奶奶的老宅');
  assert.equal(transition(s, { type: 'travel' }, content).changed, false);
  s = act(s, { type: 'talk', hotspotId: 'grandma' }); assert.equal(s.dialogue?.nodeId, 'grandma-later');
  s = choices(s, ['grandma-ask-first-page', 'grandma-record-first-story']); assert.ok(s.clues.includes('grandma-first-page'));
  s = act(s, { type: 'resume-journey' });
  assert.equal(s.chapterId, anchor.chapterId); assert.equal(s.sceneId, anchor.sceneId);
  assert.deepEqual(s.decisions, decisions); assert.deepEqual(s.inventory, inventory); assert.equal(s.quests.morning, 'completed');
});
test('unvisited locations and premature revisits cannot be opened through direct commands', () => {
  const s = completeArrival();
  assert.equal(transition(s, { type: 'revisit', chapterId: 'noon' }, content).changed, false);
  assert.equal(transition(s, { type: 'revisit', chapterId: 'arrival' }, content).changed, false);
  const later = finishMorning(); assert.equal(transition(later, { type: 'revisit', chapterId: 'night' }, content).changed, false);
});
test('a save made on a revisit retains its return point and rejects a foreign return scene', () => {
  const map = new Map<string, string>(); const repo = createSaveRepository({ getItem: k => map.get(k) ?? null, setItem: (k,v) => { map.set(k,v); }, removeItem: k => { map.delete(k); } }, content);
  const s = act(finishMorning(), { type: 'revisit', chapterId: 'arrival' });
  const saved = repo.write('manual-1', s); assert.ok(saved.ok);
  const read = repo.read('manual-1'); assert.ok(read.ok && read.value); assert.deepEqual(read.value.state.journey, s.journey);
  const resumed = act(read.value.state, { type: 'resume-journey' }); assert.equal(resumed.sceneId, s.journey.sceneId);
  const invalid = structuredClone(saved.value); invalid.state.journey.sceneId = 'arrival-main';
  assert.equal(decodeSave(JSON.stringify(invalid), content).ok, false);
});
test('old demo arrivals restart explicitly, while later saves gain a valid journey anchor', () => {
  for (const previous of [completeArrival(), finishMorning()]) {
    const legacy: any = structuredClone(previous); legacy.schemaVersion = 2; legacy.contentVersion = 3; delete legacy.journey;
    const raw = JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: legacy });
    const result = decodeSave(raw, content); assert.ok(result.ok); assert.ok(result.value.notice);
    assert.equal(result.value.state.schemaVersion, 3); assert.equal(result.value.state.contentVersion, 4);
    if (previous.chapterId === 'arrival') assert.ok(!result.value.state.flags.includes('entrusted'));
    else { assert.deepEqual(result.value.state.decisions, previous.decisions); assert.deepEqual(result.value.state.inventory, previous.inventory); }
    assert.equal(JSON.parse(raw).state.contentVersion, 3);
  }
});
test('malformed legacy arrivals are rejected before any chapter restart', () => {
  const legacy: any = completeArrival(); legacy.schemaVersion = 2; legacy.contentVersion = 3; delete legacy.journey;
  for (const bad of ['flags', 'clues', 'inventory', 'quests']) {
    const copy = structuredClone(legacy); copy[bad] = 'invalid';
    const result = decodeSave(JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: copy }), content);
    assert.equal(result.ok, false, bad);
  }
});
test('collection details require the system and an actually examined object, and reward only once', () => {
  let early = completeArrival(); early = act(early, { type: 'inspect', hotspotId: 'photo' });
  assert.equal(transition(early, { type: 'study-collection', entryId: 'family-photo' }, content).changed, false);
  let s = act(finishMorning(), { type: 'travel' });
  assert.equal(transition(s, { type: 'study-collection', entryId: 'family-photo' }, content).changed, false);
  s = act(s, { type: 'revisit', chapterId: 'arrival' }); s = act(s, { type: 'inspect', hotspotId: 'photo' });
  s = act(s, { type: 'study-collection', entryId: 'family-photo' }); assert.ok(s.clues.includes('photo-margin'));
  assert.equal(transition(s, { type: 'study-collection', entryId: 'family-photo' }, content).changed, false);
  s = act(s, { type: 'inspect', hotspotId: 'phone' }); s = act(s, { type: 'study-collection', entryId: 'my-phone' });
  assert.ok(s.clues.includes('my-first-pay'));
  s = act(s, { type: 'talk', hotspotId: 'grandma' }); s = act(s, { type: 'choose', choiceId: 'grandma-ask-photo-margin' });
  assert.equal(s.dialogue?.nodeId, 'grandma-new-neighbor');
});
test('revisiting at night preserves placements and changes the old-home lighting', () => {
  let s = finishMorning(); s = act(s, { type: 'revisit', chapterId: 'arrival' }); s = act(s, { type: 'interact', hotspotId: 'tea', actionId: 'offer-tea' });
  s = act(s, { type: 'resume-journey' }); s = finishNoon(s); s = act(s, { type: 'travel' });
  s = act(s, { type: 'revisit', chapterId: 'arrival' });
  assert.equal(sceneOf(s, content).asset, 'arrival-home-evening'); assert.ok(s.flags.includes('tea-offered'));
});

test('the packed book leaves the desk and returns with the player on a later home visit', () => {
  const book = content.chapters[0].hotspots.find(h => h.id === 'book')!;
  assert.ok(matches(act(createState(content), { type: 'start' }), book.condition));
  const packed = completeArrival();
  assert.equal(matches(packed, book.condition), false);
  assert.ok(featureUnlocked(packed, content, 'journal'));
  const returned = act(finishMorning(), { type: 'revisit', chapterId: 'arrival' });
  assert.ok(matches(returned, book.condition));
  assert.equal(returned.inventory['baiwei-book'], 1);
});
test('new content references for recipes, guides and collection fragments are checked', () => {
  const broken = structuredClone(content);
  broken.recipes![0]!.asset = 'missing-art'; broken.progression!.guides[0]!.target = 'missing-object';
  broken.collection![0]!.study!.effects = [{ kind: 'clue', id: 'missing-fragment' }];
  const errors = validateContent(broken).join('\n'); assert.match(errors, /食谱插图/); assert.match(errors, /引导物件/); assert.match(errors, /missing-fragment/);
});
test('all panel corners are square slices and floral art is never a stretchable skin', () => {
  assert.equal(frameSizes['ui-osmanthus'], undefined);
  for (const [name, size] of Object.entries(frameSizes)) {
    const asset = content.assets[name]!; const slices = frameSlices(asset, size.source);
    assert.equal(slices.length, 9);
    for (const i of [0,2,6,8]) assert.equal(slices[i]!.region!.width, slices[i]!.region!.height, name);
    assert.ok(slices.every(s => s.region!.width > 0 && s.region!.height > 0));
    assert.ok(!asset.url.endsWith('wood-v1.png'));
  }
});
