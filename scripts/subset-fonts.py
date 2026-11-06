"""Build local OFL webfont subsets; the upstream font is never modified."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = root / '.tmp/fonts/LXGWWenKai-Regular.ttf'
if not source.exists():
    raise SystemExit('Download LXGWWenKai-Regular.ttf from the official source to .tmp/fonts first. See public/assets/fonts/README.md.')
text = ''.join(p.read_text(encoding='utf-8-sig') for p in (root / 'src').rglob('*') if p.suffix in ('.ts', '.vue', '.css'))
text += ''.join(chr(i) for i in range(32, 127)) + '百味录长明巷归家秋〇一二三四五六七八九十·，。！？：“”‘’（）《》—…←→＋−'
target = root / 'public/assets/fonts'
target.mkdir(parents=True, exist_ok=True)
for name, chars in [('BaiweiHand', text), ('BaiweiTitle', '百味录长明巷归家秋食录')]:
    font = TTFont(source)
    options = subset.Options()
    options.flavor = 'woff'
    options.hinting = False
    options.recalc_average_width = True
    worker = subset.Subsetter(options=options)
    worker.populate(text=chars)
    worker.subset(font)
    # Subsets are renamed; original author/license name records remain intact.
    for record in font['name'].names:
        if record.nameID in (1, 3, 4, 6, 16):
            record.string = name.encode(record.getEncoding(), errors='replace')
    font.flavor = 'woff'
    output = target / (name + '.woff')
    font.save(output)
    print(f'{output.name}: {output.stat().st_size} bytes')
