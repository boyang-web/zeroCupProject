import type { Chapter, Dialogue, DialogueNode, MinigameDefinition } from '../../core/contracts.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', subtitle: '祖母把茶搁在窗下。', time: '清晨 07:12 · 祖母的小院',
  description: '昨晚到家时，巷口已经熄了灯。今早醒来，桌上有温茶，也有一本祖母等你来翻的旧书。',
  asset: 'courtyard', position: 'center', tint: 'dawn',
  objective: '听听祖母的委托，把三家小馆的书签整理好。',
  questId: 'commission', metricIds: ['attention'], next: 'morning', exitLabel: '带上书，去巷口',
  exit: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'clue', id: 'book' }, { kind: 'flag', id: 'arrival-packed' }] },
  exitHint: '聊清委托后，翻开桌上的书，整理三张走访书签。',
  beats: [
    { label: '听一听委托', condition: { kind: 'flag', id: 'entrusted' } },
    { label: '翻开旧食录', condition: { kind: 'clue', id: 'book' } },
    { label: '整理走访书签', condition: { kind: 'flag', id: 'arrival-packed' } },
  ],
  hotspots: [
    { id: 'grandma', label: '祖母', x: 60, y: 70, icon: 'talk', sprite: { asset: 'grandmother', width: 18, height: 42 }, interaction: { kind: 'dialogue', dialogueId: 'commission' }, completed: { kind: 'flag', id: 'entrusted' } },
    { id: 'book', label: '百味录', x: 53, y: 83, icon: 'book', sprite: { asset: 'prop-book', width: 14, height: 13 }, completed: { kind: 'clue', id: 'book' }, interaction: {
      kind: 'inspect', text: '封皮边缘磨得发白，书脊用棉线补过。书里记着做法，也记着赊账、托人捎话和谁家孩子不吃葱。',
      exhibit: { kind: 'book', kicker: '祖母的旧书', title: '百味录', lines: ['陈家包子铺 · 早市', '琴记面馆 · 午间', '夜里食堂 · 深夜'], caption: '几张空页被书签隔开，纸边还很齐。' },
      action: { id: 'inspect-book', label: '翻开书页', effects: [{ kind: 'clue', id: 'book' }] }, activityId: 'arrival-route',
    } },
    { id: 'photo', label: '旧合照', x: 21, y: 38, icon: 'look', sprite: { asset: 'prop-photo', width: 7, height: 16 }, completed: { kind: 'clue', id: 'family-photo' }, interaction: {
      kind: 'inspect', text: '你站在小凳子上，袖口卷过了胳膊肘。陈伯扶着笼屉，祖母在旁边笑。相片右下角晒得发白，少了你半只鞋。',
      exhibit: { kind: 'photo', kicker: '照片背面 · 祖母的字', title: '那年，第一笼包子', lines: ['“小满六岁。闹着要帮忙，', '最后帮着吃了三个。”'], caption: '你已经很久没听见有人叫你“小满”了。' },
      action: { id: 'read-family-photo', label: '记住这张照片', effects: [{ kind: 'clue', id: 'family-photo' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'letter', label: '信封', x: 62, y: 76, icon: 'letter', sprite: { asset: 'prop-envelope', width: 11, height: 9 }, completed: { kind: 'clue', id: 'invitation' }, interaction: {
      kind: 'inspect', text: '邮戳是十天前。信纸折了三折，你昨晚的到站票根也夹在里面，边角已经发软。',
      exhibit: { kind: 'letter', kicker: '十天前寄出 · 已拆封', title: '小满：', lines: ['桂花开了，回来吃顿饭。', '那本旧书还空着几页，想找你帮忙。', '不用带东西。上次的牛奶还没喝完。'], caption: '信封角落另补了一句：人回来就行。' },
      action: { id: 'read-invitation', label: '收好这封信', effects: [{ kind: 'clue', id: 'invitation' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'tea', label: '温茶', x: 34, y: 78, icon: 'tea', sprite: { asset: 'prop-tea', width: 15, height: 20 }, variants: [{ condition: { kind: 'flag', id: 'tea-offered' }, x: 58, y: 75 }], completed: { kind: 'flag', id: 'tea-offered' }, interaction: {
      kind: 'inspect', text: '杯沿缺了一点，缺口朝里。水已经不烫，杯底在木桌上留了半圈浅印。',
      options: [{ id: 'offer-tea', label: '把茶往祖母手边挪一点', effects: [{ kind: 'flag', id: 'tea-offered' }, { kind: 'metric', id: 'attention', amount: 1 }], feedback: '祖母接过杯子：“你倒知道先管我了。自己也喝，别光捂手。”' }],
    } },
    { id: 'calendar', label: '旧日历', x: 31, y: 50, icon: 'look', sprite: { asset: 'prop-calendar', width: 6, height: 17 }, interaction: {
      kind: 'inspect', text: '今天被画了个圈，旁边写着“接小满”。下面还有一行小字：“别问工作。”字迹被描过一遍。',
      exhibit: { kind: 'note', kicker: '日历页角', title: '今日记事', lines: ['接小满。', '烧水。买菜。', '别问工作。'], caption: '最后一条，祖母还给自己画了个勾。' },
      action: { id: 'read-calendar', label: '看见她的小心思', effects: [{ kind: 'clue', id: 'calendar' }] },
    } },
  ],
};

const nodes: DialogueNode[] = [
  { id: 'welcome', speaker: '祖母', direction: '她把茶往你面前推了推。', text: '醒啦？昨晚进门轻手轻脚的，我还当是院子里的猫。\n\n鞋放门边。茶还温着，一路上吃东西没有？', choices: [
    { id: 'arrival-ate', label: '吃了。就是没你这里的香。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
    { id: 'arrival-hungry', label: '还没。想着留点肚子回来。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
  ] },
  { id: 'home', speaker: '祖母', direction: '她把你脱在门口的外套拎上椅背。', text: '没吃就一会儿去陈家。别光喝茶，空着肚子。\n\n桌上那本书，还认得吗？', choices: [
    { id: 'arrival-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'request', speaker: '祖母', direction: '她摸了摸书脊上的棉线。', text: '买菜的时候记的。问来个做法，有空就写两行，后来连赊的葱都记上了。\n\n现在小字看着费劲。这几家又添了新人，我还照从前写，怕写错。你替我走一趟，好不好？', choices: [
    { id: 'arrival-why-book', label: '到店里要问些什么？', next: 'people', effects: [] },
    { id: 'arrival-why-me', label: '为什么是我？', next: 'why-you', effects: [] },
    { id: 'arrival-photo-question', label: '照片里，陈伯那时也在。', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看过墙上的旧合照，才想得起这件事。', next: 'photo-memory', effects: [] },
    { id: 'arrival-ready', label: '好。我该怎么开始？', next: 'approach', effects: [] },
  ] },
  { id: 'people', speaker: '祖母', text: '谁掌勺，老客还来不来，都问问。配方人家肯讲就记，不肯讲，你也别追着问。\n\n陈伯以前写“盐少许”，你非要问几勺，把人问得满院子找勺子。', choices: [{ id: 'arrival-understand-book', label: '这回我少问两句盐。', next: 'request', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
  { id: 'why-you', speaker: '祖母', text: '你字写得大，我看着不费劲。\n\n……也是想让你出去走走。你每回说回来，进了门又抱着手机忙。巷口的人问起你，我都快只能给他们看头像了。', choices: [{ id: 'arrival-admit', label: '我这次把手机先放口袋里。', next: 'request', effects: [{ kind: 'flag', id: 'phone-away' }] }] },
  { id: 'photo-memory', speaker: '祖母', text: '你六岁那年，说要把包子做成月亮。陈伯怕你烫着，一早没怎么顾上卖。\n\n你走之后，他也问过几回。后来不问了，只说孩子忙。', choices: [{ id: 'arrival-photo-reply', label: '我以为大家早不记得了。', next: 'request', effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'approach', speaker: '祖母', direction: '她把三张书签拨到你这边。', text: '陈家的包子，琴记的面。还有一家晚上才开的，你从前没去过。\n\n别一天都赶着跑。晚上回来，给我讲讲。', choices: [
    { id: 'accept-commission', onceKey: 'arrival-commission', label: '好，我多坐一会儿，回来慢慢讲。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-slow' }, { kind: 'item', id: 'small-key', amount: 1 }] },
    { id: 'accept-brief', onceKey: 'arrival-commission', label: '我先照书上这几样去找。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-recording' }, { kind: 'item', id: 'small-key', amount: 1 }] },
  ] },
  { id: 'instructions', speaker: '祖母', text: '行。先把书签理一理，别跑到人家收摊才想起来吃早饭。\n\n这把备用钥匙是陈伯留的，你替我还给他。要借柜里的保温袋，也记得先打声招呼。晚上回来，给我念念。夜里看字更费劲。', choices: [{ id: 'arrival-set-off', label: '知道了。晚上见。', effects: [{ kind: 'flag', id: 'arrival-instructions' }] }] },
  { id: 'followup', speaker: '祖母', text: '还没出门呢？书签都夹在书里。先去陈家，笼屉一空，陈伯可不会给你凭空变包子。', choices: [
    { id: 'arrival-followup-photo', label: '再讲讲我小时候的事。', next: 'remember-again', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看看那张合照，或许能想起什么。', effects: [] },
    { id: 'arrival-followup-tea', label: '茶放你手边了。', condition: { kind: 'flag', id: 'tea-offered' }, unavailable: '桌上的茶还温着。', next: 'tea-reply', effects: [] },
    { id: 'arrival-followup-bye', label: '这就走。你也歇一会儿。', effects: [] },
  ] },
  { id: 'remember-again', speaker: '祖母', direction: '她眯起眼，看了看墙上的照片。', text: '你那时非要把每家店都吃一遍，还拿红笔在我的书上画勾。\n\n陈伯说教你捏包子，你嫌起早，睡到人家收摊才去。今天可别又睡过去。', choices: [{ id: 'arrival-remember-bye', label: '这回已经醒了。', effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'tea-reply', speaker: '祖母', direction: '她捧住杯子，吹了吹其实已经不烫的茶。', text: '看见啦。你小时候都是我追着你喝水，现在倒换过来了。\n\n也别忙着照顾我。你自己，记得吃口热的。', choices: [{ id: 'arrival-tea-reply', label: '好，我也记得。', effects: [] }] },
];
export const commission: Dialogue = {
  id: 'commission', entry: 'welcome', entries: [
    { condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'not', condition: { kind: 'flag', id: 'arrival-instructions' } }] }, nodeId: 'instructions' },
    { condition: { kind: 'flag', id: 'entrusted' }, nodeId: 'followup' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'flag', id: 'arrival-greeted' }, nodeId: 'home' },
  ], nodes: nodes.map(n => ({ portrait: 'grandmother', ...n })),
};
export const arrivalGame: MinigameDefinition = {
  id: 'arrival-route', chapterId: 'arrival', module: 'itinerary', title: '三张书签',
  description: '三张书签夹乱了。根据上面的营业时间，把它们放回相应的页间；点选书签，再点空位。', target: 100,
  condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-instructions' }, { kind: 'clue', id: 'book' }] },
  unavailable: '先和祖母聊清委托，再来整理走访书签。',
  itinerary: {
    slips: [
      { id: 'night-slip', title: '夜里食堂', detail: '夜班的人回来，灯才亮。21:00 后留餐。', slot: 'evening' },
      { id: 'morning-slip', title: '陈家包子铺', detail: '第一笼 07:30，卖完就收。别睡懒觉。', slot: 'morning' },
      { id: 'noon-slip', title: '琴记面馆', detail: '午间 11:30 开灶，老客靠窗坐。', slot: 'noon' },
    ],
    slots: [{ id: 'morning', label: '清晨', time: '第一笼热气' }, { id: 'noon', label: '午间', time: '一碗热面' }, { id: 'evening', label: '深夜', time: '最后一盏灯' }],
  },
  reward: { id: 'arrival-route-reward', label: '出门', feedback: '书和钥匙装好了。祖母在身后叫你：“陈伯要是问，说昨天那碗汤不咸，正好。”', effects: [{ kind: 'flag', id: 'arrival-packed' }, { kind: 'item', id: 'baiwei-book', amount: 1 }, { kind: 'quest', id: 'commission', status: 'completed' }] },
};
