import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraScrollLeft, frameCamera } from '../src/presentation/scene-camera.ts';
import { content } from '../src/content/index.ts';
import { validateContent } from '../src/core/validate-content.ts';
import { scenesOf } from '../src/core/scenes.ts';

test('camera framing keeps the illustration covering all four viewport edges', () => {
  for (const x of [0, 29, 50, 61, 100]) for (const y of [0, 43, 79, 100]) for (const zoom of [1, 1.45, 1.75, 2, 4]) {
    const camera = frameCamera({ x, y, zoom });
    assert.ok(camera.x <= 0 && camera.y <= 0);
    assert.ok(camera.x + camera.zoom * 100 >= 100 - 1e-10);
    assert.ok(camera.y + camera.zoom * 100 >= 100 - 1e-10);
  }
});

test('a middle target is centered, overview is exact, and invalid coordinates recover', () => {
  const camera = frameCamera({ x: 61, y: 49, zoom: 1.5 });
  assert.equal(61 * camera.zoom + camera.x, 50);
  assert.equal(49 * camera.zoom + camera.y, 50);
  assert.deepEqual(frameCamera(), { x: 0, y: 0, zoom: 1 });
  assert.deepEqual(frameCamera({ x: NaN, y: 49, zoom: 1.5 }), frameCamera());
});

test('scene camera references and unsafe framing values are validated', () => {
  const pack = structuredClone(content);
  const chapter = pack.chapters[0];
  assert.ok(scenesOf(chapter)[0].camera);
  chapter.hotspots[0].cameraView = 'missing-view';
  chapter.camera!.views[0].zoom = Infinity;
  const errors = validateContent(pack).join('\n');
  assert.ok(errors.includes('missing-view'));
  assert.ok(errors.includes('镜头参数超出范围'));
});

test('narrow windows keep interaction targets visible at both painted edges', () => {
  const canvasWidth = 1500, viewportWidth = 420;
  for (const x of [0, 14, 24, 33, 48, 75, 91, 100]) for (const zoom of [1, 1.6, 2]) {
    const view = { x, y: 60, zoom }, camera = frameCamera(view);
    const scrollLeft = cameraScrollLeft(view, canvasWidth, viewportWidth);
    const screenX = (x * camera.zoom + camera.x) / 100 * canvasWidth - scrollLeft;
    assert.ok(scrollLeft >= 0 && scrollLeft <= canvasWidth - viewportWidth);
    assert.ok(screenX >= -1e-10 && screenX <= viewportWidth + 1e-10, `${x}/${zoom}: target outside observation window`);
  }
  assert.ok(Math.abs(cameraScrollLeft({ x: 14, y: 60, zoom: 1.6 }, 1500, 420) - 126) < 1e-9);
  assert.equal(cameraScrollLeft({ x: 14, y: 60, zoom: 1.6 }, 400, 800), 0);
  assert.equal(cameraScrollLeft({ x: NaN, y: 60, zoom: 1.6 }, 1500, 420), 0);
});
