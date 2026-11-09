import type { CollectionEntry, Condition, ContentPack, Recipe } from '../core/contracts.ts';

export const lifeUnlocked: Condition = { kind: 'any', conditions: [
  { kind: 'quest', id: 'morning', status: 'completed' },
  { kind: 'quest', id: 'morning', status: 'failed' },
] };
export const revisitUnlocked: Condition = { kind: 'any', conditions: (['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest', id: 'morning', status })) };
// Conditions remain ordinary content. The UI never grants its own narrative flags.
export const progression: NonNullable<ContentPack['progression']> = {
  unlocks: {
    journal: { kind: 'clue', id: 'book' },
    inventory: { kind: 'item', id: 'small-key' },
    lifeNotes: lifeUnlocked,
    revisit: revisitUnlocked,
    collection: { kind: 'any', conditions: (['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest', id: 'noon', status })) },
  },
  guides: [
    { id: 'noon-window', chapterId: 'noon', title: '看看这碗面', text: '点碗看看，问问田姨为什么没动筷。', target: 'untouched-bowl', complete: { kind: 'any', conditions: [{ kind: 'flag', id: 'noon-listened' }, { kind: 'clue', id: 'wrong-bowl' }] } },
    { id: 'arrival-look', chapterId: 'arrival', title: '拿起手机', text: '点一下柜上的手机。', target: 'phone', focus: true, chrome: 'minimal', complete: { kind: 'any', conditions: [{ kind: 'flag', id: 'arrival-greeted' }, { kind: 'flag', id: 'tea-offered' }, ...['book', 'family-photo', 'invitation', 'calendar', 'job-gap'].map(id => ({ kind: 'clue' as const, id }))] } },
    { id: 'arrival-talk', chapterId: 'arrival', title: '和奶奶聊聊', text: '点奶奶，听她说完再接话。', target: 'grandma', focus: true, chrome: 'minimal', complete: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-instructions' }] } },
    { id: 'arrival-read', chapterId: 'arrival', title: '翻开旧书', text: '点写字台上的书。', target: 'book', focus: true, chrome: 'minimal', complete: { kind: 'clue', id: 'book' } },
    { id: 'arrival-pack', chapterId: 'arrival', title: '整理书签', text: '把三张长书签放回相应的时间。', target: 'book', focus: true, chrome: 'book', complete: { kind: 'flag', id: 'arrival-packed' } },
    { id: 'arrival-leave', chapterId: 'arrival', title: '出门去巷口', text: '准备好了就出门，也能先在屋里逛逛。', control: 'departure', condition: { kind: 'flag', id: 'arrival-packed' }, complete: { kind: 'quest', id: 'morning', status: 'active' } },
    { id: 'morning-return-home', chapterId: 'morning', title: '回奶奶家', text: '点这里回家，回来还接着刚才的事。', control: 'home', condition: revisitUnlocked, complete: { kind: 'flag', id: 'morning-listened' } },
    { id: 'life-and-revisit', chapterId: 'morning', title: '书里添了几行', text: '翻开《百味录》，看看新记下的事。', control: 'journal', condition: lifeUnlocked, complete: { kind: 'quest', id: 'noon', status: 'active' } },
  ],
};

