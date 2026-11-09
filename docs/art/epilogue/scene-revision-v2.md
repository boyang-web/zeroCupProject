# 第五章取景与时间推进修正

2026-11-08。按用户反馈，将三处使用同一全景的问题改为：夜院归来全景、独立桌边近景、反向朝院门的次晨视角。使用内置 imagegen，以现有 dawn-v1 为建筑、材质与色彩参考；新场景均为空底图，独立人物、书、茶具及其他物件继续通过资产表装配。原图保留。

- `public/assets/epilogue/table-night-v2.png`：1672×941，檐下长桌近景；重新布置书、店签、短札、车次单、台灯和高清奶奶。
- `public/assets/epilogue/gate-dawn-v2.png`：1672×941，从院内朝门外；早餐在左侧檐下，通话或外套作为出门前的交互，三项有各自时段与描述。
- `epilogue-night` 继续用于归来打招呼，保温袋继续引用第二章 `prop-bag`。

当晚两处可往返，听完最终回应后不再返回院里。去次晨的通路改称“收好纸笔，歇到天亮”，不是夜间走到另一房间。次晨没有回昨夜的通路；收尾阶段暂停回访，正式结局完成后重新开放。百味录仍可查看，不通过重开昨夜对白来回看。保留章节、场景、选择和奖励 ID，不改三结局判定；现有 v6 档仍可读取，旧档若停在收好纸笔后的夜院，也可由新通路继续次晨。

自动测试新增时间单向性、三个场景资产区分、回访关闭与重开、次晨读档保持，全部 105 项通过；check:content 与 build（含类型检查）通过，并更新 dist。生成底图已目视检查，真实浏览器验证另记，不用构建替代视觉验收。

## 桌边提示词

> Use case: precise-object-edit / illustration-story. Chinese narrative game 百味录. Reference image is exact courtyard architecture, materials and lighting continuity. Produce NEW CAMERA COMPOSITION of the eaves writing table at deep night, NOT the same wide courtyard view. Wide 16:9. Camera moved close to table, slightly elevated three-quarter view. Large aged wooden tabletop occupies lower half from x10% to85%, surface spanning y48% to88%, table legs visible below. Green shutter window and cream plaster behind, osmanthus foliage upper left, warm amber lamplight offscreen left, doorway a narrow glimpse at far right. Leave clear floor at far right for an independent seated grandma sprite. Empty tabletop, no book no lamp no tea no paper no people no chair no bag, all objects will be independent game assets. Lived-in realistic painterly style, detailed woodgrain, preserve house identity. No text no UI no baked character. Clearly a closer camera than reference.

## 院门提示词

> Use case: illustration-story / precise-object-edit. Chinese narrative game 百味录. Create a NEW CAMERA looking from INSIDE the osmanthus courtyard toward its OPEN WOODEN GATE and Changming lane at early morning. Reference establishes exact green weathered paint, cream plaster, old Chinese wooden architecture, osmanthus and warm painterly realism. This is the SAME courtyard seen in REVERSE from the eaves, not the old front-facing window/table view. Wide 16:9. Open double wooden courtyard gate fills center-right x48%-85%, threshold y80%, beyond are stone lane and soft morning sun. At left under eaves a modest wooden side table with visible empty surface x12%-43% y66%-74%, room for book or breakfast bowl sprites; plain limewashed wall and greenery behind. Golden morning sunlight through osmanthus, layered spatial depth, practical lived-in old neighborhood. Empty scene: no people, no chair, no food, no tea, no paper, no bag, no jacket, no readable text, no UI. All interactive objects added separately. A distinct departure composition centered on the gate, not the window.
