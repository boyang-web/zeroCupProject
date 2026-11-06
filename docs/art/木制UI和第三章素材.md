# 木制UI和第三章素材

日期：2026-11-06。使用内置 imagegen 生成并复制到工程；以下列出实际使用的文件与最终提示词。

## 文件

| 文件 | 用途 |
| --- | --- |
| public/assets/ui/wood-v1.png | 三列四行木制UI图集，12个独立部件 |
| public/assets/noon/front-v1.png | 琴记店堂 |
| public/assets/noon/kitchen-v1.png | 琴记面案 |
| public/assets/noon/corner-v1.png | 琴记柜边 |
| public/assets/noon/people-v1.png | 琴姐、阿川、田姨人物图集 |
| public/assets/noon/props-v1.png | 面碗、调料、吐单机、手机、菜单、账本、筷子、小票 |
| public/assets/noon/plain-bowl-v1.png | 半份无葱面，用于出餐后替换 |

## 木制部件落地

AssetImage 读取各部件透明区域。WoodFrame 将面板切成九块，角部固定，中段随布局延伸。woodVariables 提供按钮常态、高亮、选中、页签、切换和滑轨的贴图参数；文字和图标保持HTML/SVG控件，可用键盘、焦点和屏幕阅读器。低透明度边缘噪声在渲染时处理，原PNG保持不变。

图集里的空白关闭底座与切换底座不自带文字；实际控件叠加清楚的关闭、勾选等符号。没有把整张UI截图当作不可交互页面。

## 最终生成提示词

### ui

```text
Use case: stylized-concept. Asset type: COMPLETE COHESIVE ORNATE CHINESE WOODEN GAME UI SPRITE ATLAS, transparent background, exactly THREE columns by FOUR rows of equal cells, 1536x2048 portrait preferred. Each component centered, completely separated, generous transparent padding, no overlaps, no text or symbols. Premium exquisitely crafted traditional Chinese small-town furniture style: aged dark walnut wood, refined warm golden boxwood inlay, subtle carved osmanthus leaves and restrained cloud-pattern corner scrolls, parchment cream interiors, soft jade-green accents, brass hardware, authentic textured wood grain, painterly semi-realistic game interface assets, beautiful and readable, NOT cartoon, not gothic, not fantasy crystals, no plastic. All panels have wide EMPTY interior for live HTML text. GRID ORDER LEFT TO RIGHT: ROW1: (1) large horizontal dialogue frame about 2:1 with carved dark wood perimeter and empty warm ivory paper center; (2) book/journal frame with cream fibrous blank paper interior and dark wood corner clamps; (3) square menu panel with thin decorative carved wood frame and blank cream paper center. ROW2: (4) normal wide rectangular dark walnut button with brass rim and blank dark wood center; (5) highlighted wide rectangular button same shape with lighter honey wood and jade inlay rim, blank center; (6) pressed/selected wide rectangular button same shape with darker green wood inset and brass corner accents, blank center. ROW3: (7) long thin decorative wooden header beam with delicate carved ends and empty central wood; (8) small rectangular wooden tab, blank center; (9) small round wooden close-control base with brass trim, NO X. ROW4: (10) empty round bronze/wood toggle-control base, (11) a compact horizontal notification placard with thin wood border and ivory paper center, (12) a thin wooden slider rail with subtle gold/brass edging, no thumb. Every component is an isolated object with genuine transparent alpha around it, exact 3x4 regular cell grid, no readable text, no numbering, no grid dividers, no background. Consistent craft and palette across all 12 UI pieces. Flat FRONT VIEW for UI, gentle bevel highlights, no 3D perspective tilting, no cast ground shadows.
```

### noonfront

```text
Use case: stylized-concept. Premium semi-realistic painterly Chinese narrative game environment, 16:9 wide. A small contemporary Chinese neighborhood noodle shop, autumn NOON sun, cream walls, old dark teal timber, worn honey brown wooden tables, plain off-white tile floor, intimate lived-in realistic scale. View from dining room to serving window on RIGHT, left a window table and stool with completely EMPTY table surface at x20-40 y65-75%, rear green open door into kitchen at x72%, rear counter EMPTY for composited props x60-90 y55-68%. Bright soft daylight, warm bowls' steam atmosphere without visible bowls. One ceiling fan, simple pendant lamps, apron hooks, small wall menu board EMPTY and illegible. Leave clear standing spaces x43 y85 and x80 y85 for separately composited people. NO PEOPLE, NO bowls, NO chopsticks, NO phone, NO printers, NO books or receipts, NO food on tables. Objects will be independent sprite assets. Refined illustrative realism, restrained color, tangible wood and plaster, no anime, no UI, no logos or legible words, one coherent frame.
```

### noonkitchen

