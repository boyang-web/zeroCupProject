import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, ref } from 'vue';
import { useReadingSequence } from '../src/presentation/useReadingSequence.ts';
import { placeGuide } from '../src/presentation/guide-layout.ts';

function clock() {
  let now = 0;
  const jobs = new Set<{ at: number; callback: () => void }>();
  return {
    schedule(callback: () => void, delay: number) { const job = { at: now + delay, callback }; jobs.add(job); return () => { jobs.delete(job); }; },
    tick(ms: number) {
      const end = now + ms;
      for (;;) {
        const job = [...jobs].sort((a,b) => a.at - b.at)[0];
        if (!job || job.at > end) break;
        now = job.at; jobs.delete(job); job.callback();
      }
      now = end;
    },
    get pending() { return jobs.size; },
  };
}

test('reading presents directions, then dialogue, then separate choices without splitting Unicode', () => {
  const timer = clock(), scope = effectScope();
  const reading = scope.run(() => useReadingSequence({ texts: () => ['抬头。', '坐坐，喝茶🍵。'], actions: () => 3 }, timer.schedule))!;
  assert.deepEqual(reading.visibleCounts.value, [0, 0]);
  timer.tick(120); assert.deepEqual(reading.visibleCounts.value, [1, 0]);
  timer.tick(60); assert.deepEqual(reading.visibleCounts.value, [3, 0]); assert.equal(reading.visibleActions.value, 0);
  timer.tick(1000);
  assert.deepEqual(reading.visibleCounts.value, [3, 7]); assert.ok(reading.textDone.value);
  timer.tick(1000); assert.equal(reading.visibleActions.value, 3);
  scope.stop(); assert.equal(timer.pending, 0);
});

test('show-full-text never chooses a response and still reveals actions one at a time', () => {
  const timer = clock(), scope = effectScope();
  const reading = scope.run(() => useReadingSequence({ texts: () => ['还没有说完的话。'], actions: () => 3 }, timer.schedule))!;
  reading.finishText(); assert.ok(reading.textDone.value); assert.equal(reading.visibleActions.value, 0);
  timer.tick(179); assert.equal(reading.visibleActions.value, 0);
  timer.tick(1); assert.equal(reading.visibleActions.value, 1);
  reading.finishText(); timer.tick(149); assert.equal(reading.visibleActions.value, 1);
  timer.tick(1); assert.equal(reading.visibleActions.value, 2);
  timer.tick(150); assert.equal(reading.visibleActions.value, 3);
  scope.stop();
});

test('ordinary commas keep a short breath and sentences no longer hold up the following text', () => {
  const timer = clock(), scope = effectScope();
  const reading = scope.run(() => useReadingSequence({ texts: () => ['好，接着说。还行。'], actions: () => 1 }, timer.schedule))!;
  timer.tick(146); assert.deepEqual(reading.visibleCounts.value, [2]);
  timer.tick(44); assert.deepEqual(reading.visibleCounts.value, [2]);
  timer.tick(1); assert.deepEqual(reading.visibleCounts.value, [3]);
  timer.tick(78); assert.deepEqual(reading.visibleCounts.value, [6]);
  timer.tick(119); assert.deepEqual(reading.visibleCounts.value, [6]);
  timer.tick(1); assert.deepEqual(reading.visibleCounts.value, [7]);
  assert.equal(reading.visibleActions.value, 0);
  scope.stop(); assert.equal(timer.pending, 0);
});

test('changing a node or closing the view cancels the previous reading schedule', () => {
  const timer = clock(), scope = effectScope(), text = ref('这是一段长话。');
  const reading = scope.run(() => useReadingSequence({ texts: () => [text.value], actions: () => 2 }, timer.schedule))!;
  timer.tick(160); text.value = '新话';
  assert.deepEqual(reading.visibleCounts.value, [0]); assert.equal(reading.visibleActions.value, 0);
  timer.tick(120); assert.deepEqual(reading.visibleCounts.value, [1]);
  scope.stop(); timer.tick(10000);
  assert.deepEqual(reading.visibleCounts.value, [1]); assert.equal(reading.visibleActions.value, 0); assert.equal(timer.pending, 0);
});

test('an explicit tap at the final line can reveal all answers and cancels their remaining animation',()=>{
  const timer=clock(),scope=effectScope();
  const reading=scope.run(()=>useReadingSequence({texts:()=>['说完这一句再回答。'],actions:()=>4},timer.schedule))!;
  reading.finishText();timer.tick(180);assert.equal(reading.visibleActions.value,1);
  reading.revealActions();assert.equal(reading.visibleActions.value,4);assert.equal(timer.pending,0);
  timer.tick(5000);assert.equal(reading.visibleActions.value,4);
  scope.stop();
});

test('a new reading restarts after rapid reveal even when both turns have the same words',()=>{
  const timer=clock(),scope=effectScope(),page=ref(0);
  const reading=scope.run(()=>useReadingSequence({identity:()=>String(page.value),texts:()=>['好。'],actions:()=>2},timer.schedule))!;
  reading.revealActions();page.value++;
  assert.equal(reading.textDone.value,false);assert.equal(reading.visibleActions.value,0);assert.deepEqual(reading.visibleCounts.value,[0]);
  reading.finishText();scope.stop();timer.tick(5000);assert.equal(reading.visibleActions.value,0);
});

test('unlocking the recipe link does not rewind already read text, and reduced motion removes the wait', () => {
  const timer = clock(), scope = effectScope(), actions = ref(1), reduced = ref(false);
  const reading = scope.run(() => useReadingSequence({ texts: () => ['旧方子。'], actions: () => actions.value, reduced: () => reduced.value }, timer.schedule))!;
  reading.finishText(); timer.tick(180); actions.value = 2;
  assert.deepEqual(reading.visibleCounts.value, [4]); assert.ok(reading.textDone.value); assert.equal(reading.visibleActions.value, 1);
  timer.tick(180); assert.equal(reading.visibleActions.value, 2);
  reduced.value = true; assert.equal(timer.pending, 0); assert.equal(reading.visibleActions.value, 2);
  reduced.value = false; assert.ok(reading.textDone.value); assert.equal(timer.pending, 0);
  scope.stop();
});

test('tutorial windows stay inside the viewport and leave the indicated object or mobile shortcut exposed', () => {
  for (const item of [
    { target: { left: 70, top: 615, width: 100, height: 50 }, card: { width: 360, height: 330 }, screen: { width: 1600, height: 900 } },
    { target: { left: 1008, top: 216, width: 448, height: 639 }, card: { width: 360, height: 330 }, screen: { width: 1600, height: 900 } },
    { target: { left: 22, top: 726, width: 80, height: 35 }, card: { width: 358, height: 340 }, screen: { width: 390, height: 844 } },
    { target: { left: 1450, top: 40, width: 100, height: 48 }, card: { width: 360, height: 330 }, screen: { width: 1600, height: 900 } },
  ]) {
    const result = placeGuide(item.target, item.card, item.screen);
    assert.ok(result.x >= 16 && result.x + item.card.width <= item.screen.width - 16);
    assert.ok(result.y >= 66 && result.y + item.card.height <= item.screen.height - 16);
    const overlapX = Math.min(result.x + item.card.width, item.target.left + item.target.width) - Math.max(result.x, item.target.left);
    const overlapY = Math.min(result.y + item.card.height, item.target.top + item.target.height) - Math.max(result.y, item.target.top);
    assert.ok(overlapX <= 0 || overlapY <= 0);
    assert.ok(!result.path.includes('NaN'));
  }
});
