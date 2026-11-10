import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.ts';
import { objectModels } from '../src/content/object-models.ts';

test('every collectible and carried item resolves to a dedicated inspection model', () => {
  const ids = [...(content.collection ?? []), ...content.items].map(item => item.id);
  for (const id of ids) assert.ok(objectModels[id], `Missing inspection model: ${id}`);
  assert.deepEqual(Object.keys(objectModels).sort(), ids.sort());
  assert.equal(objectModels['old-book'], objectModels['baiwei-book']);
});
