"""Convert the built Pages artifact to WebP; public/ originals are never touched."""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

dist = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist').resolve()
if not (dist / 'index.html').is_file():
    raise SystemExit(f'{dist} is not a built directory containing index.html')

pngs = sorted(dist.rglob('*.png'))
if not pngs:
    raise SystemExit('no PNG assets found; refusing to publish an unconverted artifact')


def convert(src: Path):
    target = src.with_suffix('.webp')
    with Image.open(src) as im:
        dimensions = im.size
        im.save(target, 'WEBP', quality=82, method=6, exact=True)
    with Image.open(target) as result:
        assert result.size == dimensions, f'{src.name} changed dimensions'
    original = src.stat().st_size
    src.unlink()
    return original, target.stat().st_size


with ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(convert, pngs))
before = sum(b for b, _ in sizes)
after = sum(a for _, a in sizes)

# Asset URLs are assembled at runtime, so `.png` survives in the bundle as bare
# fragments like `-v1.png`; only a global replacement catches every reference.
rewritten = 0
for pattern in ('*.js', '*.css', '*.html'):
    for path in dist.rglob(pattern):
        text = path.read_text(encoding='utf8')
        if '.png' in text:
            path.write_text(text.replace('.png', '.webp'), encoding='utf8')
            rewritten += 1

print(f'converted {len(pngs)} PNG -> WebP')
print(f'asset bytes {before} -> {after} ({after / before:.1%})')
print(f'rewrote .png references in {rewritten} text files')