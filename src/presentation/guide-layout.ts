export interface GuideRect { left: number; top: number; width: number; height: number }
export function placeGuide(target: GuideRect, card: { width: number; height: number }, viewport: { width: number; height: number }) {
  const margin = 16, top = viewport.height > 620 ? 104 : 66;
  const bottom = viewport.height - (viewport.width <= 720 ? 126 : margin);
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(Math.max(min, max), value));
  const right = target.left + target.width, foot = target.top + target.height;
  const cx = target.left + target.width / 2, cy = target.top + target.height / 2;
  const candidates = [
    { x: cx - card.width / 2, y: target.top - card.height - 48 },
    { x: right + 48, y: cy - card.height / 2 },
    { x: target.left - card.width - 48, y: cy - card.height / 2 },
    { x: cx - card.width / 2, y: foot + 48 },
  ].map(p => {
    const x = clamp(p.x, margin, viewport.width - card.width - margin), y = clamp(p.y, top, bottom - card.height);
    const overlap = Math.max(0, Math.min(x + card.width, right + 12) - Math.max(x, target.left - 12)) * Math.max(0, Math.min(y + card.height, foot + 12) - Math.max(y, target.top - 12));
    return { x, y, score: overlap * 1000 + Math.abs(p.x - x) + Math.abs(p.y - y) };
  });
  const best = candidates.sort((a, b) => a.score - b.score)[0]!;
  const horizontal = best.x + card.width <= target.left || best.x >= right;
  const start = horizontal ? {
    x: best.x + (best.x < cx ? card.width + 3 : -3), y: clamp(cy, best.y + 24, best.y + card.height - 24),
  } : { x: clamp(cx, best.x + 24, best.x + card.width - 24), y: best.y + (best.y < cy ? card.height + 3 : -3) };
  const end = horizontal ? {
    x: best.x < cx ? target.left - 9 : right + 9, y: clamp(start.y, target.top + 5, foot - 5),
  } : { x: clamp(start.x, target.left + 5, right - 5), y: best.y < cy ? target.top - 9 : foot + 9 };
  const middle = horizontal ? (start.x + end.x) / 2 : (start.y + end.y) / 2;
  const path = horizontal ? `M ${start.x} ${start.y} C ${middle} ${start.y}, ${middle} ${end.y}, ${end.x} ${end.y}` : `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
  return { x: best.x, y: best.y, path };
}
