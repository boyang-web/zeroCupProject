import type { CollectionEntry, Condition, ContentPack, Recipe } from '../core/contracts.ts';

export const lifeUnlocked: Condition = { kind: 'any', conditions: [
  { kind: 'quest', id: 'morning', status: 'completed' },
  { kind: 'quest', id: 'morning', status: 'failed' },
] };
// Conditions remain ordinary content. The UI never grants its own narrative flags.
export const progression: NonNullable<ContentPack['progression']> = {
  unlocks: {
    journal: { kind: 'clue', id: 'book' },
    inventory: { kind: 'item', id: 'small-key' },
    objectHints: { kind: 'any', conditions: ['book', 'family-photo', 'invitation', 'calendar', 'job-gap'].map(id => ({ kind: 'clue', id })) },
    chapterTrack: { kind: 'flag', id: 'arrival-packed' },
    lifeNotes: lifeUnlocked,
    revisit: lifeUnlocked,
    collection: { kind: 'any', conditions: (['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest', id: 'noon', status })) },
  },
  guides: [
    { id: 'arrival-look', chapterId: 'arrival', title: '先看看身边', text: '手机还放在进门的低柜上。点一下，拿起来看看。', target: 'phone', complete: { kind: 'any', conditions: [{ kind: 'flag', id: 'arrival-greeted' }, { kind: 'flag', id: 'tea-offered' }, ...['book', 'family-photo', 'invitation', 'calendar', 'job-gap'].map(id => ({ kind: 'clue' as const, id }))] } },
    { id: 'arrival-talk', chapterId: 'arrival', title: '奶奶在等你', text: '点奶奶交谈。看过的物件，有时会多出一句可以问的话。', target: 'grandma', complete: { kind: 'flag', id: 'entrusted' } },
    { id: 'arrival-read', chapterId: 'arrival', title: '把旧书翻开', text: '旧书在窗下的写字台上。点一下，再翻开封面，看看奶奶记下的做法。', target: 'book', complete: { kind: 'clue', id: 'book' } },
    { id: 'arrival-pack', chapterId: 'arrival', title: '准备出门', text: '书上可以整理走访书签；左上的《百味录》已经能翻开看食谱了。', target: 'book', complete: { kind: 'flag', id: 'arrival-packed' } },
    { id: 'life-and-revisit', chapterId: 'morning', title: '现在也能记下人的故事', text: '百味录多了「人间百味」。菜单里可以回访老街，回奶奶那里继续问；回来时仍接着原来的行程。', condition: lifeUnlocked, complete: { kind: 'quest', id: 'noon', status: 'active' } },
  ],
};

export const recipes: Recipe[] = [
  { id: 'xu-tofu-rice', title: '许叔的豆腐烧菜饭', subtitle: '夜饭小馆 · 两份饭分开核对', asset: 'night-bowl', condition: { kind: 'flag', id: 'night-played' },
    ingredients: ['米饭', '豆腐烧菜', '辣酱，按吃法另放'], steps: ['豆腐切块，入锅煎到表面微黄。', '添少许水与调味汁，烧到豆腐入味。', '盛米饭，浇上豆腐烧菜。先问辣酱放哪里。', '堂食用浅碗；留餐确认时间后再盛，辣酱另杯，筷子放盒外。'] },
  { id: 'osmanthus-rice', title: '桂花米酒', subtitle: '奶奶的旧方 · 先誊清这一页', asset: 'recipe-rice', condition: { kind: 'clue', id: 'book' },
    ingredients: ['甜酒酿两大勺', '清水一小碗', '干桂花一小撮', '糖，尝过再添'],
    steps: ['清水入小锅，煮到锅边冒起细泡。', '拨散酒酿，连同酒汁放进去，轻轻搅开。', '再滚一会儿，尝尝甜味。喜欢甜的再添一点糖。', '关火后撒桂花，盛进小碗。趁热喝，别急。'] },
  { id: 'chen-buns', title: '陈家的第一笼', subtitle: '陈家包子铺 · 跟着做过一回', asset: 'prop-buns', condition: { kind: 'flag', id: 'morning-played' },
    ingredients: ['发好的面团', '鲜肉、青菜或豆沙馅', '蒸笼与笼布'], steps: ['按客人要的馅和数量分好。', '包好的面坯留些间隔，放进笼里。', '上汽后留意火候。取出时避开迎面的蒸汽。'] },
  { id: 'qin-noodles', title: '琴记的一碗面', subtitle: '琴记面馆 · 把份量也记清楚', asset: 'noodle-bowl', condition: { kind: 'flag', id: 'noon-played' },
    ingredients: ['现做的面', '汤底', '葱花与调味料'], steps: ['先问清份量与忌口，再把小票写齐。', '按锅里实际能做的量下单。', '面熟后装碗，核对小票，再加需要的调料。'] },
];

export const collection: CollectionEntry[] = [
  { id: 'family-photo', title: '木框里的合照', asset: 'prop-photo', condition: { kind: 'clue', id: 'family-photo' },
    description: '第一章里翻过的旧照片。木框角上补过一点胶，背板可以重新细看。',
    detail: '背板边缘压着另一行小字：“第一次来长明巷，认门认了三回。”笔色比下面的日期浅。',
    study: { id: 'collection-photo-note', label: '记住背板的小字', effects: [{ kind: 'clue', id: 'photo-margin' }], feedback: '这句话还没问过奶奶。回去时可以提起。' } },
  { id: 'old-book', title: '补过书脊的百味录', asset: 'arrival-book', condition: { kind: 'clue', id: 'book' },
    description: '祖母交给你的旧本子。除了翻看配方，也可以看看它怎样被修补和使用。', detail: '棉线有深有浅，书脊显然补过不止一次。靠前的纸页油印多，后头夹着不同大小的便条。' },
  { id: 'home-letter', title: '回家前的那封信', asset: 'arrival-letter', condition: { kind: 'clue', id: 'invitation' },
    description: '你从外地带回的信，票根还夹在里面。', detail: '“住几天都行”写在信纸最后，字比正文小。奶奶寄信时，没有问你的返程日期。' },
  { id: 'home-calendar', title: '奶奶的旧日历', asset: 'prop-calendar', condition: { kind: 'clue', id: 'calendar' },
    description: '翻到今天时记住的那本日历。纸页很薄，常翻的位置已经卷边。', detail: '取眼镜、买桂花和你回家的日期，都被她挤在一个格子里。几处小勾用了不同颜色的笔，似乎每办好一件事就会回来添一下。' },
  { id: 'home-tea', title: '挪到手边的茶杯', asset: 'arrival-cup', condition: { kind: 'flag', id: 'tea-offered' },
    description: '第一章里亲手挪过的茶杯。杯沿有个小缺口，茶壶留在旁边的茶盘上。', detail: '杯口的缺处并不正对着喝茶的一面。你记得奶奶从前倒好茶，总要转一下杯子，才往人面前推。' },
  { id: 'my-phone', title: '屏幕里的旧备忘', asset: 'arrival-phone', condition: { kind: 'clue', id: 'job-gap' },
    description: '回家后仍总想看一眼的手机。简历之外，里面也有上班那几年留下的东西。', detail: '往前翻，有一条发第一份工资时写的便签：“今晚吃顿好的。”后面记着一家小馆的名字。',
    study: { id: 'collection-first-pay', label: '读读那条旧便签', effects: [{ kind: 'clue', id: 'my-first-pay' }], feedback: '你想起那天和朋友坐到店家收桌子，才一起往回走。' } },
];
