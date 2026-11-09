# 长桌与座位空间重排

2026-11-09。用户指出v3椅腿仍压到桌腿、横排通路与顶部菜单重叠。本次以院里场景左桌右座的空间关系重新制作空底图，而非继续将人物叠在原来的大桌子上。v3及更早资产、截图均保留；本记录取代v3布局结论。

## 底图与摆放

新增 `public/assets/epilogue/table-night-v4.png`，内置imagegen参考原长桌底图和院里底图生成，1672×941，无人物、椅子或桌面道具。保留桂花、绿窗、门口与暖光；桌子及桌腿止于画面左侧65%以内，右侧留下连续的石板地面作为原座位的近景区域。原底图未覆盖。

提示词要点：same courtyard identity and night lighting; elevated closer view preserving left table / right sitting area from yard reference; table corners near (8,54),(52,48),(64,72),(13,80), all table legs and braces end by65%; right band67–94% is clear wall and cobbled floor for independent seated grandmother; empty background, no people, chair, book, tea, phone or UI.

长桌奶奶继续使用独立侧坐精灵，x74/y84，宽15%高46%的容器按图片比例适配。完整椅子左界66.5%，与桌子右界之间留有空地，椅脚落在石板上。书页与人物取景都只轻微放大1.04倍，共用底图坐标，避免聚焦后再次推到桌腿上。

书移至x38/y70，茶具x52/y59，短札x53/y66.5，手机x60.5/y68，店签x18/22/26、y64.5，均按新桌面轮廓重新布置。车次单继续使用排除多余手机的裁切。原剧情、交互ID、奖励和存档格式不变。

## 通路与验收

右侧通路恢复中部竖排，宽160px，长按钮文字允许换行。窄屏宽148px，保持竖排，不再挤入顶部百味录和菜单区域。

独立无头Edge使用隔离存档验证1280×800、1440×900、2285×879、390×844。桌面实际点击店签与奶奶、关闭弹窗，分别检查标准和聚焦取景。浏览器检查额外断言：通路不与顶部菜单重叠，桌面人物边界位于完整桌子轮廓外，通路不遮人物。截图和报告保存在 `docs/art/previews/epilogue-table-v4/`，旧版本证据不覆盖。

内容检查和生产构建（含类型检查）通过。窄屏仍采用横向观察和物件快捷入口，不要求同屏看全长桌。本轮未创建提交。
