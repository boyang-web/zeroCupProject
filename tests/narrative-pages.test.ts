import { test } from 'node:test';
import assert from 'node:assert/strict';
import { narrativePages } from '../src/presentation/narrative-pages.ts';
import { content } from '../src/content/index.ts';

test('long narrative pages preserve every character and keep closing quotes with their sentence', () => {
  const text = '奶奶把杯子往这边挪了挪。'.repeat(6) + '她说：“慢慢讲，我听着。”\n\n' + '门外的车轮在石板缝里轻轻响了一声。'.repeat(6) + '🍵';
  const pages = narrativePages(text, 65);
  assert.ok(pages.length > 1);
  assert.equal(pages.join('').replace(/\s/gu, ''), text.replace(/\s/gu, ''));
  assert.ok(pages.every(page => Array.from(page).length <= 66 && !/^[”’」』]/u.test(page)));
  assert.ok(!pages.join('').includes('\uFFFD'));
  assert.deepEqual(narrativePages(''), ['']);
});

test('all authored dialogue and inspection paragraphs remain readable without losing content when paged', () => {
  const texts = content.dialogues.flatMap(d => d.nodes.map(n => n.text));
  for (const chapter of content.chapters) for (const scene of chapter.scenes ?? [{ hotspots: chapter.hotspots }]) for (const hotspot of scene.hotspots) {
    if (hotspot.interaction.kind === 'inspect') texts.push(hotspot.interaction.text, ...(hotspot.interaction.versions ?? []).map(version => version.text));
  }
  for (const text of texts) {
    const pages = narrativePages(text);
    assert.equal(pages.join('').replace(/\s/gu, ''), text.replace(/\s/gu, ''));
    assert.ok(pages.every(page => Array.from(page).length <= 162));
  }
});

test('opening actions share the first-page reading space, leaving later dialogue pages their full allowance', () => {
  const text = '奶奶看了看你，把茶杯慢慢放在小几上。'.repeat(15);
  const pages = narrativePages(text, 160, 65);
  assert.ok(Array.from(pages[0]!).length + 65 <= 162);
  assert.ok(pages.slice(1).every(page => Array.from(page).length <= 162));
  assert.equal(pages.join(''), text);
});
