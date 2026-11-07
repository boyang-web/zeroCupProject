import type { Chapter, Dialogue, DialogueNode, Hotspot, MinigameDefinition, Condition } from '../../core/contracts.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const any = (...conditions: Condition[]): Condition => ({ kind: 'any', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const laterJourney: Condition = any(...(['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest' as const, id: 'noon', status })));
const atMeal = all(flag('chen-at-table'), not(flag('morning-defer')), not(laterJourney));
const atCounter = not(atMeal);
const holdingBag: Condition = { kind: 'item', id: 'insulated-bag' };
const sprite = (asset: string, width: number, height: number, z = 8) => ({ asset, width, height, z });
const inspect = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId?: string, cameraView?: string): Hotspot => ({
  id, label, x, y, cameraView, icon: 'look', sprite: sprite(asset, width, height), completed: clueId ? clue(clueId) : undefined,
  interaction: { kind: 'inspect', text, action: clueId ? { id: id === 'morning-note' ? 'morning-read' : 'read-' + id, label: '记下来', effects: [{ kind: 'clue', id: clueId }] } : undefined },
});
const front: Hotspot[] = [
  { id: 'morning-person', label: '陈伯', x: 49.5, y: 86, cameraView: 'counter', icon: 'talk', sprite: sprite('chen', 17.5, 57, 3), condition: atCounter,
    variants: [{ condition: flag('chen-has-seat'), asset: 'chen-seated', x: 52.2, y: 84, width: 20.5, height: 42.5, cameraView: 'rest' }],
    interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'morning-customer', label: '周叔留的纸条', x: 87.2, y: 55.2, cameraView: 'cashier', icon: 'letter', sprite: sprite('prop-rota', 4.8, 7.2),
    interaction: { kind: 'inspect', text: '留单夹在收银小台边的木夹上：两只青菜包，别装辣的。拿回去给老伴，她上午还得去排队。下面是陈伯添的字：她那份别算钱，上回帮我缝了围裙。',
      action: { id: 'read-customer-order', label: '看看留单', effects: [{ kind: 'clue', id: 'breakfast-order' }] } }, completed: clue('breakfast-order') },
  inspect('front-steamer', '已经卖空的一笼', 'morning-empty-steamer', 79.7, 56.8, 12, 6.5, '笼屉敞着，已经空了。空笼留在售卖台一侧，和待取的纸袋分开。陈伯往灶间看了一眼：“下一笼快了。”', undefined, 'empty-basket'),
  { ...inspect('front-buns', '给早班留的包子', 'morning-reserved', 65, 59.6, 7.5, 7.2, '两只青菜包装在取餐搁板的纸袋里，底下垫了两层油纸。陈伯给老周单留着，没有和零卖的混放。', undefined, 'pickup'), condition: not(flag('morning-played')) },
  { id: 'front-stool', label: '小凳子', x: 35, y: 80.5, cameraView: 'waiting-seat', icon: 'look', sprite: sprite('prop-stool', 7, 11, 2), condition: all(atCounter, not(flag('chen-has-seat'))), completed: flag('chen-has-seat'),
    interaction: { kind: 'inspect', text: '小凳子收在等餐长凳的里侧，凳脚缠了一截新布。陈伯在柜台边站着，右腿换到左腿，没坐。', options: [{ id: 'move-stool', label: '把凳子挪到柜后', feedback: '“挡路。”陈伯说。等你转身，他还是坐下了。', effects: [{ kind: 'flag', id: 'chen-has-seat' }, { kind: 'metric', id: 'listening', amount: 1 }] }] } },
];
const kitchen: Hotspot[] = [
  { id: 'morning-object', label: '笼屉', x: 73.5, y: 54.1, cameraView: 'stove', icon: 'tea', sprite: sprite('morning-closed-steamer', 11, 13.5),
    variants: [{ condition: flag('morning-played'), asset: 'morning-empty-steamer', height: 8 }],
    interaction: { kind: 'minigame', gameId: 'morning-game' }, completed: flag('morning-played') },
  { id: 'morning-note', label: '阿宁改过的备料表', x: 35.5, y: 42.7, cameraView: 'plan', icon: 'look', sprite: sprite('morning-prep', 6.5, 15.8), completed: clue('schedule'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: '备料表夹在揉面区上方的墙板上，纸边没沾面粉。几行字划了又写，后头还夹着阿宁补的一句话。',
      exhibit: { kind: 'note', kicker: '阿宁改过的备料表', title: '先试三天', lines: ['周一、周三、周五：六点半到面。', '先蒸两笼，七点再开门。', '爸，你先别急着说不行。'] },
      action: { id: 'morning-read', label: '记下这个安排', effects: [{ kind: 'clue', id: 'schedule' }] } } },
  inspect('kneading-board', '擀面板', 'morning-board', 40.2, 70.5, 24, 10.5, '擀面板平放在揉面案上，边上就是面粉桶和水碗。板中间薄，四周厚。阿宁小时候量身高的铅笔线，还留在板背面，陈伯没舍得擦。', 'board-marks', 'bench'),
  inspect('work-apron', '洗得发白的围裙', 'prop-apron', 6.3, 55.3, 8, 20, '围裙挂在入口的干墙上，离蒸炉远些。领口补了一小块蓝布，兜里装着两颗水果糖。陈伯总给来买早饭的孩子一颗。', undefined, 'hooks'),
  inspect('chen-knee', '折起来的护膝', 'prop-brace', 19.5, 89.3, 4, 6.2, '护膝收在入口柜下方的个人小格里，没有和做包子的东西混放。魔术贴上还沾着一点面粉，旁边是阿宁留的字：走楼梯的时候戴着。下面陈伯添了一个很小的“好”。', 'knee-note', 'storage'),
  { id: 'cabinet', label: '借一只保温袋', x: 16, y: 71.5, cameraView: 'storage', icon: 'book', sprite: sprite('prop-bag', 8, 13), condition: not(holdingBag), completed: holdingBag,
    interaction: { kind: 'inspect', text: '出餐用的保温袋挂在入口干柜的门外侧。陈伯认出你手里的钥匙，说：“你阿婆又把这个翻出来了。先放你那儿，跑完几家再还。”', options: [
      { id: 'borrow-with-key', onceKey: 'borrow-bag', label: '给陈伯看过钥匙，借走保温袋', condition: { kind: 'item', id: 'small-key' }, unavailable: '问问陈伯，也能借。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
      { id: 'borrow-by-asking', onceKey: 'borrow-bag', label: '问陈伯借来用一天', condition: flag('morning-listened'), unavailable: '先和陈伯说一声。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
    ] } },
];
const yard: Hotspot[] = [
  { id: 'chen-yard', label: '陈伯', x: 53.5, y: 90, cameraView: 'chen-meal', icon: 'talk', sprite: sprite('chen-seated', 21, 44.5, 3), condition: atMeal, interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'ning', label: '阿宁', x: 38.5, y: 86, cameraView: 'sink', icon: 'talk', sprite: sprite('ning', 17.5, 59.5, 3),
    variants: [{ condition: atMeal, asset: 'ning-seated', x: 84, y: 90, width: 20, height: 44.5, cameraView: 'ning-meal' }, { condition: flag('morning-defer'), x: 27, y: 87, cameraView: 'departure' }],
    interaction: { kind: 'dialogue', dialogueId: 'ning-talk' } },
  { id: 'school-letter', label: '新学校的报到信', x: 15.2, y: 77.2, cameraView: 'bag', icon: 'letter', sprite: sprite('morning-school-letter', 8, 6.5), completed: clue('school-letter'),
    interaction: { kind: 'inspect', manipulation: 'unfold', text: '报到信放在干凳的帆布包旁边，信封口拆得很齐。阿宁把它和教案放在一起，没往湿水台边搁。',
      exhibit: { kind: 'letter', kicker: '新学校的报到信', title: '下周一，城南小学', lines: ['报到时，带上教案。', '她要赶六点十分的班车。', '孩子的卡片上写着：陈老师，给你留了靠窗的座位。'] },
      action: { id: 'read-school-letter', label: '把信折好放回', effects: [{ kind: 'clue', id: 'school-letter' }] } } },
  { id: 'chen-bus-note', label: '陈伯抄的班车表', x: 57.2, y: 51.3, cameraView: 'family', icon: 'look', sprite: sprite('prop-ledger', 8.5, 6.2), completed: clue('bus-note'),
    variants: [{ condition: atMeal, asset: 'morning-ledger-flat', x: 61.5, y: 66, cameraView: 'ledger-meal', width: 9, height: 3.6 }],
    interaction: { kind: 'inspect', manipulation: 'book', text: '账本放在家用干柜里，最后一页没记钱。翻到后头，几站路被陈伯抄了三遍。',
      exhibit: { kind: 'book', kicker: '最后一页 · 陈伯的字', title: '账簿', lines: ['城南小学 · 六点十分。', '下雨到桥下等。', '豆沙，放保温袋。'] },
      versions: [{ condition: atMeal, text: '陈伯的账本已经拿到饭桌边，摊着的那一页不记钱，记的是阿宁去城南的班车。' }],
      action: { id: 'read-chen-bus-note', label: '记住这几站路', effects: [{ kind: 'clue', id: 'bus-note' }] } } },
  { id: 'ning-family-photo', label: '旧相框', x: 50.6, y: 44.1, cameraView: 'family', icon: 'look', sprite: sprite('morning-family-photo', 4.8, 6.5), completed: clue('ning-photo'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: '旧合照摆在家用柜上层，离水池远些。阿宁穿着大了一号的校服，陈伯一手提书包，一手拎蒸笼。',
      exhibit: { kind: 'photo', kicker: '相框背面 · 圆珠笔字', title: '她说长大了当老师', lines: ['阿宁穿着大了一号的校服，站在店门口。', '陈伯一手提书包，一手拎蒸笼。'] },
      action: { id: 'read-ning-family-photo', label: '把相框放回', effects: [{ kind: 'clue', id: 'ning-photo' }] } } },
  { id: 'yard-cup', label: '给两个人倒杯茶', x: 75.3, y: 62, cameraView: 'tea', icon: 'tea', sprite: sprite('morning-tea-empty', 11, 7),
    variants: [{ condition: flag('morning-tea'), asset: 'morning-tea-filled' }], completed: flag('morning-tea'),
    interaction: { kind: 'inspect', text: '吃早饭的小桌只放着碗筷和茶盘。壶里有水，两只杯子还空着。报到信和教案留在包旁边，没有压在碗底下。', options: [{ id: 'morning-pour-tea', label: '把两杯茶倒上', feedback: '阿宁端起一杯，又把另一杯往对面推了推。', effects: [{ kind: 'flag', id: 'morning-tea' }] }] } },
];
export const morning: Chapter = {
  id: 'morning', number: 2, title: '一笼早饭', subtitle: '下一笼，就出锅了。', time: '早市 · 陈家包子铺',
  description: '前头取餐，灶间蒸包子，后院洗手吃早饭。陈伯听见你的脚步，从柜台旁抬起头。', asset: 'morning-front', position: 'center', tint: 'dawn',
  questId: 'morning', metricIds: ['listening'], hotspots: [], firstScene: 'morning-front',
  objective: '帮陈伯赶完早市，再坐下来吃口热的。', next: 'noon', exitLabel: '去琴记面馆',
  exit: any({ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'quest', id: 'morning', status: 'failed' }),
  exitHint: '早饭还没端上桌。陈伯和阿宁都在等你。',
  beats: [{ label: '和陈伯打个照面', condition: flag('morning-listened') }, { label: '去后院找阿宁', condition: flag('ning-heard') }, { label: '照看下一笼', condition: flag('morning-played') }, { label: '把早饭端上桌', condition: flag('morning-ended') }],
  scenes: [
    { id: 'morning-front', title: '店门口', time: '早市 · 等候与取餐', description: '长凳给等早饭的人坐，取餐搁板和收银处各占一侧，中间仍能进出。', asset: 'morning-front', hotspots: front,
      foreground: { clipPath: 'polygon(55.3% 54.4%,100% 58%,100% 85%,56.6% 80.6%)', z: 5 },
      camera: { views: [
        { id: 'counter', label: '柜台边', x: 49.5, y: 52, zoom: 1.45 },
        { id: 'rest', label: '柜后的坐处', x: 52.2, y: 62, zoom: 1.5 },
        { id: 'waiting-seat', label: '长凳旁的小凳', x: 35, y: 77, zoom: 1.65 },
        { id: 'cashier', label: '收银小台', x: 87, y: 51, zoom: 1.8 },
        { id: 'pickup', label: '取餐搁板', x: 65, y: 56.5, zoom: 1.6 },
        { id: 'empty-basket', label: '空笼的位置', x: 79.7, y: 53, zoom: 1.6 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '掀帘，进灶间', condition: flag('morning-listened'), unavailable: '先和陈伯打个照面。' }] },
    { id: 'morning-kitchen', title: '灶间', time: '清晨 · 揉面与蒸制', description: '揉面、上汽和收纳各有位置，通向后院的路留着。', asset: 'morning-kitchen', hotspots: kitchen,
      camera: { views: [
        { id: 'stove', label: '蒸炉边', x: 73.5, y: 48, zoom: 1.6 },
        { id: 'plan', label: '墙上的备料表', x: 35.5, y: 36, zoom: 1.8 },
        { id: 'bench', label: '揉面案', x: 40.2, y: 66, zoom: 1.6 },
        { id: 'hooks', label: '入口挂钩', x: 6.3, y: 46, zoom: 1.7 },
        { id: 'storage', label: '入口干柜', x: 17.5, y: 77, zoom: 1.7 },
      ] }, links: [{ sceneId: 'morning-front', label: '回店门口' }, { sceneId: 'morning-yard', label: '穿过后门，去小院' }] },
    { id: 'morning-yard', title: '后院', time: '早市后 · 洗手与吃早饭', description: '水池靠厨房，个人纸件放在干柜和帆布包旁，饭桌留给碗筷。', asset: 'morning-yard', hotspots: yard,
      foreground: { clipPath: 'polygon(65.4% 57.2%,81.6% 57.7%,79.2% 68.7%,78.4% 90.4%,76.8% 90.2%,77% 72.4%,58.8% 71.5%,58.6% 89.7%,56.8% 89.6%,56.6% 69.5%,54.9% 66.5%)', z: 6 },
      decorations: [
        { id: 'chen-empty-seat', asset: 'prop-stool', x: 53.5, y: 89.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'ning-empty-seat', asset: 'prop-stool', x: 84, y: 89.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'family-breakfast', asset: 'morning-breakfast', x: 67, y: 64.5, width: 9, height: 5.5, z: 9, condition: flag('morning-played') },
      ],
      camera: { views: [
        { id: 'sink', label: '水池旁', x: 38.5, y: 52, zoom: 1.45 },
        { id: 'bag', label: '干凳与帆布包', x: 15.2, y: 72, zoom: 1.7 },
        { id: 'family', label: '家用柜', x: 54.5, y: 47, zoom: 1.8 },
        { id: 'chen-meal', label: '陈伯的坐处', x: 53.5, y: 59, zoom: 1.5 },
        { id: 'ning-meal', label: '阿宁的坐处', x: 84, y: 58, zoom: 1.45 },
        { id: 'ledger-meal', label: '饭桌边的账簿', x: 61.5, y: 64.5, zoom: 1.75 },
        { id: 'tea', label: '桌角的茶具', x: 75.3, y: 59.5, zoom: 1.6 },
        { id: 'departure', label: '门边的干凳', x: 27, y: 60, zoom: 1.5 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '回灶间' }] },
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
  { id: 'defer', speaker: '阿宁', portrait: 'ning', direction: '她垂下眼，指尖在袖口边搓了两下。', text: '嗯。那……明天我先早一点。\n\n小满，你的包子拿着，路上吃。', choices: [
    { id: 'morning-overpromise', label: '接过纸袋，暂且不再提。', decision: 'morning', next: 'defer-end', effects: [{ kind: 'quest', id: 'morning', status: 'failed' }, { kind: 'flag', id: 'morning-defer' }, { kind: 'flag', id: 'morning-ended' }] },
    { id: 'morning-reconsider', label: '等等，还是先坐一会儿吧。', next: 'sit-down', effects: [] },
  ] },
  { id: 'defer-end', speaker: '陈伯', direction: '他又往笼里看了一眼。', text: '行，路上慢点。跟你阿婆说一声，昨天那碗她送来的汤，挺好。\n\n阿宁，明早的面……还是照原来的数？', choices: [{ id: 'morning-defer-close', label: '在门口停了停，翻开书。', effects: [{ kind: 'clue', id: 'morning-unfinished' }] }] },
  { id: 'after', speaker: '陈伯', text: '钥匙和袋子你先拿着。下回带过来就行。\n\n你阿婆问起来，就说我今天早饭坐着吃的。', choices: [{ id: 'morning-after-bye', label: '这句我一定带到。', effects: [] }] },
];
const daughter: DialogueNode[] = [
  { id: 'hello', speaker: '阿宁', direction: '她甩了甩手上的水，用水池旁的毛巾擦干。', text: '小满？你怎么一点声都没有。\n\n我爸刚说第一笼卖完你都没来，我还以为他又留到自己忘了。', choices: [{ id: 'ning-ask-school', label: '听说你要去城南教书了。', next: 'school', effects: [{ kind: 'flag', id: 'ning-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }, { id: 'ning-hello-bye', label: '你忙，我先看看。', effects: [] }] },
  { id: 'school', speaker: '阿宁', text: '下周一报到。以前实习带的那班，班主任调走了，问我愿不愿意接。\n\n我答应的时候挺快。回家看我爸一个人搬那笼面，又想，要不再等一阵。', choices: [
    { id: 'ning-ask-plan', label: '灶间那张表，是你写的？', condition: clue('schedule'), unavailable: '去灶间看看她改过的备料表。', next: 'plan', effects: [] },
    { id: 'ning-listen', label: '你跟他说过舍不得走吗？', next: 'not-said', effects: [] },
    { id: 'ning-school-close', label: '先把早饭吃了，回头再说。', effects: [] },
  ] },
  { id: 'plan', speaker: '阿宁', text: '嗯。面先让人送来，晚半小时开。量算过了，不用他天天四点起来。\n\n我还没开口，他就说“教你的书去”。我一听也来气，剩下的话就没说。', choices: [{ id: 'ning-plan-close', label: '这个安排，吃饭时再一起说说。', effects: [{ kind: 'flag', id: 'ning-plan-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }] },
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
