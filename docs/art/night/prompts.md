# 第四章生成提示词

## 补充资产

Use case illustration-story. Transparent game sprite sheet exactly TWO separate objects equal left and right cells, large transparent gutter. Warm painterly realistic old Chinese night rice shop, amber light. LEFT: empty shallow cream ceramic bowl with small blue floral rim, viewed 3/4 from above, no food or utensils. RIGHT: folded beige cotton wiping cloth with faded brown narrow stripes, lying flat viewed slightly above. No background, no table, no ground shadows, no writing. True transparent RGBA background. Match the supplied concept palette and realism.

Use case illustration-story. Transparent RGBA production game character, same 罗姐 (middle woman) in reference people-v1.png, preserve exact identity face haircut mauve work jacket checked cuffs dark trousers black shoes, warm painterly realistic amber lighting. Change pose only: seated on an ordinary backless brown wood stool, three quarter facing LEFT, naturally leaning toward a dining table that is NOT drawn, elbows bent hands near waist holding chopsticks in right hand. Canvas shoulder bag tucked beside stool. Entire full body shoes and stool visible, natural anatomy, broad transparent padding. NO table, NO bowl, no scenery, no text, no cast shadow outside figure. Same scale and art style.

## 资产登记与使用

柜边修正：新增 `public/assets/night/flat-note-v1.png`（内置 imagegen，透明背景，`placeholder: false`），专用于平放的“今晚的新条”，不再复用立式纸夹。通过 `scripts/register-night.py` 读取 alpha 边界登记为 `night-flat-note`，目前共 15 个独立精灵。原有图集保留。

### 平放新条的提示词

Use case: illustration-story. One production transparent RGBA game sprite, a small single cream paper note LYING FLAT on a horizontal counter, seen from slightly above and from front at shallow angle. Use supplied object atlas only as painterly realism, warm amber upper-left illumination, yellowed paper material reference. A loose rectangular small handwritten receipt slip with fine faint ink strokes too small to read, subtle middle fold, no clipboard, no clip, NO BOARD, no rigid backing, no envelope, no standing upright. Low perspective quadrilateral, long left-to-right, approximately 3.5:1 visible width-to-height. Small curled corner only, mostly flat. Isolated centered with wide transparent padding, no counter or background or hands, no cast shadow outside the note silhouette, no labels, no legible text. Match Chinese warm wood narrative game 百味录 night shop art style. Transparent background.

- `concept-v1.png`：三场景整体效果图，仅用于构图和风格参考；不作为运行时背景。
- `public/assets/night/front-v1.png`：店门与小方桌空场景。
- `public/assets/night/kitchen-v1.png`：灶边空场景；水池、分装柜、灶台按用途分开。
- `public/assets/night/counter-v1.png`：交接柜空场景。
- `people-v1.png`：许叔、罗姐、小梁三个透明人物区域。
- `props-v1.png`：堂食饭、空饭盒、手机、纸夹、门灯开／关、旧牌、带保温套饭盒。
- `extras-v1.png`：空碗与抹布；第一次请求网络失败，重试后使用本版。
- `luo-seated-v1.png`：分装后罗姐吃饭的坐姿，连同凳与包；离店后整个人物隐藏。

以上素材由内置 imagegen 生成，均为本轮专用素材，`placeholder: false`；这表示已替代占位素材，不代表用户已作最终美术验收。保温套饭盒用于食谱／记录插图；交接前使用空盒，交接后移除，避免把准备分装误画成已经交餐。

`scripts/register-night.py` 只读取 alpha 边界并登记 14 个独立区域，不修改原 PNG；运行时沿用 AssetImage 的区域裁切与 alpha 阈值，世界物件不借用菜单控件。底图与透明精灵分离，菜单、字体和桂花花饰原样复用。

效果图中的台面高度只是构图参考，接入坐标按最终空场景的实际台面调整：灶边约 57%，柜边约 53%。当前镜头仍为项目既有的平移缩放，不称为完整透视景深。

来源：内置 imagegen；2026-11-07。参考：同目录 concept-v1.png。人物与物件使用 transparent_background=true，场景为 false。原图复制到 public/assets/night 后引用；不覆盖原章节素材。

## nightFront

Use case: illustration-story. Single production 16:9 game background for 百味录 chapter 4, no panels. Attached image is strict visual reference only: painterly realistic Chinese old neighborhood small night rice shop, worn green Chinese timber, honey wood, cream plaster, warm tungsten interior versus indigo midnight alley. Natural domestic scale, good perspective depth, match architecture across scenes. NO PEOPLE, NO TEXT, NO UI, no Japanese or fantasy elements. All interactive objects will be separate sprites, do not bake them into background. Dining room entrance, inspired by TOP concept panel. Left small square dining table x23% y66%, stools below, right of table clear for woman standing x38% y89%. Middle half-lowered metal roll shutter above open green door, cool alley recedes into distance; opening still tall enough to walk through bent. Right serving counter surface x78% y65%, kitchen opening beyond, floor at x79% y94% clear for owner. Leave dining tabletop empty. No bowls, no lamp, no paper, no bags, no menus. Fixed crockery and rice pot on BACK shelves allowed. Wide comfortable playable view.

