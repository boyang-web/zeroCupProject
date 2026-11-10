# 2026-11-10 页面验收截图

由本机独立 Chrome 测试上下文截取，均来自实际页面。桌面 1600 × 900，窄屏 390 × 844；文件像素随 DPR 缩放。测试种子来自正常核心命令，未启用开发者跳转，用户原存档不受影响。

| 范围 | 代表图 |
| --- | --- |
| 人间百味，每面一篇 | [桌面](life-desktop.jpg)、[窄屏](life-mobile.jpg) |
| 木框 125% 缩放 | [旧尺寸复现](dock-before-1.25.png)、[修正后](dock-fixed-1.25.png)；另有 DPR [1](dock-fixed-1.png)、[2](dock-fixed-2.png) |
| 其他木框 | [设置 1.25](frame-settings-1.25.jpg)，另有 DPR 1／2 |
| 线轴与茶实际拖放 | [第一章](first-dragged.jpg) |
| 夜饭三条收束 | [取餐](night-pickup.jpg)、[取消](night-cancelled.jpg)、[未到](night-missed.jpg) |
| 终章分支回看 | [陈家](epilogue-chen.jpg)、[琴记](epilogue-qin.jpg) |
| 可选简历草稿 | [未改](epilogue-phone-before.jpg)、[已保存未发](epilogue-phone-after.jpg) |
| 三个显式结局 | [早餐](ending-breakfast.jpg)、[通话窄屏](ending-call.jpg)、[留书](ending-book.jpg)；另附选择页与次晨页 |
| 音乐／音效／静音 | [设置](audio-settings.jpg) |

旧接缝图仅在隔离页面注入原 CSS 以作对照，没有修改游戏源文件。图片没有拼接或重绘。具体覆盖、结构审计、声音哈希及页面异常见本目录 JSON 报告与[验收说明](../../../engineering/第四五章与声音验收.md)。
