import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { transition, matches } from '../src/core/engine.ts';
import { decodeSave } from '../src/infrastructure/saves.ts';
import { shopChapters, shopDialogues, shopGames } from '../src/content/chapters/shops.ts';
import { packingErrors } from '../src/features/minigames/dual-packing.ts';
import { act, choices, finishMorning, finishNoon, nightCounterReady, nightDecision, finishNight } from './helpers.ts';
const envelope = (state: unknown) => JSON.stringify({ format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state });
const speaker = (s: import('../src/core/contracts.ts').GameState) => content.dialogues.find(d=>d.id===s.dialogue?.id)?.nodes.find(n=>n.id===s.dialogue?.nodeId)?.speaker;

test('clicking Xu starts with Xu before and after Luos departure and while Liangs words are pending', () => {
  let s=act(nightCounterReady(),{type:'talk',hotspotId:'night-xu-counter'});
  assert.equal(speaker(s),'许叔');
  s=choices(s,['night-xu-let-luo-leave']);assert.equal(speaker(s),'罗姐');
  s=act(s,{type:'close-dialogue'});s=act(s,{type:'talk',hotspotId:'night-xu-counter'});assert.equal(speaker(s),'许叔');
  s=choices(s,['night-xu-let-luo-leave','night-luo-leave']);assert.equal(speaker(s),'许叔');
  s=choices(s,['night-agree','night-pass-box']);assert.equal(speaker(s),'小梁');
  s=act(s,{type:'close-dialogue'});s=act(s,{type:'talk',hotspotId:'night-xu-counter'});assert.equal(speaker(s),'许叔');
  assert.equal(s.dialogue?.nodeId,'xu-liang');
  s=choices(s,['night-xu-listen-liang']);assert.equal(speaker(s),'小梁');
  assert.ok(decodeSave(envelope(s),content).ok);
});
test('talking to Liang completes the same pickup once, then Xu resumes the closing conversation', () => {
  let s=choices(nightDecision(),['night-agree','night-pass-box']);s=act(s,{type:'close-dialogue'});
  s=act(s,{type:'talk',hotspotId:'night-liang'});assert.equal(speaker(s),'小梁');
  s=choices(s,['night-liang-record']);assert.ok(s.flags.includes('night-pickup'));assert.ok(s.clues.includes('night-private-liang'));
  assert.equal(s.rewards.filter(id=>id==='night-pickup-record').length,1);
  s=act(s,{type:'talk',hotspotId:'night-xu-counter'});assert.equal(s.dialogue?.nodeId,'closing');assert.equal(speaker(s),'许叔');
  s=choices(s,['night-lock-up','night-farewell']);assert.ok(matches(s,content.chapters[3]!.exit));
  assert.ok(decodeSave(envelope(s),content).ok);
});

