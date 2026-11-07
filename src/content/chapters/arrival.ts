import type { Chapter, Dialogue, MinigameDefinition } from '../../core/contracts.ts';
import { lifeUnlocked, revisitUnlocked } from '../progression.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { arrivalScripts } from '../scripts/arrival.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', subtitle: '行李还没拆，茶已经温好了。', time: '清晨 · 奶奶的老宅',
  description: '上份工作结束了。你回到长明巷，暂时没有买返程票。行李还放在进门的低柜旁。奶奶靠窗坐着，小茶几上倒好了茶。',
  asset: 'arrival-home', position: 'center', tint: 'dawn',
  objective: '陪奶奶坐一会儿，看看她搁了许久的旧书。',
  revisitDescription: '奶奶的老宅。带上新记下的事，回去聊聊。',
  camera: { views: [
    { id: 'entry', label: '进门的低柜', x: 11, y: 68, zoom: 1.7 },
    { id: 'cabinet', label: '斗柜边', x: 22, y: 43, zoom: 1.8 },
    { id: 'desk', label: '窗下的写字台', x: 46, y: 47, zoom: 1.8 },
    { id: 'grandma', label: '奶奶身旁', x: 77, y: 44, zoom: 1.45 },
    { id: 'tea', label: '座旁的小茶几', x: 63.5, y: 59.5, zoom: 1.7 },
    { id: 'wall', label: '墙上的日历', x: 22.6, y: 27, zoom: 1.8 },
  ] },
  variants: [
    { condition: { kind: 'any', conditions: ['active', 'completed', 'failed'].map(status => ({ kind: 'quest' as const, id: 'night', status: status as 'active' | 'completed' | 'failed' })) }, asset: 'arrival-home-evening', time: '入夜 · 回到奶奶的老宅', tint: 'night', description: '窗下的台灯亮着。奶奶听见门口的脚步声，从藤椅上抬起头。' },
    { condition: revisitUnlocked, time: '回访 · 奶奶的老宅', description: '你把带回的书放到写字台上。奶奶还坐在窗边，这回有些话可以接着问了。' },
  ],
  questId: 'commission', metricIds: ['attention'], next: 'morning', exitLabel: '带上书，去巷口',
  exit: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'clue', id: 'book' }, { kind: 'flag', id: 'arrival-packed' }] },
  exitHint: '聊清委托后，翻开窗下写字台上的书，整理三张走访书签。',
  beats: [
    { label: '听一听委托', condition: { kind: 'flag', id: 'entrusted' } },
    { label: '翻开旧食录', condition: { kind: 'clue', id: 'book' } },
    { label: '整理走访书签', condition: { kind: 'flag', id: 'arrival-packed' } },
  ],
  hotspots: [
    { id: 'grandma', label: '奶奶', cameraView: 'grandma', x: 77, y: 95, icon: 'talk', sprite: { asset: 'grandmother-home', width: 28, height: 71, z: 6 }, interaction: { kind: 'dialogue', dialogueId: 'commission' }, completed: { kind: 'flag', id: 'entrusted' } },
    { id: 'book', label: '百味录', cameraView: 'desk', x: 46, y: 48.2, icon: 'book', sprite: { asset: 'arrival-book', width: 6.3, height: 4, z: 7 }, condition: { kind: 'any', conditions: [{ kind: 'not', condition: { kind: 'flag', id: 'arrival-packed' } }, revisitUnlocked] }, completed: { kind: 'clue', id: 'book' }, interaction: {
      kind: 'inspect', manipulation: 'book', journalLink: true, text: "封面没有书名。你翻开，扉页上才露出“百味录”三个字，旁边还有你小时候画的一只碗。碗底添了两条腿，不知当时想让它跑到哪里去。\n\n桂花米酒那页夹着购物单。正面是鸡蛋、青菜，反面记了水和酒酿的用量；其中一句被圈住，又有一支细笔在旁边添字。往后翻，两张不同大小的纸险些一起滑出来。奶奶伸手接住，认了半天，把其中一张倒过来：“这张才是正的。”\n\n后头的空白页很平，和常翻的前半本合不到一处。你试着将它摊开，书脊又缓缓拱回来。得找件干净东西压着，才能腾出手写字。",
      exhibit: { kind: 'book', kicker: '奶奶的旧食谱', title: '百味录', lines: ['桂花米酒 · 奶奶的旧方', '清水煮开，酒酿拨散，最后撒桂花。', '“糖先少放，尝了再说。”'], caption: '先把这一页誊清。其余的，等走到店里再问。' },
      action: { id: 'inspect-book', label: '翻开书页', effects: [{ kind: 'clue', id: 'book' }] }, activityId: 'arrival-route',
    } },
    { id: 'photo', label: '旧合照', cameraView: 'cabinet', x: 21.6, y: 44, icon: 'look', sprite: { asset: 'prop-photo', width: 6.5, height: 8.7, z: 4 }, completed: { kind: 'clue', id: 'family-photo' }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: "照片里的你垫着一只凳子，手伸到案板上，袖口卷得一边高、一边低。陈伯在后面扶凳背；奶奶偏出半个肩，手里却提着你的外套。\n\n你记得自己做成过一只月亮形的包子。仔细看照片，案上的那一只嘴还张着，馅已经往外掉。原来被拍下来的，是做坏的那个。\n\n翻到背面：“小满六岁。闹着要帮忙，最后帮着吃了三个。”最后几个字挤出框边，奶奶又把“三个”圈了一遍。",
      exhibit: { kind: 'photo', kicker: '照片背面 · 祖母的字', title: '那年，第一笼包子', lines: ['“小满六岁。闹着要帮忙，', '最后帮着吃了三个。”'], caption: '你已经很久没听见有人叫你“小满”了。' },
      action: { id: 'read-family-photo', label: '记住这张照片', effects: [{ kind: 'clue', id: 'family-photo' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'letter', label: '信封', cameraView: 'entry', x: 13.3, y: 70.5, icon: 'letter', sprite: { asset: 'arrival-letter', width: 9, height: 5, z: 9 }, completed: { kind: 'clue', id: 'invitation' }, interaction: {
      kind: 'inspect', manipulation: 'unfold', text: "小满：\n\n你说工作的事，我知道了。上次电话里没问清，你那边住的地方还方便不方便？想回来就回来，屋子给你留着，被子也晒了。\n\n我想找你帮个忙。以前记吃食的那本书还在，后面空着几页，拖到现在，自己看了也嫌烦。你回来有空，替我跑跑腿。不是叫你一到就忙，先把觉睡足。\n\n不用带东西。住几天都行。\n\n——奶奶\n\n信封里还夹着到站票根。你在车上把信重新折过，折痕没有跟原来的对齐；“住几天都行”压在新折痕上，纸没展开时，正好能看见。",
      exhibit: { kind: 'letter', kicker: '回家前寄来 · 已拆封', title: '小满：', lines: ['你说工作的事，我知道了。', '想回来就回来，屋子给你留着。', '那本旧书还空着几页，正好想找你帮忙。', '不用带东西，住几天都行。'], caption: '最后一行，比前面的字小一点。' },
      action: { id: 'read-invitation', label: '把信折回去', effects: [{ kind: 'clue', id: 'invitation' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'tea', label: '温茶', cameraView: 'tea', x: 61.9, y: 60, icon: 'tea', sprite: { asset: 'arrival-cup', width: 4, height: 4.1, z: 10 }, variants: [{ condition: { kind: 'flag', id: 'tea-offered' }, x: 64.4, y: 59.9 }], drag: { actionId: 'offer-tea', target: { x: 63.5, y: 58.8, width: 2, height: 2.4 }, hint: '往靠近藤椅的一侧挪' }, completed: { kind: 'flag', id: 'tea-offered' }, interaction: {
      kind: 'inspect', text: "这只杯子有缺口。你伸手想把缺口转开，才发现奶奶早已把它转在里面。她喝茶时认得该从哪边下嘴。\n\n杯子在小几外沿，离你近，离藤椅远一点。奶奶说话时伸过一次手，没拿到，便接着讲下去。你可以把杯碟一起往她那边挪，别只提杯耳——底碟里还有一点刚溅出来的水。",
      versions: [{ condition: { kind: 'flag', id: 'tea-offered' }, text: "杯碟往藤椅这边让过，奶奶已经够得着。她把杯子转半圈，喝一口，又转回缺口朝里的方向。\n\n你原想替她再换个方向，看她放得稳，手就停在碟边。等她说完这一句，再给自己倒。" }],
      options: [{ id: 'offer-tea', label: '把茶杯往奶奶手边挪一点', effects: [{ kind: 'flag', id: 'tea-offered' }, { kind: 'metric', id: 'attention', amount: 1 }], feedback: "奶奶把杯子转了半圈：“我的放这里。你那杯还空着，壶里有。”" }],
    } },
    { id: 'calendar', label: '旧日历', cameraView: 'wall', x: 22.6, y: 32, icon: 'look', sprite: { asset: 'prop-calendar', width: 6.1, height: 16.3, z: 3 }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: "今天的格子里写着三件事：取眼镜，买桂花，小满回家。\n\n前两件各打了一个勾。你的名字边上没有勾，倒有一个涂过的日期。车次改过一回，你只记得在手机上重新订票，没想过这里也得跟着改。\n\n纸后面还夹着眼镜店的小票。奶奶念东西时照旧把眼镜推到头顶，你看她一眼，她先说：“戴着看远的，近的反倒不清楚。”",
      exhibit: { kind: 'note', kicker: '日历页角', title: '这几天', lines: ['取眼镜。', '买桂花。', '小满回家。'], caption: '你的名字旁边，她画了一个圈。' },
      action: { id: 'read-calendar', label: '看清改过的日期', effects: [{ kind: 'clue', id: 'calendar' }] },
    } },
    { id: 'phone', label: '手机', cameraView: 'entry', x: 7.5, y: 73.8, icon: 'look', sprite: { asset: 'arrival-phone', width: 6.2, height: 5.5, z: 9 }, completed: { kind: 'clue', id: 'job-gap' }, interaction: {
      kind: 'inspect', manipulation: 'phone', text: "简历停在“个人简介”。光标前有一句“能够适应”，后面没了。你在车上改过几次，后来连自己原本打算适应什么，也没想清。\n\n上一份工作的开始日期已经填好，结束一栏仍是“至今”。要不要把那两个字删掉，你反倒拖得最久。昨晚到家，奶奶叫你洗手吃饭，你按灭屏幕，跟自己说吃完再改。\n\n现在屏幕又亮了。屋里没有新消息的声音，只有奶奶收针线时，铁皮盒盖碰到桌沿的一下轻响。",
      exhibit: { kind: 'note', kicker: '草稿 · 尚未发出', title: '个人简历', lines: ["起止：仍写着“至今”", "简介：能够适应……", '返程：暂未决定'], caption: '昨晚回家时，奶奶先让你吃了饭。' },
      action: { id: 'arrival-read-phone', label: '看看屏幕', effects: [{ kind: 'clue', id: 'job-gap' }] },
    } },
  ],
};

const nodes: DialogueSeed[] = [
  { id: 'welcome', speaker: '奶奶',   choices: [
    { id: 'arrival-ate', label: '吃了。就是没你这里的香。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
    { id: 'arrival-hungry', label: '还没。想着留点肚子回来。', next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
  ] },
  { id: 'home', speaker: '奶奶',   choices: [
    { id: 'arrival-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'request', speaker: '奶奶',   choices: [
    { id: 'arrival-why-book', label: '到店里要问些什么？', next: 'people', effects: [] },
    { id: 'arrival-why-me', label: '为什么是我？', next: 'why-you', effects: [] },
    { id: 'arrival-photo-question', label: '照片里，陈伯那时也在。', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看过斗柜上的旧合照，才想得起这件事。', next: 'photo-memory', effects: [] },
    { id: 'arrival-ready', label: '好。我该怎么开始？', next: 'approach', effects: [] },
  ] },
  { id: 'people', speaker: '祖母',   choices: [{ id: 'arrival-understand-book', label: "你这样问，他当然要藏盐。", next: 'request', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
  { id: 'why-you', speaker: '奶奶',   choices: [{ id: 'arrival-admit', label: "那我就说，替你来的。", next: 'request', effects: [{ kind: 'flag', id: 'phone-away' }] }] },
  { id: 'photo-memory', speaker: '祖母',   choices: [{ id: 'arrival-photo-reply', label: "做坏的那个，他还留着讲呢？", next: 'request', effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'approach', speaker: '祖母',   choices: [
    { id: 'accept-commission', onceKey: 'arrival-commission', label: '好，我多坐一会儿，回来慢慢讲。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-slow' }, { kind: 'item', id: 'small-key', amount: 1 }] },
    { id: 'accept-brief', onceKey: 'arrival-commission', label: '我先照书上这几样去找。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-recording' }, { kind: 'item', id: 'small-key', amount: 1 }] },
  ] },
  { id: 'instructions', speaker: '祖母',   choices: [{ id: 'arrival-set-off', label: "我先理书签。针别又落在椅子上。", effects: [{ kind: 'flag', id: 'arrival-instructions' }] }] },
  { id: 'followup', speaker: '祖母',   choices: [
    { id: 'arrival-followup-photo', label: '再讲讲我小时候的事。', next: 'remember-again', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看看那张合照，或许能想起什么。', effects: [] },
    { id: 'arrival-followup-tea', label: '茶放你手边了。', condition: { kind: 'flag', id: 'tea-offered' }, unavailable: '小茶几上的茶还温着。', next: 'tea-reply', effects: [] },
    { id: 'arrival-followup-bye', label: '这就走。你也歇一会儿。', effects: [] },
  ] },
  { id: 'remember-again', speaker: '祖母',   choices: [{ id: 'arrival-remember-bye', label: "这回不等明天，我先去。", effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'tea-reply', speaker: '祖母',   choices: [{ id: 'arrival-tea-reply', label: "那我的这杯，你可别替我喝了。", effects: [] }] },
  { id: 'grandma-early-return', speaker: '奶奶',   choices: [
    { id: 'grandma-early-knee', label: '陈伯站得久，阿宁给他留了护膝。', condition: { kind: 'clue', id: 'knee-note' }, unavailable: '在陈家留意过护膝，才能讲起这件事。', next: 'grandma-chen-chat', effects: [] },
    { id: 'grandma-early-ning', label: '阿宁要去城南，她还惦记着铺子。', condition: { kind: 'flag', id: 'ning-heard' }, unavailable: '先听阿宁讲讲她的工作。', next: 'grandma-ning-chat', effects: [] },
    { id: 'grandma-early-book', label: '坐一会儿。你最早怎么开始记做法的？', next: 'grandma-first-story', effects: [] },
    { id: 'grandma-early-bye', label: '我再看看屋里，等下还去陈家。', effects: [] },
  ] },
  { id: 'grandma-chen-chat', speaker: '奶奶',   choices: [{ id: 'grandma-chen-chat-close', label: "我回去再看看他怎么说。", effects: [] }] },
  { id: 'grandma-ning-chat', speaker: '奶奶',   choices: [{ id: 'grandma-ning-chat-close', label: "好，我问她什么时候有空。", effects: [] }] },
  { id: 'grandma-later', speaker: '奶奶',   choices: [
    { id: 'grandma-ask-first-page', label: '你最早是什么时候开始记做法的？', next: 'grandma-first-story', effects: [] },
    { id: 'grandma-ask-photo-margin', label: '照片背面说，你刚来时认门认了三回？', next: 'grandma-new-neighbor', condition: { kind: 'clue', id: 'photo-margin' }, unavailable: '重新细看那张照片，也许能找到这句话。', effects: [] },
    { id: 'grandma-return-bye', label: '我坐一会儿，等下还得出去。', effects: [] },
  ] },
  { id: 'grandma-first-story', speaker: '奶奶',   choices: [{ id: 'grandma-record-first-story', label: "把那个“再”字补清楚。", effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  { id: 'grandma-new-neighbor', speaker: '奶奶',   choices: [{ id: 'grandma-photo-story-close', label: '原来门口的花盆还有这段事。', effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
];
export const commission: Dialogue = {
  id: 'commission', entry: 'welcome', entries: [
    { condition: lifeUnlocked, nodeId: 'grandma-later' },
    { condition: revisitUnlocked, nodeId: 'grandma-early-return' },
    { condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'not', condition: { kind: 'flag', id: 'arrival-instructions' } }] }, nodeId: 'instructions' },
    { condition: { kind: 'flag', id: 'entrusted' }, nodeId: 'followup' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'flag', id: 'arrival-greeted' }, nodeId: 'home' },
  ], nodes: nodes.map(n => scriptNode({ portrait: 'grandmother', ...n, speaker: n.speaker === '祖母' ? '奶奶' : n.speaker }, arrivalScripts[n.id])),
};
export const arrivalGame: MinigameDefinition = {
  id: 'arrival-route', chapterId: 'arrival', module: 'itinerary', title: '三张书签',
  description: '三张书签夹乱了。根据上面的营业时间，把它们放回相应的页间；点选书签，再点空位。', target: 100,
  condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-instructions' }, { kind: 'clue', id: 'book' }] },
  unavailable: '先和祖母聊清委托，再来整理走访书签。',
  itinerary: {
    slips: [
      { id: 'night-slip', title: '夜里食堂', detail: '夜班的人回来，灯才亮。21:00 后留餐。', slot: 'evening' },
      { id: 'morning-slip', title: '陈家包子铺', detail: '六点开门，第一笼 06:30。错过就等下一笼。', slot: 'morning' },
      { id: 'noon-slip', title: '琴记面馆', detail: '午间 11:30 开灶，老客靠窗坐。', slot: 'noon' },
    ],
    slots: [{ id: 'morning', label: '清晨', time: '第一笼热气' }, { id: 'noon', label: '午间', time: '一碗热面' }, { id: 'evening', label: '深夜', time: '最后一盏灯' }],
  },
  reward: { id: 'arrival-route-reward', label: '出门', feedback: '书和钥匙装好了。祖母在身后叫你：“陈伯要是问，说昨天那碗汤不咸，正好。”', effects: [{ kind: 'flag', id: 'arrival-packed' }, { kind: 'item', id: 'baiwei-book', amount: 1 }, { kind: 'quest', id: 'commission', status: 'completed' }] },
};
