import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, ref } from 'vue';
import type { GuideStep } from '../src/core/contracts.ts';
import { content } from '../src/content/index.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { useTutorialPresentation } from '../src/presentation/useTutorialPresentation.ts';

const steps = content.progression!.guides.filter(step => step.chapterId === 'arrival');
function session() {
  const scope = effectScope(), guide = ref<GuideStep | undefined>(steps[0]), suspended = ref(false), inactive = ref(false);
  const tutorial = scope.run(() => useTutorialPresentation({ guide: () => guide.value, suspended: () => suspended.value, inactive: () => inactive.value }))!;
  return { scope, guide, suspended, inactive, ...tutorial };
}

test('each focused lesson allows only its scene object; departure allows optional exploration', () => {
  const s = session();
  for (const step of steps) {
    s.guide.value = step;
    for (const object of content.chapters[0]!.hotspots) {
      assert.equal(s.allowsObject(object.id), !step.focus || object.id === step.target);
    }
  }
  assert.ok(!s.focused.value);
  assert.equal(s.chrome.value, undefined);
  s.scope.stop();
});

test('a lesson advances after the object and its returning camera finish, keeping new UI out of reading panels', () => {
  const s = session();
  s.suspended.value = true;
  s.guide.value = steps[1];
  assert.equal(s.presented.value?.id, 'arrival-look');
  assert.ok(!s.visible.value);
  assert.equal(s.chrome.value, 'minimal');
  s.suspended.value = false;
  assert.equal(s.presented.value?.id, 'arrival-talk');
  assert.ok(s.visible.value);
  assert.ok(!s.allowsObject('phone'));
  s.suspended.value = true;
  s.guide.value = steps[3];
  assert.equal(s.chrome.value, 'minimal');
  s.suspended.value = false;
  assert.equal(s.chrome.value, 'book');
  s.scope.stop();
});

test('collapsing releases the scene and persists across cancelled interactions; reopening restores the same focus', () => {
  const s = session();
  s.minimized.value = true;
  assert.ok(s.allowsObject('tea'));
  assert.equal(s.chrome.value, undefined);
  s.suspended.value = true;
  s.suspended.value = false;
  assert.ok(s.minimized.value);
  s.minimized.value = false;
  assert.ok(!s.allowsObject('tea'));
  s.minimized.value = true;
  s.guide.value = steps[1];
  assert.ok(!s.minimized.value);
  assert.ok(s.allowsObject('grandma'));
  assert.ok(!s.allowsObject('photo'));
  s.scope.stop();
});

test('dialogue suspension holds focus; leaving play or entering developer mode clears the presentation lock', () => {
  const s = session();
  s.guide.value = steps[1];
  s.suspended.value = true;
  s.guide.value = undefined;
  assert.equal(s.presented.value?.target, 'grandma');
  assert.ok(!s.allowsObject('tea'));
  s.inactive.value = true;
  assert.equal(s.presented.value, undefined);
  assert.ok(s.allowsObject('tea'));
  assert.equal(s.chrome.value, undefined);
  s.scope.stop();
});

test('focused lessons must reference a scene object so they cannot lock an empty scene', () => {
  const broken = structuredClone(content);
  const step = broken.progression!.guides.find(step => step.id === 'arrival-look')!;
  delete step.target;
  assert.ok(validateContent(broken).some(error => error.includes('聚焦教学需要场景物件')));
});