export const recipes: Recipe[] = [
  { id: 'xu-tofu-rice', title: '许叔的豆腐烧菜饭', subtitle: '夜饭小馆 · 两份饭分开核对', asset: 'night-bowl', condition: { kind: 'flag', id: 'night-played' },
    note: '许叔让我先认两张单，菜一样，碗和盒子却不能顺手拿一份算一份。罗姐的辣酱放碗边，她自己拨，小梁的另外装杯，筷子也留在外头。搭扣试过了，饭盒还是先空着，等那句确认回来再盛。我原想把这些都记在做法下面，写完才发现，光是分清这一顿给谁，就已经占了好几行。',
    ingredients: ['米饭', '豆腐烧菜', '辣酱，按吃法另放'], steps: ['豆腐切块，入锅煎到表面微黄。', '添少许水与调味汁，烧到豆腐入味。', '盛米饭，浇上豆腐烧菜。先问辣酱放哪里。', '堂食用浅碗；留餐确认时间后再盛，辣酱另杯，筷子放盒外。'] },
  {
  "id": "osmanthus-rice",
  "title": "桂花米酒",
  "subtitle": "奶奶的旧方 · 先誊清这一页",
  "asset": "recipe-rice",
  "condition": {
    "kind": "clue",
    "id": "book"
  },
  "note": "方子写在一张旧购物单背面，糖旁边有另一种细笔迹，添着尝过再放。原来写的量没有涂掉，我把先尝、不够甜再添这句补到旁边，桂花关火后撒又另写一行。奶奶让我把旧纸留下，只带三张长书签出门，别将买菜单也带去问陈伯。",
  "ingredients": [
    "甜酒酿两大勺",
    "清水一小碗",
    "干桂花一小撮",
    "糖，尝过再添"
  ],
  "steps": [
    "清水入小锅，煮到锅边冒起细泡。",
    "拨散酒酿，连同酒汁放进去，轻轻搅开。",
    "再滚一会儿，尝尝甜味。喜欢甜的再添一点糖。",
    "关火后撒桂花，盛进小碗。趁热喝，别急。"
  ]
},
  {"id":"chen-buns","title":"陈家包子 · 今日所学","subtitle":"陈家包子铺 · 自己包的那一只","asset":"prop-buns","condition":{"kind":"flag","id":"morning-played"},"note":"我那只皮歪了，居然没有漏。陈伯说卖不成，第一口全是面，第二口全是馅，我自己吃正好。老周两只青菜分两袋，阿宁豆沙一只，陈伯和我各一只肉的。五只先留齐，最后分装才没把谁那份忘掉。","ingredients":["发好的面团","鲜肉、青菜与豆沙馅","笼布、蒸屉和夹子"],"steps":["面皮：先看软硬和回弹，切剂子后擀皮，中间留厚一点，周围薄些。包好放一会儿，等它松起来再上笼。","鲜肉：先拌出黏劲，水少量多次添，搅进去再加。取一点蒸熟尝咸淡，今天这盆略咸，下回得少放盐。","青菜：洗净，先把水弄干爽，再拌馅。别剁成泥，也别把水一起带进面皮。","豆沙：先分好小球，留得出收口的位置。阿宁说甜的多些好，包漏了又嫌沾手。","上笼：包子留间隔，蒸的时候别一遍遍掀盖。揭开先避开热气，用夹子松开粘着的边。用量与蒸制时间，回家少做一点试过再补清。"]},
  {
  "id": "qin-noodles",
  "title": "琴记的一碗面",
  "subtitle": "琴记面馆 · 把份量也记清楚",
  "asset": "noodle-bowl",
  "condition": {
    "kind": "flag",
    "id": "noon-played"
  },
  "note": "两口都是煮面锅，清汤提前另温，我在书里分开写。面捞到碗里才兑汤，别为了省事拿面汤充。琴姐问葱我吃不吃，没照奶奶从前那份替我点好。她把醋放到桌边，我先尝原汤，觉得要添再自己添；奶奶回头改自己的，就写旁边，原来的给她留着。",
  "ingredients": [
    "现擀的面，整份与半份分开",
    "另温着的清汤",
    "盐、少量生抽",
    "葱花，先问过再添；老醋放桌边"
  ],
  "steps": [
    "清汤提前另温，先尝咸淡；两口面锅留给煮面。",
    "碗里放少量盐、生抽，用清汤冲开，再按口味调整。",
    "面下沸水轻拨，按份量煮熟，捞起沥水后入汤碗。",
    "核对半份和忌口，问过再撒葱。老醋另放，先吹一吹，尝过原汤再添。"
  ]
},
];

