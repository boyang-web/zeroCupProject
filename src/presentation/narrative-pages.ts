// Reading pages are a view concern. They never advance dialogue choices.
export function narrativePages(text: string, limit = 160, openingLength = 0): string[] {
  const size = Number.isFinite(limit) ? Math.max(40, Math.floor(limit)) : 160;
  const firstSize = Math.max(Math.min(60, size), size - (Number.isFinite(openingLength) ? Math.max(0, openingLength) : 0));
  let remaining = Array.from(text.trim());
  const pages: string[] = [];
  while (remaining.length > (pages.length ? size : firstSize)) {
    const capacity = pages.length ? size : firstSize;
    let end = capacity;
    for (let i = capacity - 1; i >= Math.floor(capacity * .55); i--) {
      if (/[。！？!?\n]/u.test(remaining[i]!)) { end = i + 1; break; }
    }
    while (/[”’」』]/u.test(remaining[end] ?? '')) end++;
    pages.push(remaining.slice(0, end).join('').trim());
    remaining = Array.from(remaining.slice(end).join('').trimStart());
  }
  if (remaining.length || !pages.length) pages.push(remaining.join(''));
  return pages;
}
