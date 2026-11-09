# 檐下长桌布局修正

2026-11-09。按用户截图调整长桌视角的人物、店签与桌面道具。原底图、人物与图集均保留。

- 新增 `public/assets/epilogue/grandmother-table-v3.png`（1024×1536，内置 imagegen，独立透明人物）：参考 `grandmother-seated-v2.png` 保留身份、服装、手脚和藤椅，参考 `table-night-v2.png` 的俯视角与左侧暖光，改为桌边侧身坐姿。只在长桌场景引用，院里和次晨继续原资产。生成的脸部与衣褶有细微重绘差异，不代表最终人物定稿。
- 长桌人物为 x81/y84，高50%，完整手脚和椅腿落在右端地面范围。新增轻微人物取景，书页取景降至1.1倍，人物、物件和底图继续共用场景镜头。
- 三张店签排列于书的左侧，x23/27/31、y64.5，纸签用独立 CSS 旋转与压扁表现平放桌面的角度，保留悬停上浮。
- 书移至x42/y70，茶具移至x67/y58；短札移至x57/y66.5；保留的手机移至x65/y69。各项均在桌面，茶具与纸札、手机分开。
- `epilogue-ticket` 图集区域从530像素宽收紧至300像素，只显示车次单，排除原裁切中夹带的第二部手机。未修改原始图集像素。
- 长桌通路按钮改在画面上方横排，避免遮住奶奶头部；窄屏允许换行。其他场景通路排布保持原设置。

## 生成提示词

Use case: identity-preserve. One independent full-body grandmother and wicker chair sprite. Preserve reference grandmother's identity, gray hair bun, olive cardigan, cream collar, brown trousers, beige socks and cloth shoes. Match the table reference's slightly elevated three-quarter camera and warm amber light from upper left. Torso and knees turn toward the table on the left. Complete head, both hands, both feet and chair legs; transparent alpha background; no table, floor, props, text or UI. Crisp painterly realism, small clear margin. New asset, preserve all originals.

## 验证

使用已有 Playwright 与独立无头 Edge（保留 Chromium 沙箱），隔离浏览器上下文，载入经存档校验的正常第五章测试档。检查1440×900、2285×879、390×844；桌面与超宽屏实际点击店签、奶奶，检查取景、弹窗及关闭。页面没有脚本错误，第五章没有“回奶奶家”按钮。截图和记录在 `docs/art/previews/epilogue-table-v3/`。窄屏保留横向观察及底部物件入口，不声称可以在窄屏同时看全长桌。

typecheck、check:content、138项测试与生产构建通过。此次位置和资产调整不改剧情ID、分支、奖励或存档格式。
