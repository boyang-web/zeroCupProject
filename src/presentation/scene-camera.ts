import type { SceneCameraView } from '../core/contracts.ts';

export interface CameraTransform { x: number; y: number; zoom: number }
export const overviewCamera: CameraTransform = { x: 0, y: 0, zoom: 1 };

// Translate in the unscaled canvas coordinate system. Clamp both edges so a
// close view cannot expose unpainted space outside the existing illustration.
export function frameCamera(view?: Pick<SceneCameraView, 'x' | 'y' | 'zoom'>): CameraTransform {
  if (!view || ![view.x, view.y, view.zoom].every(Number.isFinite)) return { ...overviewCamera };
  const zoom = Math.max(1, Math.min(2, view.zoom));
  const shift = (point: number) => Math.max(100 * (1 - zoom), Math.min(0, 50 - point * zoom));
  return { x: shift(view.x), y: shift(view.y), zoom };
}

// A view near a painted edge cannot be centered by translating the artwork.
// Scroll the narrow observation window to the projected target instead.
export function cameraScrollLeft(view: Pick<SceneCameraView, 'x' | 'y' | 'zoom'>, canvasWidth: number, viewportWidth: number): number {
  if (![view.x, view.y, view.zoom, canvasWidth, viewportWidth].every(Number.isFinite) || canvasWidth <= 0 || viewportWidth <= 0 || viewportWidth >= canvasWidth) return 0;
  const camera = frameCamera(view);
  const projectedX = (view.x * camera.zoom + camera.x) / 100 * canvasWidth;
  return Math.max(0, Math.min(canvasWidth - viewportWidth, projectedX - viewportWidth / 2));
}
