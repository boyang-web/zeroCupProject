import type { Asset } from '../core/contracts';
export function woodVariables(assets: Record<string, Asset>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of ['button', 'hover', 'selected', 'header', 'tab', 'close', 'toggle', 'slider']) {
    const alias: Record<string, string> = { tab: 'button', toggle: 'close', slider: 'header' };
    const asset = assets['ui-' + (alias[name] ?? name)], r = asset?.region; if (!r) continue;
    result[`--wood-${name}-image`] = `url("${asset.url}")`;
    result[`--wood-${name}-size`] = `${r.canvasWidth / r.width * 100}% ${r.canvasHeight / r.height * 100}%`;
    result[`--wood-${name}-position`] = `${r.canvasWidth===r.width?0:r.x / (r.canvasWidth - r.width) * 100}% ${r.canvasHeight===r.height?0:r.y / (r.canvasHeight - r.height) * 100}%`;
  }
  return result;
}
