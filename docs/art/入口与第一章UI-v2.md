# 入口与第一章 UI v2：桂影旧木

2026-11-06。使用内置 imagegen 先生成视觉样稿，再生成控件与场景素材，最后接入正式 Vue 工程。以下都是本轮新文件，原 UI、底图和原始生成文件保留。

## 风格与素材

以安静的胡桃木、浅米色纸张、灰绿织物、哑光黄铜和小朵桂花组成视觉。阅读区留白，木框只承担边界与层级，花枝不印在会拉长的轨道和按钮中。

| 文件 | 用途 | 状态 |
| --- | --- | --- |
| [style-board-v2.png](../../public/assets/ui/v2/style-board-v2.png) | 对话、菜单、书页、按钮与装饰的整体视觉样稿 | 参考样稿，不作为运行控件截图 |
| [frames-v2.png](../../public/assets/ui/v2/frames-v2.png) | 对话框、竖向菜单、纸卡、木牌、提示框、书册外框六种表面 | 已登记并接入，待浏览器验收 |
| [details-v2.png](../../public/assets/ui/v2/details-v2.png) | 常态、悬停、选中按钮；铜质控制底座；独立桂花、木角、分隔线、书签 | 已登记并接入，待浏览器验收 |
| [homecoming-v1.png](../../public/assets/title/homecoming-v1.png) | 首页专用背景，左侧木门留出书名和菜单位置 | 已接入 |
| [osmanthus-rice-v1.png](../../public/assets/arrival/osmanthus-rice-v1.png) | 第一份家庭食谱的手绘插画 | 已接入 |
| [courtyard-evening-v1.png](../../public/assets/arrival/courtyard-evening-v1.png) | 保持原小院构图的傍晚回访版本 | 已接入 |

原始生成文件保存在本机 `C:/Users/dell/.codex/generated_images/01a1aefa-0566-7781-9472-956e57c31b83/`。运行时引用的是上表中已复制到 `public/` 的文件。

## 框体与花饰为何不再变形

`scripts/register-ui.py` 只读取透明边界并登记区域，不裁改原图。六种框体各有自己的图，不再把同一带花边框用于所有尺寸。

`presentation/frame-layout.ts` 为各类框指定源角与显示角的像素尺寸。四个源角都是正方形，显示角也保持正方形；横竖直边和空白纸面可以延展，角部的几何纹样保持相同比例。

`UiOrnament` 独立显示桂花、分隔线和书签，使用 `object-fit: contain` / SVG `meet` 保持比例。装饰的位置和尺寸独立于面板宽高。`UiButton` 使用专门的按钮常态、悬停与选中素材，圆形铜底也保持正圆。

旧的 `wood-v1.png` 保留在原处，已经从活动 UI 资产登记中移除；世界物件的精灵登记不受影响。

## 字体

