import type { Asset } from '../core/contracts.ts';

export const frameSizes: Record<string, { source: number; display: number }> = {
  'ui-frame': { source: 58, display: 27 },
  'ui-menu': { source: 55, display: 28 },
  'ui-paper': { source: 30, display: 18 },
  'ui-book': { source: 35, display: 23 },
  'ui-header': { source: 30, display: 15 },
  'ui-toast': { source: 29, display: 16 },
  'ui-button': { source: 30, display: 13 },
  'ui-hover': { source: 30, display: 13 },
  'ui-selected': { source: 30, display: 13 },
};

// Square source and destination corners retain the same scale on both axes.
// Floral art is rendered separately with contain and never enters these slices.
export function frameSlices(asset: Asset | undefined, sourceCorner: number): Asset[] {
  const r = asset?.region;
  if (!asset || !r) return [];
  const corner = Math.min(sourceCorner, Math.floor(r.width / 3), Math.floor(r.height / 3));
  const xs = [0, corner, r.width-corner, r.width];
  const ys = [0, corner, r.height-corner, r.height];
  return Array.from({ length: 9 }, (_, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    return { ...asset, region: { ...r, x: r.x+xs[col]!, y: r.y+ys[row]!,
      width: xs[col+1]!-xs[col]!, height: ys[row+1]!-ys[row]! } };
  });
}
