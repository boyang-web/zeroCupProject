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
    objectHints: { kind: 'any', conditions: ['book', 'family-photo', 'invitation', 'calendar', 'job-gap'].map(id => ({ kind: 'clue', id })) },
    chapterTrack: { kind: 'flag', id: 'arrival-packed' },
    lifeNotes: lifeUnlocked,
    revisit: revisitUnlocked,
    collection: { kind: 'any', conditions: (['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest', id: 'noon', status })) },
  },
  guides: [
    { id: 'noon-window', chapterId: 'noon', title: '先看看窗边这碗', text: '田姨坐在窗边，面却一直没动。先看看碗，再听听三个人各自在赶什么。这一章按下锅顺序计算等候，读字和看物件不会扣时间。', target: 'untouched-bowl', complete: { kind: 'any', conditions: [{ kind: 'flag', id: 'noon-listened' }, { kind: 'clue', id: 'wrong-bowl' }] } },
    { id: 'arrival-look', chapterId: 'arrival', title: '先拿起手机看看', text: '箭头指着进门低柜上的手机。点一下，镜头会靠近它；拿起后，再点屏幕读备忘。读字时可以点“显示本段”，关闭窗口会回到全景。', target: 'phone', complete: { kind: 'any', conditions: [{ kind: 'flag', id: 'arrival-greeted' }, { kind: 'flag', id: 'tea-offered' }, ...['book', 'family-photo', 'invitation', 'calendar', 'job-gap'].map(id => ({ kind: 'clue' as const, id }))] } },
    { id: 'arrival-talk', chapterId: 'arrival', title: '和奶奶说说话', text: '点箭头指向的奶奶，坐近些交谈。她说完后，回答会逐项出现；也可以先点“显示本段”。看过的物件，有时会多出一句能问的话。', target: 'grandma', complete: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-instructions' }] } },
    { id: 'arrival-read', chapterId: 'arrival', title: '把旧书翻开', text: '《百味录》在窗下的写字台上。点旧书，再点封面翻开。物件上的字也会慢慢显出来；读完后，可以把做法誊到食谱页。', target: 'book', complete: { kind: 'clue', id: 'book' } },
    { id: 'arrival-pack', chapterId: 'arrival', title: '理好走访的书签', text: '再打开旧书，读完说明后点“整理走访书签”，按营业时间夹好三张书签。右上角的《百味录》可以随时翻看已经记下的食谱。', target: 'book', complete: { kind: 'flag', id: 'arrival-packed' } },
    { id: 'arrival-leave', chapterId: 'arrival', title: '带上书，出门吧', text: '书和钥匙都装好了。点箭头指着的出门按钮，去陈家包子铺；离开前，也可以再看看屋里的物件。进度会自动保存。', control: 'departure', condition: { kind: 'flag', id: 'arrival-packed' }, complete: { kind: 'quest', id: 'morning', status: 'active' } },
    { id: 'morning-return-home', chapterId: 'morning', title: '想回家，随时都能回', text: '从现在起，右下角可以“回奶奶家”。陈家还没忙完也能回去看看物件、和奶奶聊聊；再回来时，仍从刚才的房间继续。先前做过的事会保留。', control: 'home', condition: revisitUnlocked, complete: { kind: 'flag', id: 'morning-listened' } },
    { id: 'life-and-revisit', chapterId: 'morning', title: '把听到的事写进书里', text: '《百味录》多了“人间百味”。刚才听到的话，现在也能翻开这本书再读。想起还有什么没问，依然可以回奶奶家，回来后接着眼下的行程。', control: 'journal', condition: lifeUnlocked, complete: { kind: 'quest', id: 'noon', status: 'active' } },
  ],
};

export const recipes: Recipe[] = [
  { id: 'osmanthus-rice', title: '桂花米酒', subtitle: '奶奶的旧方 · 先誊清这一页', asset: 'recipe-rice', condition: { kind: 'clue', id: 'book' },
    note: "糖这一句有两种笔迹。奶奶原先记了用量，后来被划去，旁边添了“尝过再放”。她不许我把划掉的地方涂黑，说留着，省得下回又问到底几勺。桂花在关火后撒，我另起一行。",
    ingredients: ['甜酒酿两大勺', '清水一小碗', '干桂花一小撮', '糖，尝过再添'],
    steps: ['清水入小锅，煮到锅边冒起细泡。', '拨散酒酿，连同酒汁放进去，轻轻搅开。', '再滚一会儿，尝尝甜味。喜欢甜的再添一点糖。', '关火后撒桂花，盛进小碗。趁热喝，别急。'] },
  { id: 'chen-buns', title: '陈家的第一笼', subtitle: '陈家包子铺 · 跟着做过一回', asset: 'prop-buns', condition: { kind: 'flag', id: 'morning-played' },
    note: "我在“鲜肉”旁边添了一只碗。陈伯问画什么，我说给你留的，别装纸袋。他说自己不会忘，随后又看了一眼画，没让我划掉。分馅时要把这只也算上。",
    ingredients: ['发好的面团', '鲜肉、青菜或豆沙馅', '蒸笼与笼布'], steps: ['按客人要的馅和数量分好。', '包好的面坯留些间隔，放进笼里。', '上汽后留意火候。取出时避开迎面的蒸汽。'] },
  { id: 'qin-noodles', title: '琴记的一碗面', subtitle: '琴记面馆 · 把份量也记清楚', asset: 'noodle-bowl', condition: { kind: 'flag', id: 'noon-played' },
    note: "琴姐先看了我写的份量，又问葱是不是已经记了。她这回亲眼看着我添完，才去收面。我把“清汤”与“煮面”写成两行，免得拿回去自己先混。",
    ingredients: ['现擀的面，整份与半份分开', '另锅温着的清汤', '盐与圆肚子瓶里的老醋', '葱花，先问过再添'], steps: ['清汤先温在一旁，尝过再补盐；面另起水煮。', '面下沸水后轻轻拨散，照单上的份量煮熟。', '捞进碗里，再兑清汤，不把整锅面汤混进来。', '核对半份与忌口，葱花最后问过再撒。醋放桌边，喝一口再添。'] },
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