## nightKitchen

Use case: illustration-story. Single production 16:9 game background for 百味录 chapter 4, no panels. Attached image is strict visual reference only: painterly realistic Chinese old neighborhood small night rice shop, worn green Chinese timber, honey wood, cream plaster, warm tungsten interior versus indigo midnight alley. Natural domestic scale, good perspective depth, match architecture across scenes. NO PEOPLE, NO TEXT, NO UI, no Japanese or fantasy elements. All interactive objects will be separate sprites, do not bake them into background. Back kitchen inspired by MIDDLE concept panel. Left sink x15% under green frame window. Center SHORT wood prep cabinet x39%-68% with clear surface y69%, shelves with bowls behind. Right ceramic tiled gas stove x85%, large lidded metal rice pot and simmering tofu pan, no wood fire. Clear dry wall shelf at x47% y39% for separate mobile phone sprite. Standing area at x73% y93% for owner. No people, no loose bowl, no lunchbox, no phone, no notes, no sauce cup on prep cabinet. Modest clean working kitchen, not enormous empty table.

## nightCounter

Use case: illustration-story. Single production 16:9 game background for 百味录 chapter 4, no panels. Attached image is strict visual reference only: painterly realistic Chinese old neighborhood small night rice shop, worn green Chinese timber, honey wood, cream plaster, warm tungsten interior versus indigo midnight alley. Natural domestic scale, good perspective depth, match architecture across scenes. NO PEOPLE, NO TEXT, NO UI, no Japanese or fantasy elements. All interactive objects will be separate sprites, do not bake them into background. Counter handoff corner inspired by BOTTOM concept panel. Left green door x20% opens into cool blue lane, small fixed ledge left of doorway x12% y67% clear for separate portable lamp. Narrow cream plaster pillar x39% has clear wall area y36% for separate clipboard and sign. Shelves of ceramic bowls in rear. Right old timber serving counter x53%-95%, usable clear surface at y70%, front extends down to floor. Clear floor x46% y92% for owner and x85% y95% for customer. No objects on counter surface; no lamp, no clipboard, no sign, no mobile phone, no box, no people. Overhead fixed tungsten light.

## nightPeople

Use case: illustration-story. Transparent RGBA production character sheet matching attached reference concept for Chinese game 百味录. Exactly THREE separate FULL BODY figures in equally spaced ONE ROW with large transparent gutters, feet visible, NO overlaps, no furniture, no ground or outside shadows, no labels. Painterly realistic human anatomy, amber light from upper left. LEFT owner 许叔 age58 Chinese man short salt pepper hair beige rolled sleeve shirt, long dark olive work apron dark trousers black cloth shoes, standing relaxed 3/4 facing left hands at waist; match reference owner. MIDDLE 罗姐 Chinese woman50 short tied dark hair faded mauve work jacket checked cuffs dark trousers black shoes, canvas shoulder bag, standing 3/4 facing right hand on strap; no cleaning tools. RIGHT 小梁 Chinese man26 short black hair muted blue gray work jacket trousers gray work gloves sturdy shoes, standing 3/4 facing left hands forward empty to receive meal. Modern contemporary ordinary Chinese neighborhood residents. Three isolated silhouettes on truly transparent background.

## nightProps

Use case: illustration-story. Transparent RGBA production object atlas for attached Chinese warm timber night rice shop concept, painterly realistic warm amber upper left light. Exactly EIGHT objects in rigid FOUR columns TWO rows, each object centered within one equal cell, large completely transparent gutters, no overlap, no labels, no background or ground shadow. Row1 left-to-right: 1 shallow cream ceramic bowl with rice and braised tofu, dab chili on rim and pair chopsticks resting beside on small ceramic holder; 2 EMPTY open aluminum rectangular lunchbox hinged lid behind, latches wrapped beige coarse cloth, no food; 3 black modern smartphone lying flat in slight 3/4 perspective dim blank screen; 4 small wooden clipboard brass clip and folded blank cream paper. Row2 left-to-right: 5 small brass portable lamp with handle glass glowing contained amber light, no external glow; 6 exact same lamp OFF dark glass; 7 small worn green wooden rectangular freestanding sign blank with chipped edges; 8 closed aluminum lunchbox inside brown cloth insulating sleeve with chopsticks outside on lid and small sealed sauce cup beside. View objects from slightly above as they rest on surface, lamp eye-level. No table, no hands, no text. True transparent background.
