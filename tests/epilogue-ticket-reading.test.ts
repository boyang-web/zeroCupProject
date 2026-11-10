import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { dialogueChoicesOnly, dialogueReadings } from '../src/presentation/dialogue-readings.ts';
import { act, choices, finishNight } from './helpers.ts';

const dialogue = content.dialogues.find(d => d.id === 'epilogue-departure')!;
const options = dialogue.nodes.find(n => n.id === 'options')!;
function table() {
  let s = act(finishNight(), { type: 'travel' });
  s = choices(act(s, { type: 'talk', hotspotId: 'epilogue-grandmother' }), ['epilogue-sit']);
  s = act(s, { type: 'move', sceneId: 'epilogue-table' });
  for (const id of ['morning','noon','night']) s = act(s, { type: 'inspect', hotspotId: `epilogue-page-${id}` });
  s = act(s, { type: 'finish-minigame', gameId: 'epilogue-filing', result: { status: 'completed', score: 100, assisted: false } });
  return choices(act(s, { type: 'talk', hotspotId: 'epilogue-table-grandma' }), ['epilogue-reviewed']);
}
test('the train ticket explains times once, then opens directly at choices even without a selected topic', () => {
  let s = act(table(), { type: 'talk', hotspotId: 'epilogue-ticket' });
  assert.equal(s.dialogue?.nodeId, 'ticket');
  assert.ok(dialogueReadings(dialogue.nodes.find(n => n.id === 'ticket')!, s).some(b => b.text.includes('八点二十')));
  s = choices(s, ['epilogue-times']);
  assert.ok(dialogueChoicesOnly(options, s));
  assert.ok(dialogueReadings(options, s).every(b => !b.text));
  s = act(act(s, { type: 'close-dialogue' }), { type: 'talk', hotspotId: 'epilogue-ticket' });
  assert.equal(s.dialogue?.nodeId, 'options');
  assert.ok(dialogueChoicesOnly(options, s));
  s = choices(s, ['epilogue-wait']);
  s = act(s, { type: 'talk', hotspotId: 'epilogue-ticket' });
  assert.equal(s.dialogue?.nodeId, 'options');
  assert.ok(dialogueChoicesOnly(options, s));
});
test('an interrupted topic still resumes its answer; returning skips the repeated train-ticket introduction', () => {
  let s = table(); s.clues.push('calendar');
  s = choices(act(s, { type: 'talk', hotspotId: 'epilogue-ticket' }), ['epilogue-times', 'epilogue-ask-calendar']);
  s = act(act(s, { type: 'close-dialogue' }), { type: 'talk', hotspotId: 'epilogue-ticket' });
  assert.equal(s.dialogue?.nodeId, 'calendar');
  s = choices(s, ['epilogue-back-calendar']);
  assert.equal(s.dialogue?.nodeId, 'options');
  assert.ok(dialogueChoicesOnly(options, s));
  assert.ok(dialogueReadings(options, s).every(b => !b.text));
});
