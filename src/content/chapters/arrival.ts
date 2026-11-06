import type { Chapter, Dialogue, DialogueNode, MinigameDefinition } from '../../core/contracts.ts';
import { lifeUnlocked } from '../progression.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', subtitle: '行李还没拆，茶已经温好了。', time: '清晨 · 奶奶的小院',
  description: '上份工作结束了。你回到长明巷，暂时没有买返程票。昨晚放在门边的行李还没拆，奶奶已经在院子里摆好了茶。',
  asset: 'courtyard', position: 'center', tint: 'dawn',
  objective: '陪奶奶坐一会儿，看看她搁了许久的旧书。',
  revisitDescription: '奶奶的小院。带上新记下的事，回去聊聊。',
  foreground: { clipPath: 'polygon(17% 69%, 82% 69%, 92% 88%, 91% 100%, 5% 100%, 5% 88%)', z: 5 },
  variants: [
    { condition: { kind: 'any', conditions: ['active', 'completed', 'failed'].map(status => ({ kind: 'quest' as const, id: 'night', status: status as 'active' | 'completed' | 'failed' })) }, asset: 'courtyard-evening', time: '入夜 · 回到奶奶的小院', tint: 'night', description: '门里亮着灯。书还放在桌上，奶奶听见脚步，抬头朝门口看了看。' },
    { condition: lifeUnlocked, time: '回访 · 奶奶的小院', description: '你又回到院子。茶壶还在桌边，这回有些话可以接着问了。' },
  ],
  questId: 'commission', metricIds: ['attention'], next: 'morning', exitLabel: '带上书，去巷口',
  exit: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'clue', id: 'book' }, { kind: 'flag', id: 'arrival-packed' }] },
  exitHint: '聊清委托后，翻开桌上的书，整理三张走访书签。',
  beats: [
    { label: '听一听委托', condition: { kind: 'flag', id: 'entrusted' } },
    { label: '翻开旧食录', condition: { kind: 'clue', id: 'book' } },
    { label: '整理走访书签', condition: { kind: 'flag', id: 'arrival-packed' } },
  ],
  hotspots: [
    { id: 'grandma', label: '奶奶', x: 60, y: 76, icon: 'talk', sprite: { asset: 'grandmother', width: 18, height: 46, z: 4 }, interaction: { kind: 'dialogue', dialogueId: 'commission' }, completed: { kind: 'flag', id: 'entrusted' } },
    { id: 'book', label: '百味录', x: 52, y: 82, icon: 'book', sprite: { asset: 'prop-book', width: 9, height: 10, z: 9 }, variants: [{ condition: { kind: 'flag', id: 'arrival-packed' }, asset: 'prop-ledger' }], completed: { kind: 'clue', id: 'book' }, interaction: {
      kind: 'inspect', manipulation: 'book', text: '封皮磨得发白，书脊用棉线补过。翻开封面，第一页还留着一张旧方子。',
      exhibit: { kind: 'book', kicker: '奶奶的旧食谱', title: '百味录', lines: ['桂花米酒 · 奶奶的旧方', '清水煮开，酒酿拨散，最后撒桂花。', '“糖先少放，尝了再说。”'], caption: '先把这一页誊清。其余的，等走到店里再问。' },
      action: { id: 'inspect-book', label: '翻开书页', effects: [{ kind: 'clue', id: 'book' }] }, activityId: 'arrival-route',
    } },
    { id: 'photo', label: '旧合照', x: 79, y: 79, icon: 'look', sprite: { asset: 'prop-photo', width: 7, height: 11, z: 8 }, completed: { kind: 'clue', id: 'family-photo' }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: '你挤在大人中间，袖口卷得高高的。相纸晒淡了一角。把相框翻过来，背面还有字。',
      exhibit: { kind: 'photo', kicker: '照片背面 · 祖母的字', title: '那年，第一笼包子', lines: ['“小满六岁。闹着要帮忙，', '最后帮着吃了三个。”'], caption: '你已经很久没听见有人叫你“小满”了。' },
      action: { id: 'read-family-photo', label: '记住这张照片', effects: [{ kind: 'clue', id: 'family-photo' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'letter', label: '信封', x: 68, y: 88, icon: 'letter', sprite: { asset: 'prop-envelope', width: 9, height: 7, z: 10 }, completed: { kind: 'clue', id: 'invitation' }, interaction: {
      kind: 'inspect', manipulation: 'unfold', text: '回家前收到的信。信纸折了三折，昨晚的到站票根也夹在里面。',
      exhibit: { kind: 'letter', kicker: '回家前寄来 · 已拆封', title: '小满：', lines: ['你说工作的事，我知道了。', '想回来就回来，屋子给你留着。', '那本旧书还空着几页，正好想找你帮忙。', '不用带东西，住几天都行。'], caption: '最后一行，比前面的字小一点。' },
      action: { id: 'read-invitation', label: '收好这封信', effects: [{ kind: 'clue', id: 'invitation' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'tea', label: '温茶', x: 37, y: 83, icon: 'tea', sprite: { asset: 'prop-tea', width: 12, height: 14, z: 9 }, variants: [{ condition: { kind: 'flag', id: 'tea-offered' }, x: 61, y: 79 }], drag: { actionId: 'offer-tea', target: { x: 55, y: 71, width: 15, height: 14 }, hint: '拖到奶奶手边' }, completed: { kind: 'flag', id: 'tea-offered' }, interaction: {
      kind: 'inspect', text: '杯沿缺了一点，缺口朝里。水已经不烫，杯底在木桌上留了半圈浅印。',
      options: [{ id: 'offer-tea', label: '把茶往祖母手边挪一点', effects: [{ kind: 'flag', id: 'tea-offered' }, { kind: 'metric', id: 'attention', amount: 1 }], feedback: '祖母接过杯子：“你倒知道先管我了。自己也喝，别光捂手。”' }],
    } },
    { id: 'calendar', label: '旧日历', x: 29, y: 48, icon: 'look', sprite: { asset: 'prop-calendar', width: 5, height: 13, z: 2 }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: '纸页被风掀起一点。把它翻稳，能看见奶奶记在背面的几件事。',
      exhibit: { kind: 'note', kicker: '日历页角', title: '这几天', lines: ['取眼镜。', '买桂花。', '小满回家。'], caption: '你的名字旁边，她画了一个圈。' },
      action: { id: 'read-calendar', label: '看见她的小心思', effects: [{ kind: 'clue', id: 'calendar' }] },
    } },
    { id: 'phone', label: '手机', x: 26, y: 83, icon: 'look', sprite: { asset: 'phone-stand', width: 5, height: 12, z: 9 }, completed: { kind: 'clue', id: 'job-gap' }, interaction: {
      kind: 'inspect', manipulation: 'phone', text: '手机没有响。你还是顺手碰了一下屏幕。',
      exhibit: { kind: 'note', kicker: '草稿 · 尚未发出', title: '个人简历', lines: ['上一份工作：已结束', '下一份工作：还没有着落', '返程日期：暂未决定'], caption: '昨晚回家时，奶奶先让你吃了饭。' },
      action: { id: 'arrival-read-phone', label: '看看屏幕', effects: [{ kind: 'clue', id: 'job-gap' }] },
    } },
  ],
};

const nodes: DialogueNode[] = [
  { id: 'welcome', speaker: '奶奶', direction: '她停下手里的活，把对面的椅子往外挪了挪。', text: '醒啦？昨晚进门轻手轻脚的，我还当是院子里的猫。\n\n先坐。今天不用赶车，茶还是温的。肚子饿不饿？', choices: [
    { id: 'arrival-ate', label: '吃了。就是没你这里的香。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
    { id: 'arrival-hungry', label: '还没。想着留点肚子回来。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
  ] },
  { id: 'home', speaker: '奶奶', direction: '她把你脱在门口的外套拎上椅背。', text: '一会儿去陈家吃点东西。工作的事慢慢找，简历也得吃完饭再看。\n\n桌上那本书，还认得吗？', choices: [
    { id: 'arrival-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'request', speaker: '奶奶', direction: '她摸了摸书脊上的棉线。', text: '以前买菜，吃到好的就问个做法，回来记两行。后来这腿走远了就酸，去得少了。几家店又换了人，我总说改天去看看。\n\n你这几天替我走一趟，好不好？问问现在怎么做，也看看老熟人还在不在。', choices: [
    { id: 'arrival-why-book', label: '到店里要问些什么？', next: 'people', effects: [] },
    { id: 'arrival-why-me', label: '为什么是我？', next: 'why-you', effects: [] },
    { id: 'arrival-photo-question', label: '照片里，陈伯那时也在。', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看过墙上的旧合照，才想得起这件事。', next: 'photo-memory', effects: [] },
    { id: 'arrival-ready', label: '好。我该怎么开始？', next: 'approach', effects: [] },
  ] },
  { id: 'people', speaker: '祖母', text: '谁掌勺，老客还来不来，都问问。配方人家肯讲就记，不肯讲，你也别追着问。\n\n陈伯以前写“盐少许”，你非要问几勺，把人问得满院子找勺子。', choices: [{ id: 'arrival-understand-book', label: '这回我少问两句盐。', next: 'request', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
  { id: 'why-you', speaker: '奶奶', text: '我是真走不了从前那么远。你字又写得大，省得我拿着放大镜找。\n\n也是想让你出去吃顿饭。天天坐在屋里，饭凉了都不知道。回来把见到的人跟我说说，我也想听。', choices: [{ id: 'arrival-admit', label: '好。我出去走走。', next: 'request', effects: [{ kind: 'flag', id: 'phone-away' }] }] },
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
  { id: 'grandma-later', speaker: '奶奶', direction: '她把旧书往桌中间挪了一点，给你留出坐的位置。', text: '回来啦？坐，茶壶里还有。\n\n书带回来了，我正好找着一张旧纸。原来夹在后头，难怪前几天怎么翻都找不到。', choices: [
    { id: 'grandma-ask-first-page', label: '你最早是什么时候开始记做法的？', next: 'grandma-first-story', effects: [] },
    { id: 'grandma-ask-photo-margin', label: '照片背面说，你刚来时认门认了三回？', next: 'grandma-new-neighbor', condition: { kind: 'clue', id: 'photo-margin' }, unavailable: '重新细看那张照片，也许能找到这句话。', effects: [] },
    { id: 'grandma-return-bye', label: '我坐一会儿，等下还得出去。', effects: [] },
  ] },
  { id: 'grandma-first-story', speaker: '奶奶', direction: '她笑了一下，指着米酒那一页。', text: '刚搬来那阵，灶台比这桌子还窄。我以为米酒倒进去煮就行，结果糊了底。\n\n隔壁大姐闻着味过来，说你这锅里是熬糖还是烧柴？她站在旁边教了一回，我才拿本子记。后来学什么都写两句，省得老去敲她的门。\n\n她搬走好些年了。你看，这个“尝过再放糖”，还是她写的。', choices: [{ id: 'grandma-record-first-story', label: '把这件事也记在米酒那页旁边。', effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  { id: 'grandma-new-neighbor', speaker: '奶奶', text: '可不是。那会儿门长得像，我拎着菜，差点走进人家屋里。\n\n后来隔壁大姐在我门边摆了盆花，说你认这盆，总不会再走错了。你看门口那几个盆，最早就是这么摆起来的。', choices: [{ id: 'grandma-photo-story-close', label: '原来门口的花盆还有这段事。', effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
];
export const commission: Dialogue = {
  id: 'commission', entry: 'welcome', entries: [
    { condition: lifeUnlocked, nodeId: 'grandma-later' },
    { condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'not', condition: { kind: 'flag', id: 'arrival-instructions' } }] }, nodeId: 'instructions' },
    { condition: { kind: 'flag', id: 'entrusted' }, nodeId: 'followup' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'flag', id: 'arrival-greeted' }, nodeId: 'home' },
  ], nodes: nodes.map(n => ({ portrait: 'grandmother', ...n, speaker: n.speaker === '祖母' ? '奶奶' : n.speaker })),
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
