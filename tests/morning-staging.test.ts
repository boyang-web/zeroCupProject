import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { matches } from '../src/core/conditions.ts';
import { scenesOf } from '../src/core/scenes.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { act, choices, enterMorning, finishMorning, morningDecision } from './helpers.ts';

const scenes = scenesOf(content.chapters.find(c => c.id === 'morning')!);
const front = scenes.find(s => s.id === 'morning-front')!;
const kitchen = scenes.find(s => s.id === 'morning-kitchen')!;
const yard = scenes.find(s => s.id === 'morning-yard')!;

test('moving the front stool changes Chens pose and removes the spare copy', () => {
  const state = act(enterMorning(), { type: 'interact', hotspotId: 'front-stool', actionId: 'move-stool' });
  const chen = front.hotspots.find(h => h.id === 'morning-person')!;
  const stool = front.hotspots.find(h => h.id === 'front-stool')!;
  assert.equal(matches(state, stool.condition), false);
  assert.equal(chen.variants!.find(v => matches(state, v.condition))!.asset, 'chen-seated');
});

test('the meal uses seated people and hides their empty seats without duplicating Chen', () => {
  const state = morningDecision();
  assert.equal(matches(state, front.hotspots.find(h => h.id === 'morning-person')!.condition), false);
  assert.ok(matches(state, yard.hotspots.find(h => h.id === 'chen-yard')!.condition));
  assert.equal(yard.hotspots.find(h => h.id === 'ning')!.variants!.find(v => matches(state, v.condition))!.asset, 'ning-seated');
  assert.equal(yard.decorations!.filter(d => d.id.endsWith('empty-seat') && matches(state, d.condition)).length, 0);
  const after = finishMorning('table');
  assert.equal(matches(after, front.hotspots.find(h => h.id === 'morning-person')!.condition), false);
  assert.ok(matches(after, yard.hotspots.find(h => h.id === 'chen-yard')!.condition));
  const later = act(after, { type: 'travel' });
  assert.ok(matches(later, front.hotspots.find(h => h.id === 'morning-person')!.condition));
  assert.equal(matches(later, yard.hotspots.find(h => h.id === 'chen-yard')!.condition), false);
});

test('borrowed tote leaves its cabinet and served food leaves the pickup ledge', () => {
  let state = act(enterMorning(), { type: 'talk', hotspotId: 'morning-person' });
  state = choices(state, ['morning-listen', 'morning-thanks']);
  state = act(state, { type: 'move', sceneId: 'morning-kitchen' });
  state = act(state, { type: 'interact', hotspotId: 'cabinet', actionId: 'borrow-with-key' });
  assert.equal(matches(state, kitchen.hotspots.find(h => h.id === 'cabinet')!.condition), false);
  assert.equal(state.inventory['insulated-bag'], 1);
  assert.equal(matches(morningDecision(), front.hotspots.find(h => h.id === 'front-buns')!.condition), false);
});

test('bad scenery and pose references are rejected as content errors', () => {
  const pack = structuredClone(content);
  const room = pack.chapters.find(c => c.id === 'morning')!.scenes!.find(s => s.id === 'morning-yard')!;
  room.hotspots.find(h => h.id === 'ning')!.variants![0].cameraView = 'missing-pose-view';
  room.decorations![0].asset = 'missing-seat';
  room.decorations![0].height = 0;
  const errors = validateContent(pack).join('\n');
  assert.ok(errors.includes('missing-pose-view'));
  assert.ok(errors.includes('陈设资产不存在'));
  assert.ok(errors.includes('陈设位置或尺寸无效'));
});
