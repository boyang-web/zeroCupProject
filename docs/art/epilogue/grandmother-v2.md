# 第五章奶奶清晰度修复

2026-11-08。用户截图反馈第五章奶奶明显模糊。旧图集人物登记区域为 202×322，alpha > 160 的实际主体约 194×315；放大用于场景全身人物时细节不足。

使用内置 imagegen，参考旧图集的坐姿、椅子与暖色光照，以及 `public/assets/arrival/grandmother-v2.png` 的脸部身份与细节，制作独立人物图。新图 `public/assets/epilogue/grandmother-seated-v2.png` 为 1024×1536 RGBA，有效主体约 975×1520；保留完整坐姿、手脚、藤椅、橄榄色开衫和棕裤。新文件独立保存，原图集保留。仅替换 epilogue-grandma 资产引用与区域，不改剧情状态和场景布局。生成模型重绘会有细微纹理差异。

已检查图片分辨率、alpha 通道及人物边界；外围抽样 alpha 为 0。资产登记用实际主体区域与较低 alpha 阈值保留发丝。未声称已完成真实浏览器视觉验收。

提示词：

> Use case: identity-preserve / background-extraction. Asset: ONE full resolution transparent seated character sprite for Chinese narrative game 百味录. Reference 1 is exact pose, clothing, wicker chair and warm lighting to preserve (only the grandmother at top left of atlas, ignore all other items). Reference 2 supplies sharp facial identity and detailed skin/hair/material reference. Recreate exactly the same elderly Chinese grandmother seated in the same complete wicker armchair, hands folded on lap, olive knitted cardigan over cream collar, brown trousers, beige socks and brown cloth shoes. Exact same gentle smile and head turned slightly toward viewer's right. Same three-quarter perspective, full body head to toes and entire chair legs, same proportions, warm amber key light from upper left. Deliver as a SINGLE large character filling 90% of a portrait 2:3 image, at least 1536x2304 if possible, NOT a sprite sheet. Genuine transparent background with clean alpha. Increase actual facial, hair, knit, hands and wicker detail for large on-screen display, crisp natural painterly realism matching references. No blur, no artificial halos, no environment, no new props, no floor rectangle, no text. Preserve identity, costume, pose and silhouette; do not crop head or shoes or chair.

工具设置 transparent_background=true，实际输出 1024×1536。