使用[霞鹜文楷官方仓库](https://github.com/lxgw/LxgwWenKai)的 Regular 字体，保留 SIL OFL 许可证。派生子集内部名称改为 BaiweiHand 和 BaiweiTitle。

- `public/assets/fonts/BaiweiHand.woff`：当前文案与界面字形，约 275 KB。
- `public/assets/fonts/BaiweiTitle.woff`：首页书名和街名字形，约 4 KB，首页优先加载。
- [字体来源与重建说明](../../public/assets/fonts/README.md)。添加新字后可用 `scripts/subset-fonts.py` 重新生成。

字体随项目加载，不依赖外部字体请求。书名、对白、控件与书页按字号、字距和颜色区分层级。

## 动画

首页背景先亮起，街名、三个书名字形、分隔线、菜单与独立桂花依次浮现。主要菜单在短时间内即可出现，首页没有剧情长文。

《百味录》有封面打开、书身落定、纸层翻页、逐字落墨与插画遮罩渐显。物件翻转、展开和点亮各自有独立表现。减少动画会保留最终状态与操作反馈，去掉渐入和位移动画。

## 生成提示词

以下为内置 imagegen 使用的完整提示词。透明资产请求的 `transparent_background` 为 true；首页、视觉样稿和小院为 false。参考图只用于风格或明确说明的光照编辑。

### 视觉样稿

```text
Use case: ui-mockup. Create one polished, production-minded visual style board for a Chinese contemporary neighborhood narrative game named 百味录. This is a UI art direction proof, not a website marketing layout. Landscape sheet, generously spaced on warm ivory paper. A coherent elegant set of UI components: (1) a very wide low dialogue frame with thin warm dark walnut border and light unprinted rice-paper center, Chinese speaker title 奶奶 and a short sample 先坐下，茶还是温的。; (2) a medium upright settings/inventory panel with restrained timber joinery; (3) an open two-page journal spread, comfortable ivory paper, fine central fold, title 百味录; (4) horizontal narrow navigation wooden sign; (5) tactile small buttons in normal, hovered, selected jade-inlay and disabled states with sample labels 继续故事 / 新的归途 / 收好书页; (6) small round brass close control, square checkboxes, a horizontal slider, a bookmark tab, a small toast card; (7) a separate small osmanthus flower sprig, corner ornament, thin separator and small vermilion seal, shown as separate loose ornaments. Crucially flowers belong to separate fixed-size corner decorations and are NOT embedded across any stretchable frame edge or button surface. Rectangular frames have clean straight repeatable rails and fixed-size delicate joinery corners. Style is calm intimate contemporary Chinese slice-of-life, tasteful wood craftsmanship, honey walnut, faded celadon, pale linen, matte brass, tiny golden osmanthus blossoms. Soft realistic hand-painted game UI textures with crisp functional edges, excellent typography and readable ink. Restrained, premium, warm, no giant ornate gold carvings, no imperial palace look, no fantasy RPG interface, no neon, no illegible fake paragraphs, no oversized flowers, no excessive shadows. Header: 百味录, small subtitle 桂影·旧木. Balance elegance, quiet space, tangible materials and everyday human warmth. This entire board should establish one practical visual family with visibly distinct component silhouettes appropriate for their roles.
```

### 首页

参考图：视觉样稿。

```text
Use case: illustration-story. Generate a brand new landscape 16:9 title-screen BACKGROUND illustration for the Chinese game 百味录. The input image is a STYLE reference only: match its refined warm wood, ivory paper, osmanthus and contemporary Chinese neighborhood mood; do NOT reproduce its UI board. View from just inside a familiar old wooden doorway toward a sunlit small neighborhood courtyard and a narrow lived-in lane. Foreground RIGHT: beautiful worn walnut dining table, a closed old cloth-bound sage-green notebook with no writing, one celadon teacup, warm soft highlights, osmanthus branch entering from upper right. Midground RIGHT: open wooden lattice door, weathered cream plaster, a quiet residential lane receding in depth, potted plants, subtle ordinary contemporary utility details. LEFT 42 percent is a calm darker timber wall and shaded doorway with very little detail, reserved for separate readable HTML title and menu; no objects or text competing there. Painterly naturalistic game background, exquisite subtle brush texture, real perspective and tangible materials, luminous early-autumn morning, honey light and moss green, atmospheric depth, intimate believable place to return to. No people, no text, no letters, no typography, no logo, no UI, no menu, no watermark. Not a temple, not a fantasy village, not a tourist commercial street. Avoid concrete-dominated buildings, large red lanterns and ornate gold details. Frame is filled edge-to-edge with the scene, intended for fullscreen web game background.
```

### 六种框体

参考图：视觉样稿。初次输出后又作一次透明背景清理，选用后一次输出。

```text
Use case: stylized-concept. Production game UI asset atlas, genuine transparent background. Use reference image ONLY for matching the warm walnut / ivory rice paper / celadon restrained craft style. EXACTLY SIX separate blank panel frames in a strict 3 columns by 2 rows equal-cell grid, generous transparent gaps, all objects fully contained in their own cells. No text, labels, icons, flowers, leaves, tassels, hanging chains or ornaments on these frames. Every frame has simple straight repeatable rails and SMALL FIXED square corners suitable for nine-slice rendering. Top row left: wide low walnut dialogue frame with a pale ivory blank paper center and tiny geometric lattice joint corners. Top row middle: upright rectangular walnut settings/menu frame, neat joinery, blank pale paper center. Top row right: light paper reading-card frame with a very thin chestnut rule and squared clipped corners. Bottom row left: long horizontal dark walnut navigation plaque with a plain blank wood center, subtle brass end joints. Bottom row middle: small wide toast panel, light paper center, slim honey wood rim and simple corner joinery. Bottom row right: rectangular journal outer cover frame in warm brown leather and fine wood edge, blank pale paper interior, no spine, no crease, no decorations. Photorealistically hand-painted material detail, flat orthographic front view, exact rectangular geometry, crisp alpha edges, subtle short contact shadow only. No embedded floral pattern anywhere. No perspective distortion, no large cast shadows. These are six distinct reusable panel surfaces, not a UI screenshot. Transparent pixels outside each surface.
```

```text
Use case: background-extraction. Clean this exact six-frame game UI asset atlas for production. Preserve all six frames, their shapes, positions, colors, paper centers and material details. Remove ALL diffuse brown/black gradient background and all broad fuzzy shadows between and around the six assets. The entire space outside the hard silhouettes of the panels must have zero alpha / perfectly transparent pixels. Each panel itself must be fully opaque including its cream paper or wooden center. Preserve crisp antialiased edges, only tiny close contact shadow, no color glow, no fog. No text, no extra objects, no rearrangement. This is a precise transparency cleanup of the existing six UI surfaces.
```

### 按钮与独立装饰

参考图：视觉样稿。

```text
Use case: stylized-concept. Production UI details asset atlas on a truly transparent background matching the reference style of calm Chinese narrative game 百味录. EXACTLY EIGHT isolated assets in a strict 4 columns by 2 rows equal-cell grid, all entirely inside each cell with clear transparent gutters. Top row, in order: 1. a long slim blank ivory paper button with thin walnut border and tiny geometric clipped corners; 2. the same button in warm light gold hover state; 3. the same button in muted celadon green selected state with thin matte brass edge; 4. a small round matte-brass control base with a blank center, no X. Bottom row, in order: 5. one elegant detached osmanthus sprig with green leaves and tiny pale golden flowers, delicate hand-painted naturalism; 6. a small clean L-shaped wooden Chinese lattice corner ornament with no flowers; 7. a fine horizontal decorative divider with a single tiny four-petal geometric motif at center, no long tendrils; 8. a narrow vertical sage-green cloth bookmark tab with tiny brass loop and dovetail bottom. Absolutely no lettering, no numbers, no text, no interface layout, no dark background, no watermarks. Flat orthographic view for hardware and buttons. Flowers and lattice are separate assets, not printed on button skins. Crisp clean transparency and rich subtle material detail. Match quiet honey walnut, ivory, faded sage, matte brass of the visual reference.
```

### 食谱插画

参考图：视觉样稿。

```text
Use case: illustration-story. One isolated food illustration for a handwritten Chinese family recipe book, on genuine transparent background. A small old celadon porcelain bowl containing warm sweet fermented rice soup (桂花米酒): pale cloudy liquid, a few visible white rice grains, tiny golden osmanthus blossoms floating on top, subtle thin steam, a little porcelain spoon beside the bowl. Three-quarter view from slightly above. Delicate naturalistic watercolor and colored-pencil game illustration, warm ivory, pale sage ceramic and honey gold, matching the quiet handmade wood-and-paper UI reference. Centered single bowl, no table, no placemat, no text, no people, no interface, no frame, no scattered ingredients, clean cutout with minimal shadow. Meant to look painted into an old recipe notebook.
```

### 夜间小院

编辑目标：原 `arrival/courtyard-clean-v2.png`。

```text
Use case: lighting-weather. Change only the time of day of this exact courtyard game background to early evening after sunset. Preserve the entire composition and precise positions and sizes of the empty foreground wooden dining table, empty wicker chair, window, open door, plants and osmanthus tree. No people or additional interactive objects. Warm amber light softly glows from inside the wooden doorway and window; cool muted blue evening in the narrow lane outside; delicate highlights on the wood, quiet lived-in atmosphere. Keep all furniture shapes, camera perspective and empty tabletop intact so independent game sprites align. Full landscape frame, no writing, no UI, no extra tea cup or books. Naturalistic painterly warmth matching an intimate Chinese neighborhood story.
```
