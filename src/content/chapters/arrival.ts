import type { Chapter, Dialogue, MinigameDefinition } from '../../core/contracts.ts';
import { lifeUnlocked, revisitUnlocked } from '../progression.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { arrivalScripts } from '../scripts/arrival.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', subtitle: '行李还没拆，茶已经温好了。', time: '清晨 · 奶奶的老宅',
  description: "上一份工作结束以后，你回到长明巷，返程票还没买。昨晚搬进门的包仍开着，手机搁在低柜上，衣服也只拿出来一半。奶奶靠窗做针线，见你过来，先往旁边让一让，问你今天吃过饭没有。小几上的茶已经倒好了，坐下就够得着。",
  asset: 'arrival-home', position: 'center', tint: 'dawn',
  objective: '陪奶奶坐一会儿，看看她搁了许久的旧书。',
  revisitDescription: "奶奶还在老宅，书能放回窗下的写字台。今天问来的几页可以念给她听，先前没讲完的，也能坐下来接着问。",
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
      kind: 'inspect', manipulation: 'book', journalLink: true, text: "你把旧书拿近，沿书脊托住它，才敢往两边翻。封皮已经磨得发亮，扉页上的“百味录”倒还清楚，旁边那只长了腿的碗占了小半角。你用手挡住碗，只看字，奶奶在旁边说别挡了，画都画上去这么多年，现在才嫌不好看。\n\n桂花米酒那页夹着一张购物单，正面还有鸡蛋和青菜，反面才是用水的量。奶奶说当时出门没带本子，回来本来要誊，结果纸夹在这里，用的时候也找得着，就再没拿下来。你想把两张一起抚平，底下又滑出一张小的，她赶紧接住，认过一遍才给翻正：“这个倒了，难怪刚才看半天不认识。”\n\n糖那一行被划掉过，旁边补字的人用的是另一支细笔。你问要不要照新的抄，奶奶让你连改过的也留着，不是都要往锅里放，是怕下回问起又忘了为什么改。她伸手指了指那句尝过再放，叫你先把这句记明白。\n\n后头的空白页比前面平整，摊开了又会慢慢合回来。你找张干净纸垫在手下，轻轻按住，终于腾出一只手拿笔。三张走访书签也夹在里面，露出来的时间各不相同，得先理顺了再带走。",
      exhibit: { kind: 'book', kicker: '奶奶的旧食谱', title: '百味录', lines: ['桂花米酒 · 奶奶的旧方', '清水煮开，酒酿拨散，最后撒桂花。', '“糖先少放，尝了再说。”'], caption: '先把这一页誊清。其余的，等走到店里再问。' },
      action: { id: 'inspect-book', label: '翻开书页', effects: [{ kind: 'clue', id: 'book' }] }, activityId: 'arrival-route',
    } },
    { id: 'photo', label: '旧合照', cameraView: 'cabinet', x: 21.6, y: 44, icon: 'look', sprite: { asset: 'prop-photo', width: 6.5, height: 8.7, z: 4 }, completed: { kind: 'clue', id: 'family-photo' }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: "你把相框拿到亮处，先认出站在凳子上的自己。那会儿案板比你高，袖口卷到胳膊肘还往下掉，一只手拼命够着面团，另一只压在案边。陈伯在后头扶凳背，奶奶偏出半边肩，手里的外套垂得快碰到地。\n\n你一直记得自己那天做成过一个月亮包子，逢人讲起来，好像谁都夸了。照片上却不是那么回事，案上那只嘴还张着，馅已经从缝里挤出来。你把照片凑近看，想找旁边有没有另一个做好的，奶奶见了先笑，说要真做得跟陈伯一样，她就不用拍了。\n\n相框背板能松开一点，你翻过去，才看到写着“小满六岁。闹着要帮忙，最后帮着吃了三个。”三个字挤到框边，又被圈了一回。你问为什么特意圈，奶奶说你回来跟人讲只吃了一只，那另外两只难道是凳子吃的。\n\n你想将背板合回去，发现自己还捏着框角发笑。下回到陈家，倒可以问问他，那天到底有没有做成一个。",
      exhibit: { kind: 'photo', kicker: '照片背面 · 祖母的字', title: '那年，第一笼包子', lines: ['“小满六岁。闹着要帮忙，', '最后帮着吃了三个。”'], caption: '你已经很久没听见有人叫你“小满”了。' },
      action: { id: 'read-family-photo', label: '记住这张照片', effects: [{ kind: 'clue', id: 'family-photo' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'letter', label: '信封', cameraView: 'entry', x: 13.3, y: 70.5, icon: 'letter', sprite: { asset: 'arrival-letter', width: 9, height: 5, z: 9 }, completed: { kind: 'clue', id: 'invitation' }, interaction: {
      kind: 'inspect', manipulation: 'unfold', text: "小满：\n\n你说工作的事，我知道了。上次电话里没问清，你住的地方还方便不方便，东西多不多，要搬的时候有没有人搭把手。你要回来就回来，屋里那张床一直空着，被子前两天晒过，床单也换好了，不用你回来再找。\n\n我想找你帮个忙，以前记吃食那本书还在，后面空着几页，拖得久了，我自己看着也嫌烦。陈家和琴记现在的做法，不知道还跟从前一样不一样，我每次想着去问，买完菜又先回家做饭，回来就不想再出门。你这回有空，替我去吃两趟，顺便问问。\n\n不过不是叫你一回来就跑，先把觉睡足。想在屋里待着也行，我白天做我的事，你做你的。那件厚一点的外套带上，早晚坐门口会凉，别看出门太阳大就全收起来。\n\n不用买东西，家里有。也不用先跟我定住几天，住几天都行。你那边收拾好了，记得把车次告诉我，改了也说一声，免得我照前一回的点等。\n\n——奶奶\n\n信封里夹着到站的票根，你拿出来看了一遍，又放回原处。车上重新折信时，没照着她原来的折痕，最后那句不用先定住几天恰好露在外面。昨晚进门你忙着搬包，这封信也一直没跟别的纸分开，现在才有空将它完整读完。",
      exhibit: { kind: 'letter', kicker: '回家前寄来 · 已拆封', title: '小满：', lines: ['你说工作的事，我知道了。', '想回来就回来，屋子给你留着。', '那本旧书还空着几页，正好想找你帮忙。', '不用带东西，住几天都行。'], caption: '最后一行，比前面的字小一点。' },
      action: { id: 'read-invitation', label: '把信折回去', effects: [{ kind: 'clue', id: 'invitation' }, { kind: 'metric', id: 'attention', amount: 1 }] },
    } },
    { id: 'tea', label: '温茶', cameraView: 'tea', x: 61.9, y: 60, icon: 'tea', sprite: { asset: 'arrival-cup', width: 4, height: 4.1, z: 10 }, variants: [{ condition: { kind: 'flag', id: 'tea-offered' }, x: 64.4, y: 59.9 }], drag: { actionId: 'offer-tea', target: { x: 63.5, y: 58.8, width: 2, height: 2.4 }, hint: '往靠近藤椅的一侧挪' }, completed: { kind: 'flag', id: 'tea-offered' }, interaction: {
      kind: 'inspect', text: "杯子在小几的外沿，你伸手就够着，奶奶坐在藤椅里却得往前探。她刚才伸过一次手，话还没说完就又坐回去，转而问你柜上的东西放好了没有。\n\n你原想把杯口的缺处转开，端近才看见，奶奶早已让它朝里。杯柄和碟上的小花正好错开，她拿的时候不必再找，手一转就知道该从哪边喝。你问换一只不行吗，她说自己认得，你要喝用旁边那只，别又拿她的。\n\n碟底有一点溅出来的水，光提杯耳容易滴到腿上。把杯碟一块儿托住，往靠藤椅的一侧挪些，既不挡茶壶，奶奶伸手也够得着。她看你端起来，先叫你慢点，说这点茶没多少，倒是底下那口水容易被忘了。",
      versions: [{ condition: { kind: 'flag', id: 'tea-offered' }, text: "杯碟已经往藤椅边让过，奶奶不用再起身够。她将杯子转半圈喝了一口，放下时又把缺口留在里面，底下那朵小花仍朝着你。\n\n你伸手想再替她转正，她说这样就好，叫你别围着一只杯子忙。另一只杯子还是空的，她拿指尖碰了碰杯沿，问你既然站在壶边，怎么还不给自己倒。\n\n你将茶倒上，奶奶等你端稳才接着说。原来刚才那半句并没有忘，只是先让你坐下来。" }],
      options: [{ id: 'offer-tea', label: '把茶杯往奶奶手边挪一点', effects: [{ kind: 'flag', id: 'tea-offered' }, { kind: 'metric', id: 'attention', amount: 1 }], feedback: "奶奶扶住杯碟，转半圈才端起来，说这边就够得着。她见你还站着，又指旁边那只空杯子：“你那杯呢？壶里有，先给自己倒一口。”" }],
    } },
    { id: 'calendar', label: '旧日历', cameraView: 'wall', x: 22.6, y: 32, icon: 'look', sprite: { asset: 'prop-calendar', width: 6.1, height: 16.3, z: 3 }, interaction: {
      kind: 'inspect', manipulation: 'flip', text: "今天的格子写得很挤，取眼镜、买桂花、小满回家，三行字已经碰到隔壁那一天。前两件旁边各打了一个小勾，你的名字却被圈起来，圈外还有涂改过的日期。\n\n你想起车次改过一回，自己在手机上退了重订，给奶奶回过电话就觉得这件办完了。墙上却也跟着挪过一次，她先把原来的圈划掉，重新找个空处，将你的名字再写一遍。你问怎么还不打勾，她说昨晚光顾着叫你吃饭，等会儿拿笔来补。\n\n日历后面夹着眼镜店的小票，折起来正好不露出下面的字。奶奶看你拿到眼前，便说那个不用收走，她还得留着对。她自己念东西时照旧把眼镜推到头上，你看她一眼，她先解释戴着看远，凑近反倒不清楚。\n\n你将票根夹回去，没有顺手把那几件已办好的事撕掉。奶奶说翻过了也能再翻回来，别看一个格子写不下，就替她把前面全收拾没了。",
      exhibit: { kind: 'note', kicker: '日历页角', title: '这几天', lines: ['取眼镜。', '买桂花。', '小满回家。'], caption: '你的名字旁边，她画了一个圈。' },
      action: { id: 'read-calendar', label: '看清改过的日期', effects: [{ kind: 'clue', id: 'calendar' }] },
    } },
    { id: 'phone', label: '手机', cameraView: 'entry', x: 7.5, y: 73.8, icon: 'look', sprite: { asset: 'arrival-phone', width: 6.2, height: 5.5, z: 9 }, completed: { kind: 'clue', id: 'job-gap' }, interaction: {
      kind: 'inspect', manipulation: 'phone', text: "手机亮起时仍停在简历上，个人简介下面只有一句“能够适应”，光标跟在后面。你在车上换过几次说法，想着得写得像个愿意做事的人，又觉得谁看了都能接同样一句，删来改去，最后只剩这四个字。\n\n上一份工作的开始日期填得很顺，结束那一栏还留着至今。日子你记得，不是想不起来，只是每回点进去，总先回头改前面的介绍。改介绍不必立刻选一个日期，能在那里多待一会儿，像这份东西还没到必须发出去的时候。\n\n昨晚奶奶喊你洗手吃饭，你按灭屏幕，想着吃完再改。她后来问外套要不要挂起来，你又拿手机看了一眼，并没有新消息。明明还什么都没发，手却老往同一个地方点，好像多打开一次，就能省掉写后面那句话。\n\n现在屋里听见的只有奶奶收针线的声音，铁盒盖碰了一下桌沿，她叫你把脚边的包挪开。你先退出了简历，没有再替那句能够适应找个更好听的后半句。",
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
  { id: 'people', speaker: '祖母',   choices: [{ id: 'arrival-understand-book', label: "我先吃，等他们不忙了再问。", next: 'request', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
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
  { id: 'remember-again', speaker: '祖母',   choices: [{ id: 'arrival-remember-bye', label: "我趁他们还没收摊去。", effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
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
  reward: { id: 'arrival-route-reward', label: '出门', feedback: "书签夹好了，钥匙也收进口袋，奶奶又叫你检查书别压着线头。你往门口走，她在后头想起一句：“陈伯要是问，昨天那碗汤不咸，正好。你别光顾问他的，忘了替我答这句。”", effects: [{ kind: 'flag', id: 'arrival-packed' }, { kind: 'item', id: 'baiwei-book', amount: 1 }, { kind: 'quest', id: 'commission', status: 'completed' }] },
};
