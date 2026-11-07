import type { Chapter, Dialogue, Hotspot, MinigameDefinition, Condition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { chenScripts, ningScripts } from '../scripts/morning.ts';
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
  { id: 'morning-person', label: '陈伯', x: 49.5, y: 86, cameraView: 'counter', icon: 'talk', sprite: sprite('chen', 17.5, 57, 7), condition: atCounter,
    variants: [{ condition: flag('chen-has-seat'), asset: 'chen-seated', x: 49, y: 87.5, width: 20.5, height: 44.5, cameraView: 'rest' }],
    interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'morning-customer', label: '周叔留的纸条', x: 87.2, y: 55.2, cameraView: 'cashier', icon: 'letter', sprite: sprite('prop-rota', 4.8, 7.2),
    interaction: { kind: 'inspect', text: "“青菜包，两只。七点半来拿。”\n\n下面用另一支笔添着：“分两袋。她那只别压。”两只包子本就不容易混，陈伯仍将“分两袋”划了一道线。你问哪只是她那只，他没看纸：“褶收得好一点那个。老周路上吃，拿着走就行。”\n\n留单没有夹进收钱的那一摞，单独压在取餐搁板内侧。",
      action: { id: 'read-customer-order', label: '看看留单', effects: [{ kind: 'clue', id: 'breakfast-order' }] } }, completed: clue('breakfast-order') },
  inspect('front-steamer', '已经卖空的一笼', 'morning-empty-steamer', 79.7, 56.8, 12, 6.5, "笼里只剩湿布，揭开的地方印着一圈圈包子底。你数出十一个，正要再数，陈伯说这一笼是十二只。\n\n最后一只的印子被折在布底下了。他提起布角给你看，顺手将笼子让到一边：“别光数吃过的，下一笼还得腾地方。”", undefined, 'empty-basket'),
  { ...inspect('front-buns', '给早班留的包子', 'morning-reserved', 65, 59.6, 7.5, 7.2, "两只青菜包，分装在两只纸袋里。靠里的那袋包口褶得齐，外头那只压扁一点，袋子倒折得一样高。\n\n你刚碰到搁板，陈伯便说：“老周的。”随后才看见你的手没伸向包子，又补一句：“你的在后面。别以为我只给他留。”", undefined, 'pickup'), condition: not(flag('morning-played')) },
  { id: 'front-stool', label: '小凳子', x: 35, y: 80.5, cameraView: 'waiting-seat', icon: 'look', sprite: sprite('prop-stool', 7, 11, 2), condition: all(atCounter, not(flag('chen-has-seat'))), completed: flag('chen-has-seat'),
    interaction: { kind: 'inspect', text: "小凳子收在长凳底下，得把凳面转过来才能提出。新缠的布压住一条裂缝，你拎起来晃了一下，还稳。\n\n陈伯靠着柜台，将右脚往前放。有人取餐，他又站直。你看了看柜台外侧那块空地，正好能放下凳子，坐着也够得着纸袋。", options: [{ id: 'move-stool', label: '把凳子挪到柜台外侧', feedback: '“挡路。”陈伯说。等你转身，他还是坐下了。', effects: [{ kind: 'flag', id: 'chen-has-seat' }, { kind: 'metric', id: 'listening', amount: 1 }] }] } },
];
const kitchen: Hotspot[] = [
  { id: 'morning-object', label: '笼屉', x: 73.5, y: 54.1, cameraView: 'stove', icon: 'tea', sprite: sprite('morning-closed-steamer', 11, 13.5),
    variants: [{ condition: flag('morning-played'), asset: 'morning-empty-steamer', height: 8 }],
    interaction: { kind: 'minigame', gameId: 'morning-game' }, completed: flag('morning-played') },
  { id: 'morning-note', label: '阿宁改过的备料表', x: 35.5, y: 42.7, cameraView: 'plan', icon: 'look', sprite: sprite('morning-prep', 6.5, 15.8), completed: clue('schedule'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "陈家备料，原数在左，阿宁新添的时间在右。\n\n六点半，发好的面团送到门口，送货的人搬进来；先蒸两笼，七点开门。老周的两只仍单放。底下另列了送面电话，号码边上写着“先验再收”。\n\n你翻到纸背，只有一行：“爸，你先别急着说不行。”正面排得那么满，这一面却没再写下去。纸边折过几回，最后还是摊平，挂回原来的钉子上。",
      exhibit: { kind: 'note', kicker: '阿宁改过的备料表', title: '先试三天', lines: ['六点半，发好的面团送到门口。', '先验再收，两笼，七点开门。', '爸，你先别急着说不行。'] },
      action: { id: 'morning-read', label: '记下这个安排', effects: [{ kind: 'clue', id: 'schedule' }] } } },
  inspect('kneading-board', '擀面板', 'morning-board', 40.2, 70.5, 24, 10.5, "案板上有几道刀印。平常撒了面粉看不出来，陈伯把面团往边上一收，深浅不一的印子才露出来。\n\n最外面那道横得很直，像专门划的。你用手指比了一下，陈伯说从前分剂子总切得一头大、一头小，先刻一段作准。后来不看也能分匀，这道线还留着。\n\n他把你比在线边的手拨开：“手洗了再摸。线刻得准，也没叫你照着我的分量吃。”", 'board-marks', 'bench'),
  inspect('work-apron', '洗得发白的围裙', 'prop-apron', 6.3, 55.3, 8, 20, "围裙口袋里两颗水果糖，糖纸外沾着面粉。你刚碰到，陈伯隔着门说：“拿一颗，别一把掏。”\n\n你问是不是都当你六岁。他说不是，糖剩两颗，待会儿还有个小的来。说完，又问你要酸的还是甜的——隔得这么远，倒记得两颗不一样。", undefined, 'hooks'),
  inspect('chen-knee', '折起来的护膝', 'prop-brace', 19.5, 89.3, 4, 6.2, "护膝折在柜下的干格里，魔术贴扣着，不会勾住别的东西。盒盖内侧贴着阿宁的字：“走楼梯的时候戴着。”\n\n旁边有个“好”，写得很小，像找不到地方才挤上去的。你翻了翻，护膝内侧已经起了一点毛，跟盒子看起来的新旧不一样。戴过没有，不能只看它今天收在哪里。", 'knee-note', 'storage'),
  { id: 'cabinet', label: '借一只保温袋', x: 16, y: 71.5, cameraView: 'storage', icon: 'book', sprite: sprite('prop-bag', 8, 13), condition: not(holdingBag), completed: holdingBag,
    interaction: { kind: 'inspect', text: "保温袋搭在干柜门外，提手绕过门把。你扯了一下才发现绕着两圈，得先把上面那圈松开。\n\n陈伯看见钥匙：“还真给你找出来了。你阿婆上回说没丢，我说没丢就拿给我看，后来谁也没想起这回事。”\n\n袋里是空的。底部一块旧油印已经洗不掉，除此之外擦得干净。陈伯让你先借去，又交代书放外层：“那本子你阿婆缝半天，别给我带回一袋肉汤味。”", options: [
      { id: 'borrow-with-key', onceKey: 'borrow-bag', label: '给陈伯看过钥匙，借走保温袋', condition: { kind: 'item', id: 'small-key' }, unavailable: '问问陈伯，也能借。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
      { id: 'borrow-by-asking', onceKey: 'borrow-bag', label: '问陈伯借来用一天', condition: flag('morning-listened'), unavailable: '先和陈伯说一声。', effects: [{ kind: 'item', id: 'insulated-bag', amount: 1 }] },
    ] } },
];
const yard: Hotspot[] = [
  { id: 'chen-yard', label: '陈伯', x: 49.3, y: 92, cameraView: 'chen-meal', icon: 'talk', sprite: sprite('chen-seated', 21, 44.5, 7), condition: atMeal, interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'ning', label: '阿宁', x: 38.5, y: 86, cameraView: 'sink', icon: 'talk', sprite: sprite('ning', 17.5, 59.5, 7),
    variants: [{ condition: atMeal, asset: 'ning-seated', x: 84, y: 90, width: 20, height: 44.5, cameraView: 'ning-meal' }, { condition: flag('morning-defer'), x: 27, y: 87, cameraView: 'departure' }],
    interaction: { kind: 'dialogue', dialogueId: 'ning-talk' } },
  { id: 'school-letter', label: '新学校的报到信', x: 15.2, y: 77.2, cameraView: 'bag', icon: 'letter', sprite: sprite('morning-school-letter', 8, 6.5), completed: clue('school-letter'),
    interaction: { kind: 'inspect', manipulation: 'unfold', text: "报到信在帆布包旁边，信封里还装着一张孩子画的教室。画纸太大，折了一道，阿宁又在折口背面贴过透明胶。\n\n“陈老师，给你留了靠窗的座位。”那把椅子画得比学生的都大，桌子却只有三条腿。你想问第四条去了哪里，阿宁先说，画的人专门交代过，被桌子挡住了，不是忘了。\n\n正式信纸上列着下周一的报到时间和要带的教案。她把两张纸分开折，仍装在同一个信封里。",
      exhibit: { kind: 'letter', kicker: '新学校的报到信', title: '下周一，城南小学', lines: ['报到时，带上教案。', '她要赶六点十分的班车。', '孩子的卡片上写着：陈老师，给你留了靠窗的座位。'] },
      action: { id: 'read-school-letter', label: '把信折好放回', effects: [{ kind: 'clue', id: 'school-letter' }] } } },
  { id: 'chen-bus-note', label: '陈伯抄的班车表', x: 57.2, y: 51.3, cameraView: 'family', icon: 'look', sprite: sprite('prop-ledger', 8.5, 6.2), completed: clue('bus-note'),
    variants: [{ condition: atMeal, asset: 'morning-ledger-flat', x: 61.5, y: 66, cameraView: 'ledger-meal', width: 9, height: 3.6 }],
    interaction: { kind: 'inspect', manipulation: 'book', text: "账本最后一页没有钱数。\n\n“六点十分”，下划线描过两遍。站名抄了三回，前两回不一样，第三回旁边打勾。再下面另起一行：“下雨到桥下等。”\n\n豆沙，放保温袋。\n\n你把页角压平，才发现这几个字不是写在一起的：班车的字发灰，豆沙的笔色深，末尾又添了一小笔。陈伯前头说阿宁顾着安排他自己，账本却没有跟着拿给她看。",
      exhibit: { kind: 'book', kicker: '最后一页 · 陈伯的字', title: '账簿', lines: ['城南小学 · 六点十分。', '下雨到桥下等。', '豆沙，放保温袋。'] },
      versions: [{ condition: atMeal, text: "账本摊在饭桌上，最后一页朝着阿宁。六点十分、改过的站名、下雨到桥下等，还有最后添的豆沙，几行字现在都看得清。\n\n她先看站名，接着看父亲。陈伯拿起杯子，没有喝。你压住快要翘起来的页角，等他们自己开口。" }],
      action: { id: 'read-chen-bus-note', label: '记住这几站路', effects: [{ kind: 'clue', id: 'bus-note' }] } } },
  { id: 'ning-family-photo', label: '旧相框', x: 50.6, y: 44.1, cameraView: 'family', icon: 'look', sprite: sprite('morning-family-photo', 4.8, 6.5), completed: clue('ning-photo'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "阿宁穿着大一号的校服，站在铺门前。书包由陈伯提着，包带绕在他手上两圈，底下仍快挨到地。\n\n你把相框翻过来，背面写着：“她说长大了当老师。”没有日期。阿宁说是她爸写的，当时怕她改主意，非要留个凭据。\n\n她说完笑了一下：“等我真去，他倒不拿这个问我了。”",
      exhibit: { kind: 'photo', kicker: '相框背面 · 圆珠笔字', title: '她说长大了当老师', lines: ['阿宁穿着大了一号的校服，站在店门口。', '陈伯一手提书包，一手拎蒸笼。'] },
      action: { id: 'read-ning-family-photo', label: '把相框放回', effects: [{ kind: 'clue', id: 'ning-photo' }] } } },
  { id: 'yard-cup', label: '给两个人倒杯茶', x: 75.3, y: 62, cameraView: 'tea', icon: 'tea', sprite: sprite('morning-tea-empty', 11, 7),
    variants: [{ condition: flag('morning-tea'), asset: 'morning-tea-filled' }], completed: flag('morning-tea'),
    interaction: { kind: 'inspect', text: "一壶、两只空杯，摆在碗外边。你拿壶时，发现另一只杯子里放着一片姜。阿宁说是她爸要的，昨晚还说别切太厚，今天摆出来，又没来喝。\n\n壶还有些温。先倒少一点，等他们坐下，可以再添。", options: [{ id: 'morning-pour-tea', label: '把两杯茶倒上', feedback: '阿宁端起一杯，又把另一杯往对面推了推。', effects: [{ kind: 'flag', id: 'morning-tea' }] }] } },
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
        { id: 'rest', label: '柜台外侧的坐处', x: 49, y: 63, zoom: 1.5 },
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
        { id: 'chen-empty-seat', asset: 'prop-stool', x: 49.3, y: 91.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'ning-empty-seat', asset: 'prop-stool', x: 84, y: 89.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'family-breakfast', asset: 'morning-breakfast', x: 67, y: 64.5, width: 9, height: 5.5, z: 9, condition: flag('morning-played') },
      ],
      camera: { views: [
        { id: 'sink', label: '水池旁', x: 38.5, y: 52, zoom: 1.45 },
        { id: 'bag', label: '干凳与帆布包', x: 15.2, y: 72, zoom: 1.7 },
        { id: 'family', label: '家用柜', x: 54.5, y: 47, zoom: 1.8 },
        { id: 'chen-meal', label: '陈伯的坐处', x: 49.3, y: 60, zoom: 1.5 },
        { id: 'ning-meal', label: '阿宁的坐处', x: 84, y: 58, zoom: 1.45 },
        { id: 'ledger-meal', label: '饭桌边的账簿', x: 61.5, y: 64.5, zoom: 1.75 },
        { id: 'tea', label: '桌角的茶具', x: 75.3, y: 59.5, zoom: 1.6 },
        { id: 'departure', label: '门边的干凳', x: 27, y: 60, zoom: 1.5 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '回灶间' }] },
  ],
};

