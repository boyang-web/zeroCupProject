import type { Chapter, Dialogue, DialogueNode, Hotspot, MinigameDefinition, Condition } from '../../core/contracts.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const sprite = (asset: string, width: number, height: number, z = 2) => ({ asset, width, height, z });
const inspect = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId?: string): Hotspot => ({
  id, label, x, y, icon: 'look', sprite: sprite(asset, width, height), completed: clueId ? clue(clueId) : undefined,
  interaction: { kind: 'inspect', text, action: clueId ? { id: id === 'morning-note' ? 'morning-read' : `read-${id}`, label: '记下来', effects: [{ kind: 'clue', id: clueId }] } : undefined },
});
const front: Hotspot[] = [
  { id: 'morning-person', label: '陈伯', x: 43, y: 91, icon: 'talk', sprite: sprite('chen', 20, 62, 3), condition: { kind: 'any', conditions: [{ kind: 'not', condition: flag('chen-at-table') }, flag('morning-ended')] }, interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'morning-customer', label: '周叔留的纸条', x: 72, y: 55, icon: 'letter', sprite: sprite('prop-rota', 9, 10), interaction: { kind: 'inspect', text: '纸条压在零钱盒下面：两只青菜包，别装辣的。拿回去给老伴，她上午还得去排队。下面是陈伯添的字：她那份别算钱，上回帮我缝了围裙。', action: { id: 'read-customer-order', label: '看看留单', effects: [{ kind: 'clue', id: 'breakfast-order' }] } }, completed: clue('breakfast-order') },
  inspect('front-steamer', '已经卖空的一笼', 'prop-steamer', 84, 59, 22, 29, '盖子一掀，底下只剩一圈油纸。陈伯说你来晚了半步，又往灶间看：“下一笼快了。”'),
  inspect('front-buns', '给早班留的包子', 'prop-buns', 64, 58, 13, 18, '两只青菜包单独放着，油纸叠了两层。旁边没标名字，陈伯却从来没拿错过。'),
  { id: 'front-stool', label: '小凳子', x: 28, y: 85, icon: 'look', sprite: sprite('prop-stool', 13, 21), variants: [{ condition: flag('chen-has-seat'), x: 50, y: 91 }], completed: flag('chen-has-seat'), interaction: { kind: 'inspect', text: '凳脚有一截新缠的布。陈伯站着收钱，右腿换到左腿，没坐。', options: [{ id: 'move-stool', label: '把凳子挪近些', feedback: '“挡路。”陈伯说。等你转身，他还是坐下了。', effects: [{ kind: 'flag', id: 'chen-has-seat' }, { kind: 'metric', id: 'listening', amount: 1 }] }] } },
];
const kitchen: Hotspot[] = [
  { id: 'morning-object', label: '笼屉', x: 70, y: 54, icon: 'tea', sprite: sprite('prop-steamer', 22, 26), variants: [{ condition: flag('morning-played'), asset: 'prop-open-steamer' }], interaction: { kind: 'minigame', gameId: 'morning-game' }, completed: flag('morning-played') },
  inspect('morning-note', '阿宁改过的备料表', 'prop-rota', 24, 77, 13, 14, '周一、周三、周五：六点半到面；先蒸两笼；七点再开门。几行字划了又写，底下留着一句：爸，你先别急着说不行。', 'schedule'),
  inspect('kneading-board', '擀面板', 'prop-board', 46, 82, 26, 27, '案板中间薄，四周厚。阿宁小时候量身高的铅笔线，还在板背面。陈伯嫌桌子上写字不好看，没舍得擦。', 'board-marks'),
  inspect('work-apron', '洗得发白的围裙', 'prop-apron', 34, 41, 10, 29, '领口补了一小块蓝布，针脚歪歪的。兜里装着两颗水果糖，糖纸被揉得发软。陈伯总给来买早饭的孩子一颗。'),
  inspect('chen-knee', '折起来的护膝', 'prop-brace', 12, 76, 11, 15, '魔术贴上沾着面粉。盒盖写的是阿宁的字：走楼梯的时候戴着。下面陈伯添了一个很小的“好”。', 'knee-note'),
  { id: 'cabinet', label: '借一只保温袋', x: 56, y: 53, icon: 'book', sprite: sprite('prop-bag', 13, 24), completed: { kind: 'item', id: 'insulated-bag' }, interaction: { kind: 'inspect', text: '柜门搭着一只保温袋。陈伯认出你手里的钥匙，说：“你阿婆又把这个翻出来了。先放你那儿，跑完几家再还。”', options: [
    { id: 'borrow-with-key', onceKey: 'borrow-bag', label: '给陈伯看过钥匙，借走保温袋', condition: { kind: 'item', id: 'small-key' }, unavailable: '问问陈伯，也能借。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
    { id: 'borrow-by-asking', onceKey: 'borrow-bag', label: '问陈伯借来用一天', condition: flag('morning-listened'), unavailable: '先和陈伯说一声。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
  ] } },
];
const yard: Hotspot[] = [
  { id: 'chen-yard', label: '陈伯', x: 51, y: 91, icon: 'talk', sprite: sprite('chen', 19, 62, 3), condition: all(flag('chen-at-table'),{kind:'not',condition:flag('morning-ended')}), interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'ning', label: '阿宁', x: 38, y: 92, icon: 'talk', sprite: sprite('ning', 19, 64, 3), interaction: { kind: 'dialogue', dialogueId: 'ning-talk' } },
  inspect('school-letter', '新学校的报到信', 'prop-envelope', 67, 70, 12, 15, '信封口拆得很齐。阿宁下周去城南小学报到，要赶六点十分的班车。信里夹着一张孩子画的卡片：陈老师，给你留了靠窗的座位。', 'school-letter'),
  inspect('chen-bus-note', '陈伯抄的班车表', 'prop-ledger', 78, 72, 16, 19, '账本最后一页不记钱。城南小学、六点十分、下雨到桥下等。几站路被陈伯抄了三遍，最底下写着：豆沙，放保温袋。', 'bus-note'),
  inspect('ning-family-photo', '旧相框', 'prop-photo', 58, 69, 10, 19, '阿宁穿着大了一号的校服，站在店门口。陈伯一手提书包，一手拎蒸笼。相框背面用圆珠笔写着：她说长大了当老师。', 'ning-photo'),
  { id: 'yard-cup', label: '给两个人倒杯茶', x: 88, y: 73, icon: 'tea', sprite: sprite('prop-tea', 14, 20), completed: flag('morning-tea'), interaction: { kind: 'inspect', text: '小桌旁摆了两张椅子。一张椅背搭着陈伯的外套，另一张压着阿宁的教案。水壶是满的。', options: [{ id: 'morning-pour-tea', label: '把茶倒上', feedback: '阿宁端起一杯，又把另一杯往对面推了推。', effects: [{ kind: 'flag', id: 'morning-tea' }] }] } },
];
export const morning: Chapter = {
  id: 'morning', number: 2, title: '一笼早饭', subtitle: '下一笼，就出锅了。', time: '早市 · 陈家包子铺',
  description: '笼盖揭开，陈伯先认出了你。阿宁在后头洗手，水声停了，她没出来。',
  asset: 'morning-front', position: 'center', tint: 'dawn', questId: 'morning', metricIds: ['listening'], hotspots: [], firstScene: 'morning-front',
  objective: '帮陈伯赶完早市，再坐下来吃口热的。', next: 'noon', exitLabel: '去琴记面馆',
  exit: { kind: 'any', conditions: [{ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'quest', id: 'morning', status: 'failed' }] },
  exitHint: '早饭还没端上桌。陈伯和阿宁都在等你。',
  beats: [{ label: '和陈伯打个照面', condition: flag('morning-listened') }, { label: '去后院找阿宁', condition: flag('ning-heard') }, { label: '照看下一笼', condition: flag('morning-played') }, { label: '把早饭端上桌', condition: flag('morning-ended') }],
  scenes: [
    { id: 'morning-front', title: '店门口', description: '早市的人渐渐散了，笼里还有热气。', asset: 'morning-front', hotspots: front, links: [{ sceneId: 'morning-kitchen', label: '掀帘，进灶间', condition: flag('morning-listened'), unavailable: '陈伯正跟你说话。' }] },
    { id: 'morning-kitchen', title: '灶间', description: '案上全是面粉，门外有阿宁洗手的声音。', asset: 'morning-kitchen', hotspots: kitchen, links: [{ sceneId: 'morning-front', label: '回店门口' }, { sceneId: 'morning-yard', label: '穿过后门，去小院' }] },
    { id: 'morning-yard', title: '后院', description: '水龙头刚关上，晾衣绳还在滴水。', asset: 'morning-yard', hotspots: yard, links: [{ sceneId: 'morning-kitchen', label: '回灶间' }] },
  ],
};

const father: DialogueNode[] = [
  { id: 'invite', speaker: '陈伯', text: '阿宁已经把碗拿后头去了？\n\n行，我洗个手。你把那只肉的端上，可别给我落灶台上。', choices: [{ id: 'morning-invite', label: '端上碗，去后院。', effects: [{ kind: 'flag', id: 'chen-at-table' }] }] },
  { id: 'opening', speaker: '陈伯', direction: '他把围裙往下扯了扯，盯着你看了两眼。', text: '小满？……还真是。你阿婆说你回来了，我寻思她又拿旧照片糊弄我。\n\n吃过没有？这笼还差一把火。', choices: [
    { id: 'morning-listen', label: '还没。阿宁今天也在？', next: 'concern', effects: [{ kind: 'flag', id: 'morning-listened' }, { kind: 'metric', id: 'listening', amount: 1 }] },
    { id: 'morning-shared-memory', label: '阿婆说起那个“月亮包子”了。', condition: clue('chen-memory'), unavailable: '还没想起这件旧事。', next: 'old-photo', effects: [] },
    { id: 'morning-bye', label: '我先看看，你忙。', effects: [] },
  ] },
  { id: 'old-photo', speaker: '陈伯', text: '怎么不记得。扁得都能贴窗户上，你非说月亮就是那个样。\n\n现在不做月亮了？来，先帮我守一会儿灶。', choices: [{ id: 'morning-memory-return', label: '手生了，你可别嫌。', next: 'concern', effects: [{ kind: 'flag', id: 'chen-recognized' }, { kind: 'flag', id: 'morning-listened' }, {kind:'metric',id:'listening',amount:1}] }] },
  { id: 'concern', speaker: '陈伯', text: '在后头。周末嘛，过来帮两天。\n\n下周要去城南那边教书了，路远。我说店里这点事一个人也行，她偏把下礼拜的面都订好了。你说她操什么心。', choices: [
    { id: 'morning-ask-knee', label: '那你这腿呢？', condition: clue('knee-note'), unavailable: '还没留意到护膝。', next: 'knee', effects: [] },
    { id: 'morning-ask-old-hours', label: '还是每天六点开？', next: 'hours', effects: [] },
    { id: 'morning-thanks', label: '我去后头打个招呼。', effects: [] },
  ] },
  { id: 'hours', speaker: '陈伯', direction: '他抬眼看了一下门口。', text: '老周六点半来。以前开公交，退休了还是那个点起。给他老伴带两个菜包。\n\n我晚开，他又得在门口等着。等久了，回去粥都凉了。', choices: [{ id: 'morning-hours-end', label: '下一笼我帮你看。', effects: [{ kind: 'clue', id: 'old-customer' }] }] },
  { id: 'knee', speaker: '陈伯', text: '老毛病。坐一会儿就好。\n\n……你别跟阿宁学，包子没数清，先数我今天站了几小时。', choices: [{ id: 'morning-knee-end', label: '那你数包子，我去找凳子。', effects: [] }] },
  { id: 'before-food', speaker: '陈伯', text: '阿宁的豆沙留一个，老周那袋装两个菜的。还有一只肉的……你放我碗里就行。\n\n别把最后一只也拿去卖了。你阿婆见我，头一句总问吃没吃。', choices: [
    { id: 'morning-back-to-talk', label: '先说说你一个人开店的事。', next: 'concern', effects: [] },
    { id: 'morning-return-stove', label: '知道了。你先坐着。', effects: [] },
    { id: 'morning-decide', label: '早饭好了，我们去后院吃。', condition: flag('morning-played'), unavailable: '先把这一笼照看好。', next: 'table', effects: [] },
  ] },
  { id: 'table', speaker: '陈伯', direction: '他搓了搓手上的面粉，阿宁从门后探了个头。', text: '好了？那先吃。\n\n阿宁，你那几张纸，别又搁我账本上。昨天算钱算到六点十分，我还寻思谁买了这么多包子。', choices: [
    { id: 'morning-show-papers', label: '这两张纸，你们是不是该一起看看？', condition: all(clue('schedule'), clue('bus-note'), { kind: 'metric', id: 'listening', min: 4 }), unavailable: '两张纸要看齐，也得听阿宁把安排说完。', next: 'papers', effects: [] },
    { id: 'morning-table-first', label: '先坐下来吃吧。包子快凉了。', next: 'sit-down', effects: [] },
    { id: 'morning-later-plan', label: '先照旧开门，等开学后再看看。', next: 'defer', effects: [] },
  ] },
  { id: 'papers', speaker: '阿宁', portrait: 'ning', direction: '她先看见了那行“六点十分”。', text: '爸，你去问车了？\n\n我还以为……我都想好了，头一周早点回来，放学也赶回来。', choices: [{ id: 'morning-let-father-answer', label: '把班车表推到陈伯面前。', next: 'bus', effects: [] }] },
  { id: 'bus', speaker: '陈伯', text: '来回折腾干什么。人家第一回上课，老师先站着打瞌睡，像话吗。\n\n你留的那个送面师傅，靠不靠谱？', choices: [{ id: 'morning-let-ning-answer', label: '阿宁，你说说看。', next: 'trial', effects: [] }] },
  { id: 'trial', speaker: '阿宁', portrait: 'ning', text: '我跟他约了，先送三天。六点半到，爸你七点再开。周叔那份我跟他说了，先给他留着。\n\n试三天。不行我们再换，行不行？', choices: [
    { id: 'morning-agree', label: '那就先写三天，别急着写以后。', decision: 'morning', next: 'trial-end', effects: [{ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'flag', id: 'morning-plan' }, { kind: 'flag', id: 'morning-ended' }, { kind: 'metric', id: 'listening', amount: 1 }] },
    { id: 'morning-leave-to-them', label: '我去把碗拿来，你们接着说。', next: 'sit-down', effects: [] },
  ] },
  { id: 'trial-end', speaker: '陈伯', direction: '他把那两张纸叠好，压在茶杯下面。', text: '行，三天。老周来了，让他进来坐着等，别傻站门口。\n\n阿宁，豆沙还热，你先吃。\n\n……下周不用给我带饭。我会自己吃。', choices: [{ id: 'morning-trial-close', label: '把这一页记进书里。', effects: [{ kind: 'clue', id: 'morning-record' }] }] },
  { id: 'sit-down', speaker: '阿宁', portrait: 'ning', direction: '她把空椅子往父亲那边挪了一点。', text: '爸，你也坐。\n\n几点开门，送面的事，等吃完我跟你慢慢说。你先别一边擦桌子一边听。', choices: [{ id: 'morning-table-agree', label: '把最后一只肉包放进陈伯的碗。', decision: 'morning', next: 'table-end', effects: [{ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'flag', id: 'morning-table' }, { kind: 'flag', id: 'morning-ended' }] }] },
  { id: 'table-end', speaker: '陈伯', text: '这回真没拿去卖吧？\n\n……行，我坐。小满，你也别光看着，拿筷子。', choices: [{ id: 'morning-table-close', label: '在桌边坐一会儿。', effects: [{ kind: 'clue', id: 'morning-record' }] }] },
  { id: 'defer', speaker: '阿宁', portrait: 'ning', direction: '她把备料表折了起来，塞回围裙兜。', text: '嗯。那……明天我先早一点。\n\n小满，你的包子拿着，路上吃。', choices: [
    { id: 'morning-overpromise', label: '接过纸袋，暂且不再提。', decision: 'morning', next: 'defer-end', effects: [{ kind: 'quest', id: 'morning', status: 'failed' }, { kind: 'flag', id: 'morning-defer' }, { kind: 'flag', id: 'morning-ended' }] },
    { id: 'morning-reconsider', label: '等等，还是先坐一会儿吧。', next: 'sit-down', effects: [] },
  ] },
  { id: 'defer-end', speaker: '陈伯', direction: '他又往笼里看了一眼。', text: '行，路上慢点。跟你阿婆说一声，昨天那碗她送来的汤，挺好。\n\n阿宁，明早的面……还是照原来的数？', choices: [{ id: 'morning-defer-close', label: '在门口停了停，翻开书。', effects: [{ kind: 'clue', id: 'morning-unfinished' }] }] },
  { id: 'after', speaker: '陈伯', text: '又回来了？钥匙和袋子你先拿着。下回带过来就行。\n\n你阿婆问起来，就说我今天早饭坐着吃的。', choices: [{ id: 'morning-after-bye', label: '这句我一定带到。', effects: [] }] },
];
const daughter: DialogueNode[] = [
  { id: 'hello', speaker: '阿宁', direction: '她甩了甩手上的水，拿围裙擦了一下。', text: '小满？你怎么一点声都没有。\n\n我爸刚说第一笼卖完你都没来，我还以为他又留到自己忘了。', choices: [{ id: 'ning-ask-school', label: '听说你要去城南教书了。', next: 'school', effects: [{ kind: 'flag', id: 'ning-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }, { id: 'ning-hello-bye', label: '你忙，我先看看。', effects: [] }] },
  { id: 'school', speaker: '阿宁', text: '下周一报到。以前实习带的那班，班主任调走了，问我愿不愿意接。\n\n我答应的时候挺快。回家看我爸一个人搬那笼面，又想，要不再等一阵。', choices: [
    { id: 'ning-ask-plan', label: '灶间那张表，是你写的？', condition: clue('schedule'), unavailable: '去灶间看看她改过的备料表。', next: 'plan', effects: [] },
    { id: 'ning-listen', label: '你跟他说过舍不得走吗？', next: 'not-said', effects: [] },
    { id: 'ning-school-close', label: '先把早饭吃了，回头再说。', effects: [] },
  ] },
  { id: 'plan', speaker: '阿宁', text: '嗯。面先让人送来，晚半小时开。量算过了，不用他天天四点起来。\n\n我还没开口，他就说“教你的书去”。我一听也来气，剩下的话就没说。', choices: [{ id: 'ning-plan-close', label: '这张表先别收，吃饭时带过来。', effects: [{ kind: 'flag', id: 'ning-plan-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }] },
  { id: 'not-said', speaker: '阿宁', text: '说这个，他准笑我。小时候考完试没考好，我也是在这儿洗手，磨到水凉了才进屋。\n\n他每回都装没看见，给我留个豆沙的。这回还是。', choices: [{ id: 'ning-listen-close', label: '那今天也给你留一个。', effects: [{ kind: 'clue', id: 'ning-breakfast' }] }] },
  { id: 'ready', speaker: '阿宁', text: '我爸说要留一只肉的给自己。你可看好了，他忙起来又会顺手装进客人的袋子。\n\n我去拿碗。你让他也来，别又站门口吃。', choices: [{ id: 'ning-ready-bye', label: '好，今天把他叫来。', effects: [] }] },
  { id: 'after', speaker: '阿宁', text: '包子趁热吃。我把凳子留在柜后了，他要嫌挡路，你就说是你放的。\n\n我说的他不听，你说的他不好意思。', choices: [{ id: 'ning-after-bye', label: '行，这个锅我背了。', effects: [] }] },
];
export const morningDialogues: Dialogue[] = [
  { id: 'morning-talk', entry: 'opening', entries: [{ condition: flag('morning-ended'), nodeId: 'after' }, { condition: all(flag('morning-played'), { kind: 'not', condition: flag('chen-at-table') }), nodeId: 'invite' }, { condition: flag('morning-played'), nodeId: 'table' }, { condition: flag('morning-listened'), nodeId: 'before-food' }], nodes: father.map(n => ({ portrait: 'chen', ...n })) },
  { id: 'ning-talk', entry: 'hello', entries: [{ condition: flag('morning-ended'), nodeId: 'after' }, { condition: flag('morning-played'), nodeId: 'ready' }, { condition: flag('ning-heard'), nodeId: 'school' }], nodes: daughter.map(n => ({ portrait: 'ning', ...n })) },
];
export const morningGame: MinigameDefinition = {
  id: 'morning-game', chapterId: 'morning', module: 'breakfast', title: '下一笼', target: 75,
  description: '老周的两只菜包、阿宁的豆沙，还有陈伯自己的那一只。先配好，再看一会儿火。',
  condition: all(flag('morning-listened'), flag('ning-heard')), unavailable: '陈伯和阿宁还没交代清楚要留哪几份。',
  breakfast: { fillings: ['青菜', '豆沙', '鲜肉'], orders: [{ id: 'zhou', person: '周叔带走', hint: '给老伴，清淡些。', filling: '青菜', count: 2 }, { id: 'ning', person: '阿宁的碗', hint: '她从小爱吃甜的。', filling: '豆沙', count: 1 }, { id: 'chen', person: '陈伯的碗', hint: '留一只肉的，别全卖了。', filling: '鲜肉', count: 1 }] },
  reward: { id: 'morning-game-reward', label: '出笼了', feedback: '阿宁把周叔的纸袋折好，放在门口。剩下两碗，她一只手端一碗，往后院走。“爸，你也来。”', effects: [{ kind: 'flag', id: 'morning-played' }, { kind: 'metric', id: 'listening', amount: 1 }] },
};
