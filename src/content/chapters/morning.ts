import type { Chapter, Dialogue, Hotspot, MinigameDefinition, Condition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { chenScripts, ningScripts, chenKneeSeated, ningAfterTrial, ningAfterTable, ningAfterDefer, ningLaterFollowup, chenWaitingForBreakfast } from '../scripts/morning.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const any = (...conditions: Condition[]): Condition => ({ kind: 'any', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const laterJourney: Condition = any(...(['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest' as const, id: 'noon', status })));
const atMeal = all(flag('chen-at-table'), not(flag('morning-defer')), not(flag('morning-meal-cleared')), not(laterJourney));
const atCounter = not(atMeal);
const holdingBag: Condition = { kind: 'item', id: 'insulated-bag' };
const sprite = (asset: string, width: number, height: number, z = 8) => ({ asset, width, height, z });
const inspect = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId?: string, cameraView?: string): Hotspot => ({
  id, label, x, y, cameraView, icon: 'look', sprite: sprite(asset, width, height), completed: clueId ? clue(clueId) : undefined,
  interaction: { kind: 'inspect', text, action: clueId ? { id: id === 'morning-note' ? 'morning-read' : 'read-' + id, label: '记下来', effects: [{ kind: 'clue', id: clueId }] } : undefined },
});
const front: Hotspot[] = [
  {"id":"front-trial-plan","label":"试样的三个格子","x":87.5,"y":43.5,"cameraView":"cashier","icon":"look","sprite":{"asset":"morning-prep","width":5.5,"height":11.5,"z":8},"interaction":{"kind":"inspect","text":"纸上新画了三个空格，第一天、第二天、第三天，旁边还留着写塌没塌、咸淡和好不好包的地方。开门时间没有改，七点那行仍带着问号。\n\n陈伯把笔拿到手里比了比，说自己验过自己记，别回头全凭嘴说。","exhibit":{"kind":"note","kicker":"陈伯添了三个小格","title":"先试三天","lines":["□ 第一天：第二笼试样，第一笼照旧。","□ 第二天：陈伯自己验面、试包。","□ 第三天：再商量是否晚开门。","后天六点半送样；晚了先不等。"]}},"condition":{"kind":"flag","id":"morning-plan"}},
  { id: 'morning-person', label: '陈伯', x: 49.5, y: 86, cameraView: 'counter', icon: 'talk', sprite: sprite('chen', 17.5, 57, 7), condition: atCounter,
    variants: [{ condition: flag('chen-has-seat'), asset: 'chen-seated', x: 49, y: 87.5, width: 20.5, height: 44.5, cameraView: 'rest' }],
    interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'morning-customer', label: '周叔留的纸条', x: 69.9, y: 56.1, cameraView: 'customer-slip', icon: 'letter', sprite: sprite('morning-sample-sheet', 6.3, 2.5),
    interaction: {"kind":"inspect","text":"纸条上写着老周，青菜两只，七点半。陈伯在分两袋下面画了线，顺便把里头那只的袋口压平。\n\n你问为什么分开，他说老周自己路上先吃，给老伴的留到家，不能叠着压扁。褶子收得齐的那只放里边，拿的时候也好分。\n\n“菜的还没出，你先认这张。”他把纸夹回去，又伸手去接钱。","action":{"id":"read-customer-order","label":"看看留单","effects":[{"kind":"clue","id":"breakfast-order"}]},"versions":[{"condition":{"kind":"flag","id":"morning-zhou-collected"},"text":"老周那两袋已经拿走了，留单上添了一个小勾。你想把纸收进账本，陈伯叫留在这里，明早还照这个数。"},{"condition":{"kind":"flag","id":"morning-played"},"text":"新出的一笼已经分好，老周两只青菜包各装一袋，跟后院的三个碗分开。阿宁来拿时又对了一遍纸条，才将袋口折好。"}]}, completed: clue('breakfast-order') },
  inspect('front-steamer', '已经卖空的一笼', 'morning-empty-steamer', 79.7, 56.8, 12, 6.5, "你掀开笼盖，里面只剩湿布，包子底留下的圈还看得出来。有一处压得深些，你沿着一圈圈数到十一，想再数一遍，陈伯在旁边说十二只，不用替他盘这个账。\n\n最后一只的印子折进布角里，陈伯提起来给你看，接着把布抖开。你正想伸手托住笼底，他叫你先别摸，说刚空下来的东西，看着没冒气，碰一下也知道热不热。\n\n他将空笼让到能透气的位置，给下一笼腾地方。前头有人问还有没有，你回头想指这只，才反应过来，空出来的只是这一层，后头还有一锅在忙。", undefined, 'empty-basket'),
  { ...inspect('front-buns', '给早班留的包子', 'morning-reserved', 65, 59.6, 7.5, 7.2, "两只青菜包刚装好，各在一只纸袋里。阿宁折袋口时还认了认褶子，把好看些的留在里侧。\n\n陈伯叫你别拿错，老周那份要带走，后院才是你的。他说完伸手又对一遍，怕自己忙着忙着把两袋合成一袋。", undefined, 'pickup'), condition: {"kind":"all","conditions":[{"kind":"flag","id":"morning-played"},{"kind":"not","condition":{"kind":"flag","id":"morning-zhou-collected"}}]} },
  { id: 'front-stool', label: '小凳子', x: 35, y: 80.5, cameraView: 'waiting-seat', icon: 'look', sprite: sprite('prop-stool', 7, 11, 2), condition: all(atCounter, not(flag('chen-has-seat'))), completed: flag('chen-has-seat'),
    interaction: {"kind":"inspect","text":"凳面横在长凳底下，你蹲下转了个方向才提出。陈伯先问你拿它做什么，见你往柜边挪，又赶紧叫别挡着门。\n\n“钱匣子旁边？”你指了指，他伸手试了试纸袋的位置，说再往里一点。凳子还稳，坐着也够得着零钱。","options":[{"id":"move-stool","label":"把凳子挪到柜台外侧","feedback":"陈伯坐下试了两秒，伸手摸到纸袋，才点头说还行。你往后院看，他立刻叫你别喊阿宁，等会儿忙过了自己会坐。","effects":[{"kind":"flag","id":"chen-has-seat"},{"kind":"metric","id":"listening","amount":1}]}]} },
];
const kitchen: Hotspot[] = [
  {"id":"chen-kitchen","label":"陈伯 · 学下一笼","x":59.5,"y":94,"cameraView":"teaching","icon":"look","sprite":{"asset":"chen","width":18.5,"height":58,"z":7},"interaction":{"kind":"dialogue","dialogueId":"morning-talk","entry":"before-food"},"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-listened"},{"kind":"not","condition":{"kind":"flag","id":"morning-played"}}]}},
  { id: 'morning-object', label: '笼屉', x: 73.5, y: 54.1, cameraView: 'stove', icon: 'tea', sprite: sprite('morning-closed-steamer', 11, 13.5),
    variants: [{ condition: flag('morning-played'), asset: 'morning-empty-steamer', height: 8 }],
    interaction: { kind: 'minigame', gameId: 'morning-game' }, completed: flag('morning-played') },
  { id: 'morning-note', label: '阿宁改过的备料表', x: 35.5, y: 42.7, cameraView: 'plan', icon: 'look', sprite: sprite('morning-prep', 6.5, 15.8), completed: clue('schedule'),
    interaction: {"kind":"inspect","manipulation":"flip","text":"表头原来写着七点开门，旁边后来添了一个问号。再往下才是新改的安排：后天六点半先送一盆样面，第一笼照旧，拿第二笼试；好不好用，陈伯自己验。\n\n三天的试样做完，再谈要不要晚开。背面记了面粉和发面的情况、送面人的电话，底下还有一行别一开口就吵，写完又划掉。\n\n阿宁的字越到后面越挤。你把表翻回来，陈伯说先别拿那个七点问他，后头那几行他还没看全。","exhibit":{"kind":"note","kicker":"阿宁改过几回的备料表","title":"先试样，开门另议","lines":["后天六点半，先送一盆样面。","第一笼照旧，拿第二笼试。","先试三天，先验再收。","七点开门？等样面试过再说。","背面：面粉、发面情况与送面电话。"]},"action":{"id":"morning-read","label":"记下这个安排","effects":[{"kind":"clue","id":"schedule"}]},"versions":[]} , condition: {"kind":"not","condition":{"kind":"flag","id":"chen-at-table"}}},
  inspect('kneading-board', '擀面板', 'morning-board', 40.2, 70.5, 24, 10.5, "陈伯将面团往旁边一收，案面上几道刀印才露出来。平常上头撒着粉，你只看见白的一片，这会儿凑近，能认出深浅不同的线，有的还绕开了木头原来的小结。\n\n最外面那道横得直，像特意量过。你拿手指在旁边比，陈伯先将你的手拨开，让你洗干净了再碰，接着才说那是从前分剂子用的准线。刚开始总是一头大一头小，怕上笼以后熟得也不一样，就先留一段照着切。\n\n你问现在还照不照着看，他将一截面团搓好，分出来几块，没再低头找线。切完他自己看了一眼，挑出稍大的一块重新揉了揉，说手熟归手熟，也不是闭眼就能做。\n\n新撒的面粉又盖住那道印子。你刚要夸他分得准，他先叫你别照着这大小猜能吃几个，包馅还没算进去，真饿了去拿后面给你留的。", 'board-marks', 'bench'),
  inspect('work-apron', '洗得发白的围裙', 'prop-apron', 6.3, 55.3, 8, 20, "围裙口袋里露着两颗水果糖，糖纸外沾了一点面粉，你想帮着抖掉，陈伯隔着门先说拿一颗，别一把全掏了，待会儿还有个小的要来。\n\n你问是不是还当自己六岁，他说不是，六岁那回也没让你一把拿。你伸手挑时，他又问要酸的还是甜的，隔着这么远，倒知道口袋里那两颗不一样。\n\n你把另一颗留回去，口袋下面还压着一角叠好的纸，没有跟着抽出来。陈伯叫你拿走的先吃，糖纸别塞围裙，他收摊掏口袋，一手都是你们留下的空壳，明天又得从头找还有没有糖。", undefined, 'hooks'),
  inspect('chen-knee', '折起来的护膝', 'prop-brace', 19.5, 89.3, 4, 6.2, "护膝收在柜下的干格里，魔术贴已经扣好，不会一拿出来就勾住旁边的布。盒子摆得整齐，翻开却不是全新的味道，内侧有一处已经起毛，弯腿常压的地方也软一些。\n\n阿宁在盒盖内贴了字，叫父亲走楼梯的时候戴着，旁边那个好写得很小，挤着她最后一个字。你用手挡住别处，只看那个好，才认出跟账本上的字是一种写法，陈伯并没另找纸答她。\n\n盒子外头看着新，东西却用过，今天放在柜里，也不能据此说一直没拿出来。你将扣子照原样合上，免得收回去时把布扯坏，又把盒盖那一面留朝外，让人一开柜就看得见。\n\n盒子往回收的时候卡住了布角，你将护膝托起来，再把盖子合严。那个好还留在盖里，陈伯拿出来用，第一眼也能看见。", 'knee-note', 'storage'),
  { id: 'cabinet', label: '借一只保温袋', x: 16, y: 71.5, cameraView: 'storage', icon: 'book', sprite: sprite('prop-bag', 8, 13), condition: not(holdingBag), completed: holdingBag,
    interaction: { kind: 'inspect', text: "保温袋挂在柜门外，提手绕了门把两圈。你起初只往外扯，袋口越扯越紧，停下来将最上面那圈松开，才拿得下来，没必要连门一块儿拉。\n\n陈伯看见你手里的钥匙，先问阿婆真找出来了？他说上回还争过一次，她说没丢，他说没丢就拿出来看看，后来一个去收笼，一个回家做饭，谁也没再提，钥匙就一直在奶奶那里。\n\n袋子里面空着，底下一块旧油印洗不掉，别处都擦得干净。陈伯叫你摸摸内层，说刚换过，不要往里面直接倒热汤，装好盒再放，袋子能保温，也不能替饭盒收汁。\n\n你试着把书放进去，他立刻指了指外层，说阿婆缝书缝了半天，别出去一趟带回一袋肉汤味。要借就先说，用完跑完那几家再还，他这边还找得到别的，不用你为了还个空袋子来回赶。", options: [
      { id: 'borrow-with-key', onceKey: 'borrow-bag', label: '给陈伯看过钥匙，借走保温袋', condition: { kind: 'item', id: 'small-key' }, unavailable: '问问陈伯，也能借。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
      { id: 'borrow-by-asking', onceKey: 'borrow-bag', label: '问陈伯借来用一天', condition: flag('morning-listened'), unavailable: '先和陈伯说一声。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
    ] } },
];
const yard: Hotspot[] = [
  {"id":"ning-drawing","label":"小朱画的教室","x":60.3,"y":43.9,"cameraView":"school-drawing","icon":"look","sprite":{"asset":"morning-school-drawing","width":6.3,"height":5.8,"z":8},"interaction":{"kind":"inspect","manipulation":"flip","text":"画纸比信封大，阿宁另放在干柜上层，离水池远一些。你看了半天，窗户画得像墙一样大，讲台上那个人穿蓝裙，下面几张桌子都只留了三条腿。\n\n“挡住的那一条不用画，小朱特意跟我交代的。”阿宁指给你看，“你可别替他补上，我答应原样带回来的。”\n\n右下角还留着给陈老师的位置，纸折过一道，背面贴了窄窄的胶带。","exhibit":{"kind":"note","kicker":"实习班的小朱画的","title":"陈老师的教室","lines":["二楼，朝南，窗户画得特别大。","老师穿蓝裙子，桌子画了三条腿。","靠窗：给陈老师留的位置。"]},"action":{"id":"read-ning-drawing","label":"把画放回干的地方","effects":[{"kind":"clue","id":"ning-drawing"}]}},"completed":{"kind":"clue","id":"ning-drawing"},"variants":[{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-papers-shared"},{"kind":"not","condition":{"kind":"flag","id":"morning-meal-cleared"}}]},"x":76.8,"y":66.5,"width":6.2,"height":3.2,"cameraView":"ledger-meal"}]},
  {"id":"ning-chalk","label":"门边的三盒粉笔","x":18,"y":69.7,"cameraView":"bag","icon":"look","sprite":{"asset":"morning-chalk-boxes","width":5.4,"height":6.4,"z":8},"interaction":{"kind":"inspect","text":"纸袋收到了门边干凳上，不再堵着通路。里面一盒叠着一盒，一共三盒粉笔。最上面那盒开了口，露出几根白的，阿宁伸手给按回去，说先别拆散，学校其实都有。\n\n你问那怎么还买，她说挑文件夹的时候顺手拿的，回家一倒才发现拿多了。黑笔也买了，教案却还没收齐，倒先把床铺成了文具柜。","exhibit":{"kind":"note","kicker":"阿宁刚买的东西","title":"三盒粉笔","lines":["粉笔三盒，黑笔和文件夹另放。","学校有，阿宁还是想先买一点。","纸袋还在门后，陈伯昨天差点绊着。"]},"action":{"id":"read-ning-chalk","label":"替她把盒盖按好","effects":[{"kind":"clue","id":"ning-chalk"}]}},"completed":{"kind":"clue","id":"ning-chalk"}},
  {"id":"morning-table-plan","label":"饭桌旁的备料表","x":60,"y":68,"cameraView":"ledger-meal","icon":"look","sprite":{"asset":"morning-sample-sheet","width":7,"height":3.2,"z":8},"interaction":{"kind":"inspect","manipulation":"flip","text":"阿宁把备料表从灶间带过来，搁在手边。七点开门那行后面添了问号，样面的安排写在下面：后天六点半，先拿一盆，第一笼照旧，第二笼试。\n\n她把送面电话留在背面，表角那句别一开口就吵被划过，仍看得出来。陈伯还没接，先将碗朝自己这边挪了一点。","exhibit":{"kind":"note","kicker":"阿宁改过几回的备料表","title":"先试样，开门另议","lines":["后天六点半，先送一盆样面。","第一笼照旧，拿第二笼试。","先试三天，先验再收。","七点开门？等样面试过再说。","背面：面粉、发面情况与送面电话。"]},"action":{"id":"read-morning-table-plan","label":"把表翻清楚","effects":[{"kind":"clue","id":"schedule"}]},"versions":[{"condition":{"kind":"flag","id":"morning-defer"},"text":"备料表折了两折，放在柜旁。阿宁没拿走，陈伯说晚上吃饭之前看。三个试样的格子还没画，七点开门那句也没定。","exhibit":{"kind":"note","kicker":"阿宁留下的提议稿","title":"晚上再看","lines":["表折好放柜旁，今天没有约定试样。","三天的格子还没画。","七点开门仍是问号。"]}},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-meal-cleared"},{"kind":"flag","id":"morning-table"}]},"text":"表还放在饭桌边，陈伯答应先看看一盆样面，没把试三天和晚开门一起定下。阿宁说晚一点给师傅回话，纸没有重新贴回灶间。","exhibit":{"kind":"note","kicker":"今天先把早饭吃完","title":"先看一盆样面","lines":["后天让师傅带样面看看。","还没正式约试三天。","开门时间照旧，别的再商量。"]}},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-papers-shared"},{"kind":"not","condition":{"kind":"flag","id":"morning-meal-cleared"}}]},"text":"备料表和账页已经并排放着，送样面那一面朝陈伯。阿宁的手指还压在改过的站名旁，你把自己的书往旁边收，让画纸也放得下。"}]},"condition":{"kind":"all","conditions":[{"kind":"flag","id":"chen-at-table"},{"kind":"not","condition":{"kind":"flag","id":"morning-plan"}}]},"variants":[{"condition":{"kind":"flag","id":"morning-defer"},"x":54.9,"y":43.9,"width":3.4,"height":2.7,"cameraView":"family"},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-papers-shared"},{"kind":"not","condition":{"kind":"flag","id":"morning-defer"}},{"kind":"not","condition":{"kind":"flag","id":"morning-meal-cleared"}}]},"x":59.5,"y":68.3,"width":6.3,"height":3.2,"cameraView":"ledger-meal"}]},
  { id: 'chen-yard', label: '陈伯', x: 49.3, y: 92, cameraView: 'chen-meal', icon: 'talk', sprite: sprite('chen-seated', 21, 44.5, 7), condition: atMeal, interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'ning', label: '阿宁', x: 38.5, y: 86, cameraView: 'sink', icon: 'talk', sprite: sprite('ning', 17.5, 59.5, 7),
    variants: [{ condition: atMeal, asset: 'ning-seated', x: 84, y: 90, width: 20, height: 44.5, cameraView: 'ning-meal' }, { condition: flag('morning-defer'), x: 27, y: 87, cameraView: 'departure' }],
    interaction: { kind: 'dialogue', dialogueId: 'ning-talk' } },
  { id: 'school-letter', label: '新学校的报到信', x: 15.2, y: 77.2, cameraView: 'bag', icon: 'letter', sprite: sprite('morning-school-letter', 8, 6.5), completed: clue('school-letter'),
    interaction: {"kind":"inspect","manipulation":"unfold","text":"报到信从帆布包侧袋里露着一角，阿宁抽出来时先看看手上干不干。下周一到城南小学，教案和试讲的材料各写了一行，信纸下方还有新折过的印。\n\n“画不在信封里了，我刚放那边，怕跟这张一起揉皱。”她朝干柜上层指指。你问她东西收齐没有，她想了一会儿，说粉笔肯定够了，别的回去还得再查。","exhibit":{"kind":"letter","kicker":"前天送到的通知","title":"城南小学 · 下周一报到","lines":["报到时带上教案与试讲材料。","阿宁先坐六点十分的班车。","教室在二楼，朝南，窗户很大。"]},"action":{"id":"read-school-letter","label":"把信折好放回","effects":[{"kind":"clue","id":"school-letter"}]}} },
  { id: 'chen-bus-note', label: '陈伯抄的班车表', x: 57.2, y: 51.3, cameraView: 'family', icon: 'look', sprite: sprite('prop-ledger', 8.5, 6.2), completed: clue('bus-note'),
    variants: [{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"chen-at-table"},{"kind":"flag","id":"morning-papers-shared"},{"kind":"not","condition":{"kind":"flag","id":"morning-defer"}},{"kind":"not","condition":{"kind":"flag","id":"morning-meal-cleared"}}]},"asset":"morning-ledger-flat","x":67.5,"y":68.4,"cameraView":"ledger-meal","width":8,"height":3.6}],
    interaction: {"kind":"inspect","manipulation":"book","text":"账本前面都是面粉、肉和纸袋的钱，最后一页突然没了钱数。六点十分写在上头，站名抄了三回，前两回都改过，第三回旁边才打勾。\n\n再下面是下雨到桥下等。豆沙，放保温袋。\n\n你把翘起的纸角压住，陈伯隔着门问谁在翻账。你说看到班车那页，他应了一声，又去接客人，没有把这页拿去给阿宁。","exhibit":{"kind":"book","kicker":"陈伯的账本 · 最后一页","title":"去城南的路","lines":["六点十分，站名改过三回。","下雨到桥下等。","豆沙，放保温袋。"]},"versions":[{"condition":{"kind":"flag","id":"morning-papers-shared"},"text":"阿宁已经翻到最后一页，指尖压在那个改过的站名上。陈伯问她是不是写错了，她摇头，又往下看。\n\n两个人谁也没伸手把纸合上。你将自己的书收远一点，让那张画也放得下。"}],"action":{"id":"read-chen-bus-note","label":"记住这几站路","effects":[{"kind":"clue","id":"bus-note"}]}} },
  { id: 'ning-family-photo', label: '旧相框', x: 50.6, y: 44.1, cameraView: 'family', icon: 'look', sprite: sprite('morning-family-photo', 4.8, 6.5), completed: clue('ning-photo'),
    interaction: {"kind":"inspect","manipulation":"flip","text":"阿宁穿着大一号的校服站在店前，陈伯替她提着快碰到地的书包。照片背面是他的字：她说长大了当老师。\n\n阿宁看你翻过去，先笑，说从前不想写作业，父亲就拿这句来问。如今报到信真来了，他反倒只问面搬进来没有。你把框摆回去，她又让你别弄倒，底下那只脚松了。","exhibit":{"kind":"photo","kicker":"相框背面 · 圆珠笔字","title":"她说长大了当老师","lines":["阿宁穿着大了一号的校服，站在店门口。","陈伯一手提书包，一手拎蒸笼。"]},"action":{"id":"read-ning-family-photo","label":"把相框放回","effects":[{"kind":"clue","id":"ning-photo"}]}} },
  { id: 'yard-cup', label: '给两个人倒杯茶', x: 75.3, y: 62, cameraView: 'tea', icon: 'tea', sprite: sprite('morning-tea-empty', 11, 7),
    variants: [{ condition: flag('morning-tea'), asset: 'morning-tea-filled' }], completed: flag('morning-tea'),
    interaction: {"kind":"inspect","text":"茶壶还有一点温，两只杯子留在碗外。阿宁把有姜片的那只让到父亲对面，另一只先空着。\n\n你问是不是该再烫一遍，她说先倒一点，等坐下来自己添，别一边端饭，一边还得绕过两杯满水。","options":[{"id":"morning-pour-tea","label":"把两杯茶倒上","feedback":"阿宁端起一杯，将有姜的那只推到对面。你怕倒少了要再添，她叫先这样，等父亲坐下自己续，别一会儿端碗又得绕着满杯的茶走。","effects":[{"kind":"flag","id":"morning-tea"}]}]} },
];
export const morning: Chapter = {
  id: 'morning', number: 2, title: '一笼早饭', subtitle: '下一笼，就出锅了。', time: '早市 · 陈家包子铺',
  description: "柜前有人伸手取早饭，后面又喊下一笼好了，陈伯顾着找钱，抬头才认出你。灶间的帘子不断被掀起，阿宁在后院放碗，自己的饭还没端上桌。你把书拿稳，先给进出的人让一条路。", asset: 'morning-front', position: 'center', tint: 'dawn',
  questId: 'morning', metricIds: ['listening'], hotspots: [], firstScene: 'morning-front',
  objective: '帮陈伯赶完早市，再坐下来吃口热的。', next: 'noon', exitLabel: '去琴记面馆',
  exit: any({ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'quest', id: 'morning', status: 'failed' }),
  exitHint: '早饭还没端上桌。陈伯和阿宁都在等你。',
  beats: [{ label: '和陈伯打个照面', condition: flag('morning-listened') }, { label: '去后院找阿宁', condition: flag('ning-heard') }, { label: '在灶间跟陈伯学下一笼', condition: flag('morning-played') }, { label: '把早饭端上桌', condition: flag('morning-ended') }],
  scenes: [
    { id: 'morning-front', title: '店门口', time: '早市 · 等候与取餐', description: "等早饭的人挨着长凳站，买好的从搁板那边拿，零钱在另一头收。陈伯转身就能摸到纸袋，空笼往里面让了些，门口这条路仍要留给端东西的人。", asset: 'morning-front', hotspots: front,
      foreground: { clipPath: 'polygon(55.3% 54.4%,100% 58%,100% 85%,56.6% 80.6%)', z: 5 },
      camera: { views: [
        { id: 'counter', label: '柜台边', x: 49.5, y: 52, zoom: 1.45 },
        { id: 'rest', label: '柜台外侧的坐处', x: 49, y: 63, zoom: 1.5 },
        { id: 'waiting-seat', label: '长凳旁的小凳', x: 35, y: 77, zoom: 1.65 },
        { id: 'cashier', label: '收银小台', x: 87, y: 51, zoom: 1.8 },
        { id: 'customer-slip', label: '取餐台边的留单', x: 69.9, y: 54.3, zoom: 1.8 },
        { id: 'pickup', label: '取餐搁板', x: 65, y: 56.5, zoom: 1.6 },
        { id: 'empty-basket', label: '空笼的位置', x: 79.7, y: 53, zoom: 1.6 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '掀帘，进灶间', condition: flag('morning-listened'), unavailable: '先和陈伯打个照面。' }] },
    { id: 'morning-kitchen', title: '灶间', time: '清晨 · 揉面与蒸制', description: "面团在案板一侧，空笼留在炉边，陈伯伸手拿哪样都不用绕到门口。后院传来水声，你从干柜旁边经过，得先避开地上刚沾湿的一块。", asset: 'morning-kitchen', hotspots: kitchen,
      camera: { views: [
        { id: 'teaching', label: '陈伯示范的地方', x: 59.5, y: 64, zoom: 1.4 },
        { id: 'stove', label: '蒸炉边', x: 73.5, y: 48, zoom: 1.6 },
        { id: 'plan', label: '墙上的备料表', x: 35.5, y: 36, zoom: 1.8 },
        { id: 'bench', label: '揉面案', x: 40.2, y: 66, zoom: 1.6 },
        { id: 'hooks', label: '入口挂钩', x: 6.3, y: 46, zoom: 1.7 },
        { id: 'storage', label: '入口干柜', x: 17.5, y: 77, zoom: 1.7 },
      ] }, links: [{ sceneId: 'morning-front', label: '回店门口' }, { sceneId: 'morning-yard', label: '穿过后门，去小院' }] },
    { id: 'morning-yard', title: '后院', time: '早市后 · 洗手与吃早饭', description: "洗过的东西靠水池搭着，帆布包和教案放在干凳旁边。桌上先摆了碗筷，阿宁来回拿东西，没有将自己的信一起收进灶间，门外有人叫，仍听得见。", asset: 'morning-yard', hotspots: yard,
      foreground: { clipPath: 'polygon(65.4% 57.2%,81.6% 57.7%,79.2% 68.7%,78.4% 90.4%,76.8% 90.2%,77% 72.4%,58.8% 71.5%,58.6% 89.7%,56.8% 89.6%,56.6% 69.5%,54.9% 66.5%)', z: 6 },
      decorations: [
        { id: 'chen-empty-seat', asset: 'prop-stool', x: 49.3, y: 91.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'ning-empty-seat', asset: 'prop-stool', x: 84, y: 89.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'family-breakfast', asset: 'morning-breakfast', x: 67, y: 64.5, width: 9, height: 5.5, z: 9, condition: all(flag('morning-played'), not(flag('morning-meal-cleared'))) },
      ],
      camera: { views: [
        { id: 'sink', label: '水池旁', x: 38.5, y: 52, zoom: 1.45 },
        { id: 'bag', label: '干凳与帆布包', x: 15.2, y: 72, zoom: 1.7 },
        { id: 'family', label: '家用柜', x: 54.5, y: 47, zoom: 1.8 },
        { id: 'school-drawing', label: '上层的教室画', x: 60.3, y: 40.8, zoom: 1.8 },
        { id: 'chen-meal', label: '陈伯的坐处', x: 49.3, y: 60, zoom: 1.5 },
        { id: 'ning-meal', label: '阿宁的坐处', x: 84, y: 58, zoom: 1.45 },
        { id: 'ledger-meal', label: '饭桌边的账簿', x: 61.5, y: 64.5, zoom: 1.75 },
        { id: 'tea', label: '桌角的茶具', x: 75.3, y: 59.5, zoom: 1.6 },
        { id: 'departure', label: '门边的干凳', x: 27, y: 60, zoom: 1.5 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '回灶间' }] },
  ],
};

const father: DialogueSeed[] = [
  {
    "portrait": "chen",
    "id": "invite",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-invite",
        "condition": { "kind": "reward", "id": "ning-ready-bye" },
        "unavailable": "先去后院跟阿宁尝一口，问好饭摆在哪儿。",
        "label": "那我们先摆碗。",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-at-table"
          },
          {
            "kind": "flag",
            "id": "morning-zhou-collected"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "opening",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-listen",
        "label": "阿宁在后头？我去找她。",
        "next": "concern",
        "effects": [
          {
            "kind": "flag",
            "id": "morning-listened"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "morning-shared-memory",
        "label": "照片里那个包子，你还记得吧？",
        "condition": {
          "kind": "any",
          "conditions": [
            {
              "kind": "clue",
              "id": "family-photo"
            },
            {
              "kind": "clue",
              "id": "chen-memory"
            }
          ]
        },
        "unavailable": "先看看奶奶家的旧照片，或听她讲起那回包包子的事。",
        "next": "old-photo",
        "effects": []
      },
      {
        "id": "morning-bye",
        "label": "我先在店里看看。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "old-photo",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-memory-return",
        "label": "今天我包个像样的。",
        "next": "concern",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-recognized"
          },
          {
            "kind": "flag",
            "id": "morning-listened"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "concern",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-ask-knee",
        "label": "你柜里那个护膝，怎么没戴？",
        "condition": {
          "kind": "clue",
          "id": "knee-note"
        },
        "unavailable": "还没留意到护膝。",
        "next": "knee",
        "effects": []
      },
      {
        "id": "morning-ask-old-hours",
        "label": "老周每天都这个点来？",
        "next": "hours",
        "effects": []
      },
      {
        "id": "morning-thanks",
        "label": "我去后院看看。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "hours",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-hours-end",
        "label": "看来今天这方子还得认真学。",
        "effects": [
          {
            "kind": "clue",
            "id": "old-customer"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "knee",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-knee-end",
        "label": "那我就当没看见。",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-has-seat"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "before-food",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-back-to-talk",
        "label": "我先看看别的，待会儿回来。",
        "effects": []
      },
      {
        "id": "morning-return-stove",
        "label": "老周青菜两只，阿宁豆沙一只，你的肉包也得留。",
        "effects": [],
        "activityId": "morning-game",
        "condition": {
          "kind": "flag",
          "id": "ning-heard"
        },
        "unavailable": "先去后院问清阿宁的那份，再来装下一笼。"
      },
      {
        "id": "morning-decide",
        "label": "早饭好了，我们去后院吃。",
        "condition": {
          "kind": "flag",
          "id": "morning-played"
        },
        "unavailable": "先把这一笼照看好。",
        "next": "table",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-at-table"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "table",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-show-papers",
        "label": "要不把两张纸放一起看看？",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "schedule"
            },
            {
              "kind": "clue",
              "id": "bus-note"
            },
            {
              "kind": "metric",
              "id": "listening",
              "min": 4
            }
          ]
        },
        "unavailable": "两张纸要看齐，也得听阿宁把安排说完。",
        "next": "papers",
        "effects": [
          {
            "kind": "flag",
            "id": "morning-papers-shared"
          }
        ]
      },
      {
        "id": "morning-table-first",
        "label": "包子再不吃就凉了。等会儿讲吧。",
        "next": "sit-down",
        "effects": []
      },
      {
        "id": "morning-later-plan",
        "label": "今天先不改了，慢慢再说。",
        "next": "defer",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "papers",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-let-father-answer",
        "label": "我先把书收起来，听你们说。",
        "next": "bus",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "bus",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-let-ning-answer",
        "label": "把样面那一栏翻给陈伯看。",
        "next": "trial",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "trial",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-agree",
        "label": "把试行的三格记下来。",
        "decision": "morning",
        "next": "trial-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "morning-plan"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "morning-leave-to-them",
        "label": "先把这一顿吃完，表晚点再放。",
        "next": "sit-down",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "trial-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-trial-close",
        "label": "把书收好，等后天再来。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-record"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "sit-down",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-table-agree",
        "label": "我把咸菜拿走，你们慢慢吃。",
        "decision": "morning",
        "next": "table-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "morning-table"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "table-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-table-close",
        "label": "我这回拿纸袋装。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-record"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "defer",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-overpromise",
        "label": "那我先把书收起来。",
        "decision": "morning",
        "next": "defer-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "failed"
          },
          {
            "kind": "flag",
            "id": "morning-defer"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          }
        ]
      },
      {
        "id": "morning-reconsider",
        "label": "再坐会儿吧，包子还剩着。",
        "next": "sit-down",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "defer-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-defer-close",
        "label": "那我下次再来问。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-unfinished"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "after",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-after-bye",
        "label": "我描清楚，回家先试少量。",
        "effects": []
      }
    ]
  },
  {
    "id": "counter-busy",
    "speaker": "陈伯",
    "portrait": "chen",
    "choices": [
      {
        "id": "morning-counter-busy-close",
        "label": "我先去后头看看。",
        "effects": []
      }
    ]
  }
];
const daughter: DialogueSeed[] = [
  {
    "portrait": "ning",
    "id": "hello",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ask-school",
        "label": "学校那边怎么定下来的？",
        "next": "school",
        "effects": [
          {
            "kind": "flag",
            "id": "ning-heard"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "ning-hello-bye",
        "label": "我先把店里看完。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "school",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ask-plan",
        "label": "你贴在灶间那张表，是怎么回事？",
        "condition": {
          "kind": "clue",
          "id": "schedule"
        },
        "unavailable": "去灶间看看她改过的备料表。",
        "next": "plan",
        "effects": []
      },
      {
        "id": "ning-listen",
        "label": "你是不是有点担心陈伯？",
        "next": "not-said",
        "effects": []
      },
      {
        "id": "ning-school-close",
        "label": "我先回灶间，待会儿再来。",
        "effects": []
      },
      {
        "id": "ning-ask-chalk",
        "label": "干凳上那三盒粉笔，真都是你买的？",
        "condition": {
          "kind": "clue",
          "id": "ning-chalk"
        },
        "unavailable": "看看门后新买的粉笔。",
        "next": "chalk",
        "effects": []
      },
      {
        "id": "ning-ask-drawing",
        "label": "小朱那张画，我翻过了。",
        "condition": {
          "kind": "clue",
          "id": "ning-drawing"
        },
        "unavailable": "先看看干凳旁的画纸。",
        "next": "drawing",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "plan",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-plan-close",
        "label": "这张先别收，饭桌上能用。",
        "effects": [
          {
            "kind": "flag",
            "id": "ning-plan-heard"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "not-said",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-listen-close",
        "label": "我去看下一笼了。",
        "effects": [
          {
            "kind": "clue",
            "id": "ning-breakfast"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "ready",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ready-bye",
        "label": "我把这只端过去。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "after",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-after-bye",
        "label": "行。那你也记得吃午饭。",
        "effects": [{ "kind": "clue", "id": "ning-lunchbox" }]
      },
      {"id":"ning-take-lunchbox-message","label":"饭盒那句话，我替你记着。","condition":{"kind":"not","condition":{"kind":"clue","id":"ning-lunchbox"}},"effects":[{"kind":"clue","id":"ning-lunchbox"}]}
    ]
  },
  {
    "id": "chalk",
    "speaker": "阿宁",
    "portrait": "ning",
    "choices": [
      {
        "id": "ning-chalk-close",
        "label": "我把袋子往里收，别再绊着。",
        "effects": []
      }
    ]
  },
  {
    "id": "drawing",
    "speaker": "阿宁",
    "portrait": "ning",
    "choices": [
      {
        "id": "ning-drawing-close",
        "label": "我原样夹好，不给他多画一条腿。",
        "effects": []
      }
    ]
  }
];
export const morningDialogues: Dialogue[] = [
 { id:'morning-talk',entry:'opening',entries:[{condition:all(flag('morning-plan'),not({kind:'reward',id:'morning-trial-close'})),nodeId:'trial-end'},{condition:all(flag('morning-table'),not({kind:'reward',id:'morning-table-close'})),nodeId:'table-end'},{condition:all(flag('morning-defer'),not({kind:'reward',id:'morning-defer-close'})),nodeId:'defer-end'},{condition:flag('morning-ended'),nodeId:'after'},{condition:all(flag('morning-played'),not(flag('chen-at-table')),not({kind:'reward',id:'ning-ready-bye'})),nodeId:'counter-busy'},{condition:all(flag('morning-played'),not(flag('chen-at-table'))),nodeId:'invite'},{condition:flag('morning-played'),nodeId:'table'},{condition:flag('morning-listened'),nodeId:'counter-busy'}],nodes:father.map(node=>scriptNode({...node,versions:node.id==='opening'?[{condition:{kind:'reward',id:'arrival-ate'},beats:chenScripts.opening!.map(beat=>beat.kind==='speech'&&beat.speaker==='小满'&&beat.text==='还没。'?{...beat,text:'吃了一点，还能吃你这儿的。'}:beat)}]:node.id==='knee'?[{condition:flag('chen-has-seat'),beats:chenKneeSeated}]:node.id==='counter-busy'?[{condition:flag('morning-played'),beats:chenWaitingForBreakfast}]:undefined},chenScripts[node.id])) },
 { id:'ning-talk',entry:'hello',entries:[{condition:flag('morning-ended'),nodeId:'after'},{condition:flag('morning-played'),nodeId:'ready'},{condition:flag('ning-heard'),nodeId:'school'}],nodes:daughter.map(node=>scriptNode({...node,versions:node.id==='after'?[{condition:all(laterJourney,flag('morning-plan')),beats:ningLaterFollowup(ningAfterTrial)},{condition:all(laterJourney,flag('morning-table')),beats:ningLaterFollowup(ningAfterTable)},{condition:all(laterJourney,flag('morning-defer')),beats:ningLaterFollowup(ningAfterDefer)},{condition:flag('morning-plan'),beats:ningAfterTrial},{condition:flag('morning-table'),beats:ningAfterTable},{condition:flag('morning-defer'),beats:ningAfterDefer}]:undefined},ningScripts[node.id])) },
];
export const morningGame: MinigameDefinition = {
  "id": "morning-game",
  "chapterId": "morning",
  "module": "breakfast",
  "title": "下一笼",
  "target": 75,
  "description": "先做五只：老周两只青菜，阿宁一只豆沙，陈伯和你各一只肉的。认馅、看火，再把两袋和饭碗分清。",
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "morning-listened"
      },
      {
        "kind": "flag",
        "id": "ning-heard"
      },
      {
        "kind": "any",
        "conditions": [
          {
            "kind": "reward",
            "id": "morning-return-stove"
          },
          {
            "kind": "reward",
            "id": "morning-back-to-talk"
          },
          {
            "kind": "flag",
            "id": "morning-played"
          }
        ]
      }
    ]
  },
  "unavailable": "先在后院问好阿宁的那份，再到灶间跟陈伯学包子。",
  "breakfast": {
    "fillings": [
      "青菜",
      "豆沙",
      "鲜肉"
    ],
    "orders": [
      {
        "id": "zhou",
        "person": "周叔带走",
        "hint": "给老伴，清淡些。",
        "filling": "青菜",
        "count": 2
      },
      {
        "id": "ning",
        "person": "阿宁的碗",
        "hint": "她从小爱吃甜的。",
        "filling": "豆沙",
        "count": 1
      },
      {
        "id": "chen",
        "person": "陈伯的碗",
        "hint": "留一只肉的，别全卖了。",
        "filling": "鲜肉",
        "count": 1
      },
      {
        "id": "xiaoman",
        "person": "小满的碗",
        "hint": "歪的那只自己吃，鲜肉馅。",
        "filling": "鲜肉",
        "count": 1
      }
    ],
    "packaging": [
      {
        "orderId": "zhou",
        "title": "老周的两只青菜",
        "choices": [
          {
            "id": "one-bag",
            "label": "两只装在同一袋"
          },
          {
            "id": "two-bags",
            "label": "两只分别装袋"
          }
        ],
        "expected": "two-bags",
        "wrong": "陈伯：“分开，两个袋。带回家的别让路上那只压扁，今天别叫你坏了规矩。”"
      },
      {
        "orderId": "chen",
        "title": "陈伯自己的肉包",
        "choices": [
          {
            "id": "bag",
            "label": "放进纸袋"
          },
          {
            "id": "bowl",
            "label": "留在碗里"
          }
        ],
        "expected": "bowl",
        "wrong": "阿宁：“爸的放碗里。装进袋子，他一伸手又递给客人了。”\n陈伯：“你怎么老觉得我一眨眼就能卖光自己那份？”"
      }
    ],
    "copy": {
      "intro": "陈伯：“一共五只先做，老周两只青菜，给阿宁豆沙，给我留只肉的。还有一只……你想吃什么？”\n小满：“肉的。”\n陈伯：“行。先认馅，别包到最后给我整只豆沙。”",
      "fillings": {
        "青菜": "小满：“青菜切这么细啊？”\n陈伯：“太粗不好收口，也别剁成泥。水先弄干爽，别带进面皮。你拿一点看看，别整盆抓。”",
        "鲜肉": "陈伯：“这盆拌完，筷子一挑能带起来。你以后自己做两回，就知道差在哪儿。”\n小满：“今天真有点咸？”\n陈伯：“出锅自己尝，咸淡哪能光闻出来。”",
        "豆沙": "陈伯：“阿宁那只。别塞一大坨，留点地方收口。她嘴上说甜的越多越好，漏了又嫌沾手。”"
      },
      "wrongFillings": {
        "chen": "陈伯：“哎，这怎么给我了？肉的，肉的！阿宁正站那儿笑，待会儿又说我不认得自己的包子。”"
      },
      "checkOrders": "陈伯：“再数一遍。老周青菜两只，阿宁豆沙一只，咱俩各留只肉的，一共五只。”",
      "beforeSteam": "陈伯：“收口再捏紧点。包好了醒一会儿，再合盖上火。火我看着，你留意盖沿的白气，别一闻着香就揭。”",
      "early": "陈伯：“刚合上就掀，怕它们在里头吵架啊？盖回去，我给你看着，等会儿再开。”",
      "late": "陈伯：“这回火急了，先关。没让你跟它比谁更能等，再来一回。”",
      "steamed": "笼盖揭开，热气一下涌出来，你往后躲半步。两只包子的边挨在一起。\n陈伯：“别抓，拿夹子，先松开边上。好，就这样。你那个歪的居然没破。”\n小满：“也是你教得好。”\n陈伯：“这句给你阿婆多讲两遍。”",
      "helped": "陈伯扶住笼盖：“看，跟这个气差不多就行。来，拿夹子，分装你自己认，别连我的那只也送走。”",
      "packed": "阿宁端着碗过来：“老周那两袋我拿去前头。爸，你这只留碗里。”\n陈伯：“我没往袋里放！上次是上次。”\n阿宁：“行，那你今天记得来吃。”"
    }
  },
  "reward": {
    "id": "morning-game-reward",
    "label": "出笼了",
    "feedback": "五只都出笼了。老周的两袋放在前头，阿宁的豆沙、陈伯的肉包和你自己那只各留在碗里。\n\n阿宁叫你端着，陈伯还惦记那只歪的：“你不是要记方子？吃了再记，别光看热气。”",
    "effects": [
      {
        "kind": "flag",
        "id": "morning-played"
      },
      {
        "kind": "metric",
        "id": "listening",
        "amount": 1
      }
    ]
  }
};