const father: DialogueSeed[] = [
  { id: 'invite', speaker: '陈伯',   choices: [{ id: 'morning-invite', label: '端上碗，去后院。', effects: [{ kind: 'flag', id: 'chen-at-table' }] }] },
  { id: 'opening', speaker: '陈伯',   choices: [
    { id: 'morning-listen', label: "还没吃。阿宁今天也在？", next: 'concern', effects: [{ kind: 'flag', id: 'morning-listened' }, { kind: 'metric', id: 'listening', amount: 1 }] },
    { id: 'morning-shared-memory', label: '阿婆说起那个“月亮包子”了。', condition: clue('chen-memory'), unavailable: '还没想起这件旧事。', next: 'old-photo', effects: [] },
    { id: 'morning-bye', label: '我先看看，你忙。', effects: [] },
  ] },
  { id: 'old-photo', speaker: '陈伯',   choices: [{ id: 'morning-memory-return', label: "还是算了。这回我看锅。", next: 'concern', effects: [{ kind: 'flag', id: 'chen-recognized' }, { kind: 'flag', id: 'morning-listened' }, {kind:'metric',id:'listening',amount:1}] }] },
  { id: 'concern', speaker: '陈伯',   choices: [
    { id: 'morning-ask-knee', label: '那你这腿呢？', condition: clue('knee-note'), unavailable: '还没留意到护膝。', next: 'knee', effects: [] },
    { id: 'morning-ask-old-hours', label: '还是每天六点开？', next: 'hours', effects: [] },
    { id: 'morning-thanks', label: '我去后头打个招呼。', effects: [] },
  ] },
  { id: 'hours', speaker: '陈伯',   choices: [{ id: 'morning-hours-end', label: '下一笼我帮你看。', effects: [{ kind: 'clue', id: 'old-customer' }] }] },
  { id: 'knee', speaker: '陈伯',   choices: [{ id: 'morning-knee-end', label: '那你数包子，我去找凳子。', effects: [] }] },
  { id: 'before-food', speaker: '陈伯',   choices: [
    { id: 'morning-back-to-talk', label: "阿宁安排你的那张表，到底改了什么？", next: 'concern', effects: [] },
    { id: 'morning-return-stove', label: "肉的，放碗里。我记下了。", effects: [] },
    { id: 'morning-decide', label: '早饭好了，我们去后院吃。', condition: flag('morning-played'), unavailable: '先把这一笼照看好。', next: 'table', effects: [] },
  ] },
  { id: 'table', speaker: '陈伯',   choices: [
    { id: 'morning-show-papers', label: "阿宁，你把表拿来，跟账本并着放吧。", condition: all(clue('schedule'), clue('bus-note'), { kind: 'metric', id: 'listening', min: 4 }), unavailable: '两张纸要看齐，也得听阿宁把安排说完。', next: 'papers', effects: [] },
    { id: 'morning-table-first', label: '先坐下来吃吧。包子快凉了。', next: 'sit-down', effects: [] },
    { id: 'morning-later-plan', label: '先照旧开门，等开学后再看看。', next: 'defer', effects: [] },
  ] },
  { id: 'papers', speaker: '阿宁', portrait: 'ning',   choices: [{ id: 'morning-let-father-answer', label: "等陈伯答。", next: 'bus', effects: [] }] },
  { id: 'bus', speaker: '陈伯',   choices: [{ id: 'morning-let-ning-answer', label: "把送面那张表留在中间，等阿宁接着说。", next: 'trial', effects: [] }] },
  { id: 'trial', speaker: '阿宁', portrait: 'ning',   choices: [
    { id: 'morning-agree', label: "好，先试三天。电话留给陈伯。", decision: 'morning', next: 'trial-end', effects: [{ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'flag', id: 'morning-plan' }, { kind: 'flag', id: 'morning-ended' }, { kind: 'metric', id: 'listening', amount: 1 }] },
    { id: 'morning-leave-to-them', label: "表先放着，我把早饭端近一点。", next: 'sit-down', effects: [] },
  ] },
  { id: 'trial-end', speaker: '陈伯',   choices: [{ id: 'morning-trial-close', label: "等他们吃上，再收书。", effects: [{ kind: 'clue', id: 'morning-record' }] }] },
  { id: 'sit-down', speaker: '阿宁', portrait: 'ning',   choices: [{ id: 'morning-table-agree', label: '把最后一只肉包放进陈伯的碗。', decision: 'morning', next: 'table-end', effects: [{ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'flag', id: 'morning-table' }, { kind: 'flag', id: 'morning-ended' }] }] },
  { id: 'table-end', speaker: '陈伯',   choices: [{ id: 'morning-table-close', label: '在桌边坐一会儿。', effects: [{ kind: 'clue', id: 'morning-record' }] }] },
  { id: 'defer', speaker: '阿宁', portrait: 'ning',   choices: [
    { id: 'morning-overpromise', label: '接过纸袋，暂且不再提。', decision: 'morning', next: 'defer-end', effects: [{ kind: 'quest', id: 'morning', status: 'failed' }, { kind: 'flag', id: 'morning-defer' }, { kind: 'flag', id: 'morning-ended' }] },
    { id: 'morning-reconsider', label: '等等，还是先坐一会儿吧。', next: 'sit-down', effects: [] },
  ] },
  { id: 'defer-end', speaker: '陈伯',   choices: [{ id: 'morning-defer-close', label: '在门口停了停，翻开书。', effects: [{ kind: 'clue', id: 'morning-unfinished' }] }] },
  { id: 'after', speaker: '陈伯',   choices: [{ id: 'morning-after-bye', label: "那我先写做法，别的用小字。", effects: [] }] },
];
const daughter: DialogueSeed[] = [
  { id: 'hello', speaker: '阿宁',   choices: [{ id: 'ning-ask-school', label: '听说你要去城南教书了。', next: 'school', effects: [{ kind: 'flag', id: 'ning-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }, { id: 'ning-hello-bye', label: '你忙，我先看看。', effects: [] }] },
  { id: 'school', speaker: '阿宁',   choices: [
    { id: 'ning-ask-plan', label: '灶间那张表，是你写的？', condition: clue('schedule'), unavailable: '去灶间看看她改过的备料表。', next: 'plan', effects: [] },
    { id: 'ning-listen', label: "他知道你舍不得吗？", next: 'not-said', effects: [] },
    { id: 'ning-school-close', label: '先把早饭吃了，回头再说。', effects: [] },
  ] },
  { id: 'plan', speaker: '阿宁',   choices: [{ id: 'ning-plan-close', label: '这个安排，吃饭时再一起说说。', effects: [{ kind: 'flag', id: 'ning-plan-heard' }, { kind: 'metric', id: 'listening', amount: 1 }] }] },
  { id: 'not-said', speaker: '阿宁',   choices: [{ id: 'ning-listen-close', label: "你今天那只豆沙，也还没吃。", effects: [{ kind: 'clue', id: 'ning-breakfast' }] }] },
  { id: 'ready', speaker: '阿宁',   choices: [{ id: 'ning-ready-bye', label: '好，今天把他叫来。', effects: [] }] },
  { id: 'after', speaker: '阿宁',   choices: [{ id: 'ning-after-bye', label: "那我留好空白，够他讲一阵。", effects: [] }] },
];
export const morningDialogues: Dialogue[] = [
  { id: 'morning-talk', entry: 'opening', entries: [{ condition: flag('morning-ended'), nodeId: 'after' }, { condition: all(flag('morning-played'), { kind: 'not', condition: flag('chen-at-table') }), nodeId: 'invite' }, { condition: flag('morning-played'), nodeId: 'table' }, { condition: flag('morning-listened'), nodeId: 'before-food' }], nodes: father.map(n => scriptNode({ portrait: 'chen', ...n }, chenScripts[n.id])) },
  { id: 'ning-talk', entry: 'hello', entries: [{ condition: flag('morning-ended'), nodeId: 'after' }, { condition: flag('morning-played'), nodeId: 'ready' }, { condition: flag('ning-heard'), nodeId: 'school' }], nodes: daughter.map(n => scriptNode({ portrait: 'ning', ...n }, ningScripts[n.id])) },
];
export const morningGame: MinigameDefinition = {
  id: 'morning-game', chapterId: 'morning', module: 'breakfast', title: '下一笼', target: 75,
  description: '老周的两只菜包、阿宁的豆沙，还有陈伯自己的那一只。先配好，再看一会儿火。',
  condition: all(flag('morning-listened'), flag('ning-heard')), unavailable: '陈伯和阿宁还没交代清楚要留哪几份。',
  breakfast: { fillings: ['青菜', '豆沙', '鲜肉'], orders: [{ id: 'zhou', person: '周叔带走', hint: '给老伴，清淡些。', filling: '青菜', count: 2 }, { id: 'ning', person: '阿宁的碗', hint: '她从小爱吃甜的。', filling: '豆沙', count: 1 }, { id: 'chen', person: '陈伯的碗', hint: '留一只肉的，别全卖了。', filling: '鲜肉', count: 1 }] },
  reward: { id: 'morning-game-reward', label: '出笼了', feedback: '阿宁把周叔的纸袋折好，放在门口。剩下两碗，她一只手端一碗，往后院走。“爸，你也来。”', effects: [{ kind: 'flag', id: 'morning-played' }, { kind: 'metric', id: 'listening', amount: 1 }] },
};