test('night gates, cancellation and wrong-scene completion cannot bypass preparing both orders', () => {
  let s = act(finishNoon(), { type: 'travel' });
  const command = { type: 'finish-minigame' as const, gameId: 'night-game', result: { status: 'completed' as const, score: 100, assisted: false } };
  assert.equal(transition(s, command, content).changed, false);
  assert.equal(transition(s, { type: 'move', sceneId: 'night-kitchen' }, content).changed, false);
  s = nightDecision(); assert.ok(!matches(s, content.chapters[3]!.exit));
  assert.equal(transition(s, command, content).changed, false);
});
test('all three decisions resume their uncompleted scenes and close only after the private conversation', () => {
  for (const [decision, pending, record, result] of [
    ['night-agree', 'pickup-arrival', 'night-pickup-record', 'night-pickup'],
    ['night-cancel', 'cancelled', 'night-cancel-record', 'night-called-off'],
    ['night-overpromise', 'missed', 'night-missed-record', 'night-missed'],
  ]) {
    let s = choices(nightDecision(), [decision!]);
    const checkpoint = decodeSave(envelope(s), content); assert.ok(checkpoint.ok);
    s = act(checkpoint.value.state, { type: 'close-dialogue' }); s = act(s, { type: 'talk', hotspotId: 'night-handoff-clip' });
    assert.equal(s.dialogue?.nodeId, pending);
    if (decision === 'night-agree') s = choices(s, ['night-pass-box']);
    s = choices(s, [record!]); assert.ok(s.flags.includes(result!));
    assert.equal(transition(s, { type: 'travel' }, content).changed, false);
    s = act(s, { type: 'close-dialogue' }); s = act(s, { type: 'talk', hotspotId: 'night-xu-counter' }); assert.equal(s.dialogue?.nodeId, 'closing');
    s = choices(s, [decision === 'night-agree' ? 'night-lock-up' : 'night-fold-xu-note', 'night-farewell']);
    assert.ok(matches(s, content.chapters[3]!.exit)); assert.ok(s.flags.includes('night-box-removed'));
    assert.equal(s.flags.filter(f => ['night-pickup', 'night-called-off', 'night-missed'].includes(f)).length, 1);
    assert.equal(s.clues.includes('night-private-liang'), decision === 'night-agree');
    assert.equal(s.clues.includes('night-private-xu'), decision !== 'night-agree');
    const previous = structuredClone(s); s = act(s, { type: 'talk', hotspotId: 'night-handoff-clip' }); assert.equal(s.dialogue?.nodeId, 'after');
    s = choices(s, ['night-farewell']); assert.deepEqual(s.decisions, previous.decisions);
    assert.deepEqual(s.metrics, previous.metrics); assert.deepEqual(s.inventory, previous.inventory);
  }
});
test('both insulation options, bad food notes and absent bags are checked independently', () => {
  const plan = content.minigames.find(g => g.id === 'night-game')!.packing!;
  const packed = Object.fromEntries(plan.orders.map(o => [o.id, { ...o, rice: true, tofu: true }]));
  assert.deepEqual(packingErrors(plan, packed, true, 'sleeve', false), []);
  assert.deepEqual(packingErrors(plan, packed, true, 'bag', true), []);
  assert.ok(packingErrors(plan, packed, true, 'bag', false).length);
  assert.ok(packingErrors(plan, { ...packed, liang: { ...packed.liang!, sauce: 'mixed', utensils: 'inside' } }, true, 'sleeve', false).length >= 2);
  assert.ok(packingErrors(plan, packed, false, 'sleeve', true).length);
});
test('unfinished v4 restarts at the night entrance and completed v4 preserves its result without invented pickup', () => {
  const legacy = { ...content, version: 4, chapters: content.chapters.map(c => c.id === 'night' ? shopChapters[0]! : c), dialogues: [...content.dialogues.filter(d => !d.id.startsWith('night-')), ...shopDialogues], minigames: [...content.minigames.filter(g => g.chapterId !== 'night'), ...shopGames] };
  for (const outcome of ['active', 'completed', 'failed'] as const) {
    let old = act(finishNoon(), { type: 'travel' }); old.contentVersion = 4; old.sceneId = 'night-main'; old.journey.sceneId = 'night-main'; old.seenScenes = old.seenScenes.map(id => id === 'night-front' ? 'night-main' : id);
    old = transition(old, { type: 'talk', hotspotId: 'night-person' }, legacy).state;
    for (const choiceId of ['night-listen', 'night-thanks']) old = transition(old, { type: 'choose', choiceId }, legacy).state;
    if (outcome !== 'active') {
      old = transition(old, { type: 'finish-minigame', gameId: 'night-game', result: { status: 'completed', score: 100, assisted: false } }, legacy).state;
      old = transition(old, { type: 'talk', hotspotId: 'night-person' }, legacy).state;
      for (const choiceId of ['night-decide', outcome === 'completed' ? 'night-agree' : 'night-overpromise']) old = transition(old, { type: 'choose', choiceId }, legacy).state;
    }
    const raw = envelope(old), loaded = decodeSave(raw, content); assert.ok(loaded.ok, loaded.ok ? '' : loaded.error);
    const s = loaded.value.state; assert.equal(s.contentVersion, 5); assert.equal(s.sceneId, 'night-front'); assert.deepEqual(s.decisions.noon, old.decisions.noon);
    assert.equal(s.flags.includes('night-ended'), outcome !== 'active'); assert.equal(s.flags.includes('night-legacy'), outcome !== 'active');
    assert.ok(!s.flags.includes('night-pickup')); assert.equal(s.quests.night, outcome); assert.equal(JSON.parse(raw).state.contentVersion, 4);
    const bad = structuredClone(old); bad.flags.push('not-a-real-flag'); assert.equal(decodeSave(envelope(bad), content).ok, false);
    if (outcome !== 'active') {
      const oldEnding = transition(old, { type: 'travel' }, legacy).state;
      const restoredEnding = decodeSave(envelope(oldEnding), content); assert.ok(restoredEnding.ok);
      assert.equal(restoredEnding.value.state.phase, 'ending'); assert.equal(restoredEnding.value.state.chapterId, 'epilogue');
      assert.ok(restoredEnding.value.state.flags.includes('night-legacy')); assert.ok(!restoredEnding.value.state.flags.includes('night-pickup'));
    }
  }
});
test('the new chapter roundtrips every scene, retries and a revisit without duplicating rewards', () => {
  let s = nightDecision(); s = act(s, { type: 'close-dialogue' }); const care = s.metrics.care;
  s = act(s, { type: 'move', sceneId: 'night-kitchen' });
  const repeat = { type: 'finish-minigame' as const, gameId: 'night-game', result: { status: 'completed' as const, score: 100, assisted: true } };
  assert.equal(transition(s, repeat, content).state.metrics.care, care);
  for (const sceneId of ['night-front', 'night-kitchen', 'night-counter']) {
    if (sceneId !== s.sceneId) s = act(s, { type: 'move', sceneId });
    assert.ok(decodeSave(envelope(s), content).ok);
  }
  const end = finishNight('pickup'), metrics = structuredClone(end.metrics);
  s = act(end, { type: 'revisit', chapterId: 'arrival' }); s = act(s, { type: 'resume-journey' });
  assert.equal(s.sceneId, end.sceneId); assert.deepEqual(s.metrics, metrics); assert.ok(s.flags.includes('night-pickup'));
});