export const collection: CollectionEntry[] = [
    {
  "id": "home-thread",
  "title": "留着线头的白线轴",
  "asset": "arrival-thread-spool",
  "condition": {
    "kind": "clue",
    "id": "thread-spool"
  },
  "description": "奶奶补锅垫用的白线，跟篮里的蓝线分着放。线轴还好，用完留一截在外头。",
  "detail": "白线补锅垫，蓝的留给围裙。线头留在木轴外沿，奶奶抽一小段就能接着用。她说自己有时收得太紧，还要拿针挑，见我替她理开，便将布也放一边，让我坐近些说话。"
},
    {
  "id": "home-grocery-slip",
  "title": "用过两面的购物单",
  "asset": "arrival-grocery-slip",
  "condition": {
    "kind": "clue",
    "id": "osmanthus-note"
  },
  "description": "正面买菜，反面记米酒，奶奶从旧书里抽出来，叫我别跟三家店的书签夹混。",
  "detail": "鸡蛋、青菜和桂花在正面，米酒做法在背面，糖的旧量旁边挤着一行细字。纸用过两回，今天新买的那罐桂花却另放厨房。奶奶把旧量留着，让我只在旁边补清做法，这张纸收回桌边，不和三家店的长书签夹混。"
},
  { id: 'family-photo', title: '木框里的合照', asset: 'prop-photo', condition: { kind: 'clue', id: 'family-photo' },
    description: "小时候在陈家拍的合照，我站小凳子够案板，陈伯扶着，奶奶在旁边拿外套。木框的角补过胶，翻过背板还能找到别的字。",
    detail: "日期旁边压着一行浅字，说第一次来长明巷，认门认了三回。那行没有跟六岁吃包子的事写在一处，得将背板向光挪一点才能读清。奶奶还没讲过自己刚来这里的时候，带回家可以问这一句。",
    study: { id: 'collection-photo-note', label: '记住背板的小字', effects: [{ kind: 'clue', id: 'photo-margin' }], feedback: "这行写的是奶奶自己刚来长明巷那会儿，没跟六岁那张照片讲在一起。回去将背板翻给她看，就能从这里问起。" } },
  { id: 'old-book', title: '补过书脊的百味录', asset: 'arrival-book', condition: { kind: 'clue', id: 'book' },
    description: "奶奶交过来的旧食谱，书脊补过，前面写满的页和后面空白的页厚薄不太一样。拿近托住再翻，夹的纸就不会一起滑出去。", detail: "书脊棉线有深浅，旧线旁边又穿过新的一道，补完没有将原来的剪掉。靠前的纸油印多，后面夹大小不同的便条，有的从购物单反面写起。奶奶自己找字也得先认方向，读错一张，旁边又会多出一句解释。" },
  {
  "id": "home-letter",
  "title": "回家前的那封信",
  "asset": "arrival-letter",
  "condition": {
    "kind": "clue",
    "id": "invitation"
  },
  "description": "从外地带回来的家信，车票仍夹在里面。原来的折痕跟车上重折的没有对齐，展开时要沿着两道慢慢抚平。",
  "detail": "奶奶在信里说被子晒过，家里东西没挪多少，找不着就叫她。旧书可以等睡足、吃过饭再一起看，住几天都好，不用先定回去的日子。到站的票根仍夹在里面，来的车次改过，我也给她回过电话。"
},
  { id: 'home-calendar', title: '奶奶的旧日历', asset: 'prop-calendar', condition: { kind: 'clue', id: 'calendar' },
    description: "日历常翻的位置卷了边，后面夹着眼镜店小票。今天那格尤其挤，名字旁边还有改过的一道日期。", detail: "取眼镜和买桂花各有小勾，回家那件只圈着。奶奶说昨晚忙着叫我吃饭，没来得及补，拿笔过来还得在格子外头找个空处。几种笔色叠着，不是一天坐在那里写齐的。" },
  {
  "id": "home-tea",
  "title": "挪到手边的茶杯",
  "asset": "arrival-cup",
  "condition": {
    "kind": "flag",
    "id": "tea-offered"
  },
  "description": "挪到奶奶手边的杯碟，杯柄朝着她用惯的方向。她喝一口，又叫我拿自己的杯子，坐下来一起喝。",
  "detail": "这只杯口有一点缺，奶奶认得从哪边喝。给我留的新杯子还收在柜上，她让我拿来，自己将壶往中间让了让。小几腾出一点地方，两个人伸手都够得着。"
},
  { id: 'my-phone', title: '屏幕里的旧备忘', asset: 'arrival-phone', condition: { kind: 'clue', id: 'job-gap' },
    description: "回来后总想再看一眼的手机，简历只改到半句，没新消息也要点进去看看。往前翻，还能找到上班那几年留下的小便签。", detail: "第一份工资那天写过今晚吃顿好的，下面有小馆的名字和几个人点的菜。我自己那一项只打了一个肉字，后面空着，反倒是那天站门口迟迟没散的样子，比菜单记得清。",
    study: { id: 'collection-first-pay', label: '读读那条旧便签', effects: [{ kind: 'clue', id: 'my-first-pay' }], feedback: "你记起那天结完账，几个人还站在店门口，嘴上各说该走哪边，人却没动。饭店的菜一时记不全，那会儿没急着散的样子先回来了。" } },
];
