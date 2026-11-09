# 第五章《灯下》美术 v1

2026-11-08。使用内置 imagegen，先生成效果图，再制作空底图与透明精灵。均为本轮生成的 Demo 专用资产，非占位。未覆盖此前章节原图。暂未完成真实浏览器视觉验收。

参考：`public/assets/arrival/courtyard-evening-v1.png` 为建筑、色彩与材质参考；`public/assets/arrival/grandmother-v2.png` 为奶奶人物身份参考。保留桂花树、粉墙、旧绿百叶窗、木门、暖木桌和橄榄色开衫。文字由项目字体绘制，不烘焙到图片中。

## 输出和用途

| 文件 | 用途 |
| --- | --- |
| `docs/art/epilogue/concept-v1.png` | 完整视觉效果图，1672×941 |
| `public/assets/epilogue/night-v1.png` | 同构图空夜景，1672×941 |
| `public/assets/epilogue/dawn-v1.png` | 同构图空次晨景，1672×941 |
| `public/assets/epilogue/sprites-v1.png` | RGBA 图集，2172×724；人物连椅、书与尺、茶具、札与信封、车次单与手机、袋子、日历、早餐碗、外套 |

独立精灵区域见 `src/content/epilogue-regions.ts`，保留图集原像素，用区域与 alphaCutoff 去除透明边缘残色。三张店签从纸札区域独立登记，叠放于一本书上，世界物件和菜单分开。台灯复用第四章独立灯资产。所有资产先复制到 public，再由资产表引用。

## 提示词

效果图（illustration-story）：

> Create a production visual concept for chapter five of Chinese narrative game 百味录. Reference 1 is the exact courtyard architecture/style continuity; Reference 2 is grandmother's exact identity and olive cardigan. Wide 16:9 full environment, warm realistic painterly game art matching reference. Show the same osmanthus tree, cream plaster, green shutters and wooden door at deep night. Recompose camera a little wider so a wooden eaves table sits left-middle with open cloth recipe book, ruler, three paper slips, envelope, tea cups and warm table lamp; grandmother seated to right fully visible including hands feet and chair, gate visible at far right with cloth bag on peg. Clear lived-in surfaces, spatial depth, no characters other than grandmother. No UI or text, no readable inscriptions. This is the complete styled composition proof, assets will be separated afterward. Preserve recognizable courtyard architecture and grandmother.

夜景资产（precise-object-edit，引用效果图）：

> Produce clean game background from this concept. Keep architecture, camera, wooden table position and size, lighting, tree, door and stone floor EXACTLY. Remove grandmother WITH entire chair, remove ALL objects on table (lamp vase book papers cups kettle ruler basket), remove hanging bag. Leave empty wooden tabletop, empty floor where chair was, bare peg. Warm light still comes from window and offscreen lamp. No people no objects on table no text. 16:9.

次晨资产（lighting-weather / precise-object-edit，引用效果图）：

> Produce clean next-morning game background from this same concept. Keep EXACT architecture camera wood table location green shutters tree door stone floor. Change light to soft golden morning sun, blue sky, extinguished lamps. Remove grandmother and entire chair, all tabletop objects, hanging bag. Empty table and empty floor chair area for independent sprites. No people no text. 16:9.

透明精灵（background-extraction，引用效果图，transparent_background=true）：

> Production transparent game sprite atlas derived from concept. TRUE TRANSPARENT BACKGROUND. Nine isolated objects arranged precise 3 by 3 uniform grid, each object entirely within own cell with 8% clear padding, no labels, no borders, no floor, no environment. Row1 left: same grandmother identity olive cardigan seated in wicker chair, COMPLETE body hands shoes and chair visible, same pose and perspective as concept. Row1 middle: open old cloth recipe book with blank cream pages and wooden ruler beside it, 3/4 top view. Row1 right: ceramic floral teapot and two cups on saucers as one tea set, 3/4 top view. Row2 left: three blank cream paper slips, brass paper clip and envelope together. Row2 middle: blank train ticket beside dark mobile phone flat on table, no text. Row2 right: hanging cloth insulated bag. Row3 left: hanging cream calendar page with blank squares, no text. Row3 middle: two ceramic breakfast bowls with steaming porridge, spoons. Row3 right: folded blue grey jacket. Match warm realistic painterly materials, correct table perspective, warm light from left, gentle shadows only directly on objects. Transparent alpha edges. No baked text. Objects independent, no overlaps between cells.

生成图集没有严格等分留白，登记使用实际像素区域；并未按等分网格盲切。生成原件仍保留在本机 generated_images 中。

2026-11-08 物件一致性修正：第五章“陈伯的保温袋”改为直接引用第二章的 `prop-bag`（`morning/props-v1.png` 已登记区域），不再使用本章新生成的桂花布袋。旧图集保留，未改借袋条件、物件位置与归还对白。