```text
Use case: stylized-concept. 16:9 premium semi-realistic painterly narrative game background. Small Chinese noodle shop kitchen, noon warm window light, cream tiles, desaturated green doorframes, weathered dark wood. Camera slightly elevated eye-level. Large EMPTY wooden kneading counter spanning foreground x10-70%,y60-90%, two built-in noodle cooking pots/stove openings at back right x75%,y50%, stainless backsplash slightly worn, steam light, shelves of unlabelled fixed storage jars, open wooden doorway on right leading to shop dining room. EMPTY surfaces for interactive noodle bowl, seasoning, orders, rolling board sprites, no dishes or papers baked in. NO people, no noodles or food, no phone, no printer, no books, no UI. Natural perspective and light, believable work space, restrained lyrical environmental art, not fantasy, same walnut/cream/moss palette as earlier old Chinese courtyard game.
```

### nooncorner

```text
Use case: stylized-concept. 16:9 premium semi-realistic painterly Chinese narrative game background. A quiet corner by the cashier counter of a neighborhood noodle restaurant, present-day China, autumn noon. Worn dark teal wood and cream lime wall, a small EMPTY honey-brown cashier desk at center foreground x30-75%,y62-85%, empty wall shelf and hook above, high open green window at left with view of a tailoring shop across alley (no readable signs), folded noninteractive plain cotton cloth on back shelf, empty stool at far right background. Flat wooden surfaces left completely empty for independently composited phone stand, receipt printer, notebook and paper notes. Warm calm sunlight from left, fine dust and material texture, same restrained realistic painterly production art. No people, no papers, no phones, no printers, no food on desk, no UI, no readable text or watermark.
```

### noonpeople

```text
Use case: illustration-story. Transparent game CHARACTER SPRITE SHEET, THREE equal side-by-side cells on wide landscape canvas, 1800x1200 preferred. Each full-body person isolated with clear transparent gaps, entirely inside own third, no overlap. Matching refined semi-realistic painterly Chinese slice-of-life game art, warm noon light from upper left. LEFT: Chinese noodle shop owner woman 48, short black hair lightly streaked gray, capable tired face, muted dark jade cotton shirt, oatmeal waist apron, dark trousers, practical shoes, one hand resting at hip, gentle direct gaze. MIDDLE: her nephew 25, ordinary Chinese young man, short slightly messy hair, thin rectangular glasses, faded indigo work shirt with rolled sleeves, dark gray trousers and sneakers, earnest slightly anxious expression, hands free. RIGHT: Chinese woman 55, tailoring worker, short wavy dark hair, quiet observant expression, muted rust-brown cardigan and beige blouse, dark plain trousers, simple flats, cloth measuring tape loosely over one shoulder, holding nothing. All full body head to toes visible, relaxed natural standing poses, real proportions, no fashion glamor, no caricature, no anime. True alpha transparent background, no environment, NO colored haze, NO ground plane or shadow, no text or labels.
```

### noonprops

```text
Use case: stylized-concept. Transparent game prop sprite atlas, exact FOUR columns by TWO rows, equal cells, 1600x800 preferred, generous padding and separation. Warm upper-left light, same refined semi-realistic painterly Chinese everyday-life game style, realistic tangible materials. GRID ORDER: row1 left to right (1) blue-white porcelain bowl full of plain hot noodles, (2) compact group of three little Chinese seasoning jars soy sauce/vinegar/chili, (3) small modern white thermal receipt printer with a short curled receipt, (4) ordinary dark smartphone upright in a wooden tabletop stand. row2 (5) small worn handwritten food menu paper board no legible text, (6) closed faded blue clothbound order notebook, (7) pair wooden chopsticks on a tiny ceramic rest, (8) one folded cream receipt/order slip with red stamp illegible lettering. Each object entirely separate in own equal cell, 3/4 overhead tabletop perspective, true transparent alpha, no background, no ground shadow, no titles, no numbers, no UI or collage borders.
```

### 无葱面碗

```text
Use case: stylized-concept. A single isolated game prop with genuine transparent alpha background: a blue-and-white Chinese porcelain bowl with a modest HALF PORTION of plain pale wheat noodles in light clear broth. Absolutely NO scallions, NO green onion, NO green garnish, NO herbs, NO chili, no extra food. Slight overhead three-quarter angle, entire bowl visible, matching restrained semi-realistic painterly Chinese narrative game props, soft warm upper-left sunlight, delicate ceramic blue floral pattern, natural noodles. Centered with clear transparent padding, no table, no background or cast shadow, no text or UI, no steam hiding the food. One small bowl only.
```

## 验证边界

透明通道、区域登记、资源路径和构建已检查。浏览器连接仍不可用，尚未对SVG滤镜、全屏排布、触屏及不同字号完成视觉实测；不能仅凭这些素材图确认最终游戏画面的质量。
