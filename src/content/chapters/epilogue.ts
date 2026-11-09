import type { Chapter, Condition, Dialogue, Hotspot, MinigameDefinition, Ending } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { epilogueScripts } from '../scripts/epilogue.ts';
import { shopRecords } from '../epilogue-records.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const chosen: Condition = { kind: 'any', conditions: ['breakfast', 'call', 'book'].map(id => flag(`epilogue-${id}`)) };
const beforeMorning: Condition = { kind: 'not', condition: flag('epilogue-night-finished') };
const pages = all(...shopRecords.map(r => flag(`epilogue-read-${r.id}`)));
const ready = all(pages, flag('epilogue-filed'), flag('epilogue-ticket-read'), flag('epilogue-reviewed'));
const person = (id: string, dialogueId: string): Hotspot => ({ id, label: '奶奶', x: 65, y: 96, icon: 'talk', sprite: { asset: 'epilogue-grandma', width: 25, height: 71, z: 5 }, interaction: { kind: 'dialogue', dialogueId } });
const storePages: Hotspot[] = shopRecords.map((r, i) => ({
  id: `epilogue-page-${r.id}`, label: `${r.title} · 店签`, x: 18 + i * 4, y: 64.5, icon: 'book', condition: flag('epilogue-greeted'),
  cameraView: 'pages', sprite: { asset: `epilogue-tab-${r.id}`, width: 2.8, height: 5.5, z: 7 + i }, completed: flag(`epilogue-read-${r.id}`),
  interaction: { kind: 'inspect', manipulation: 'book', text: r.fallback,
    exhibit: { kind: 'book', kicker: '今天的店签', title: r.title, lines: [r.fallback] },
    versions: r.rows.map(([id, text]) => ({ condition: flag(id!), text: text!, exhibit: { kind: 'book' as const, kicker: '奶奶用尺子压着书页', title: r.title, lines: [text!], caption: ['“那明早我还能六点去买包子吗？”试行就照试行的说，未定的别添上。', '“半份呢？我吃不下一整碗。”半份、不要葱的札子另夹在纸夹里。', '奶奶摸到折起的札子：“这一张要夹进去？”'][i] } })),
    action: { id: `epilogue-read-${r.id}`, label: '读这一页给奶奶听', effects: [{ kind: 'flag', id: `epilogue-read-${r.id}` }] },
  },
}));
export const epilogue: Chapter = {
  id: 'epilogue', number: 5, title: '灯下', subtitle: '祖母还没睡。', time: '夜深',
  description: '奶奶还没睡。你推门进来，她先问洗没洗手，说连带回来的书都有股饭味。檐下的灯往桌边挪了一点，两只杯子挨着摆。你把书放到干处，抽出今天新添的几页。',
  asset: 'epilogue-night', position: 'center', tint: 'night', objective: '读清三家店的近况，理好短札，再和奶奶商量明早。',
  questId: 'epilogue', metricIds: [], hotspots: [],
  firstScene: 'epilogue-yard', exit: all(chosen, flag('epilogue-morning-seen')), exitLabel: '收好今天这一页', exitHint: '读齐店签、整理短札，和奶奶说清车次，再去次晨院门。',
  beats: [{ label: '回院打照面', condition: flag('epilogue-greeted') }, { label: '翻齐三张店签', condition: pages }, { label: '把三张札放对地方', condition: flag('epilogue-filed') }, { label: '约好下一步', condition: chosen }],
  scenes: [
    { id: 'epilogue-yard', title: '桂花小院', asset: 'epilogue-night', description: '门闩碰过一声，院里便又静下来。奶奶往檐下让出半张凳子，壶里刚换过热水。门边那只木钩还空着，袋子能挂在这里。', links: [{ sceneId: 'epilogue-table', label: '到檐下长桌', condition: all(flag('epilogue-greeted'), beforeMorning), unavailable: '先和奶奶打招呼；天亮后不再回到昨夜。' }, { sceneId: 'epilogue-gate', label: '收好纸笔，歇到天亮', condition: all(chosen, flag('epilogue-night-finished')), unavailable: '把今晚的事说定，再歇下。' }], hotspots: [
      person('epilogue-grandmother', 'epilogue-home'),
      { id: 'epilogue-tea', label: '热茶', x: 44, y: 58, icon: 'tea', sprite: { asset: 'epilogue-tea', width: 10, height: 10, z: 7 }, interaction: { kind: 'inspect', text: '奶奶翻开两只杯子，先倒了离你近的那只。杯耳朝着她，你伸手想往她那边推，她却把热的那杯换过来：“你的。我的刚才喝过，还不凉。”', options: [{ id: 'epilogue-offer-tea', label: '先把茶推给奶奶', effects: [{ kind: 'flag', id: 'epilogue-tea-offered' }], feedback: '奶奶把热的那杯换到你手边：“你先喝。”' }] } },
      { id: 'epilogue-calendar', label: '日历', x: 21, y: 43, icon: 'look', sprite: { asset: 'epilogue-calendar', width: 6, height: 15, z: 4 }, interaction: { kind: 'inspect', manipulation: 'flip', text: '“接小满”下面添了今日的勾。周日那格还空着，带问号的通话札压在纸夹里。奶奶没有先把它抄上去。', versions: [{ condition: flag('epilogue-call'), text: '周日那格添了“一点”。这是刚才两人一起定下的时间，车次单背面也抄了一遍。' }] } },
      { id: 'epilogue-bag', label: '陈伯的保温袋', x: 90, y: 86, icon: 'look', condition: { kind: 'item', id: 'insulated-bag' }, sprite: { asset: 'prop-bag', width: 8, height: 19, z: 4 }, interaction: { kind: 'inspect', text: '你把借来的袋子搭在门边。奶奶拉开提手，让它不再叠着：“早上路过巷口，我还给他。你别塞回包里，明早又一块带走。”', action: { id: 'epilogue-hang-bag', label: '把袋子挂好', effects: [{ kind: 'flag', id: 'epilogue-bag-hung' }] } } },
    ] },
    { id: 'epilogue-table', camera: { views: [{ id: 'pages', label: '灯下的书页', x: 43, y: 62, zoom: 1.04 }, { id: 'grandma', label: '桌边的奶奶', x: 77.5, y: 60, zoom: 1.04 }] }, decorations: [{ id: 'epilogue-open-book', asset: 'epilogue-book', x: 38, y: 70, width: 26, height: 17, z: 3 }, { id: 'epilogue-table-lamp', asset: 'night-lamp-on', x: 19, y: 60, width: 6, height: 17, z: 4 }, { id: 'epilogue-table-tea', asset: 'epilogue-tea', x: 52, y: 59, width: 10, height: 10, z: 4 }], title: '檐下长桌', time: '当晚 · 灯下整理', asset: 'epilogue-table-night', description: '书里记做法，纸夹里等回话，私札留在信封里。', links: [{ sceneId: 'epilogue-yard', label: '起身回院里', condition: beforeMorning, unavailable: '已经收好纸笔，接下来是次晨。' }, { sceneId: 'epilogue-gate', label: '收好纸笔，歇到天亮', condition: all(chosen, flag('epilogue-night-finished')), unavailable: '先把下一步说定，听完当晚的话。' }], hotspots: [
      { ...person('epilogue-table-grandma', 'epilogue-table-talk'), x: 77.5, y: 85, cameraView: 'grandma', sprite: { asset: 'epilogue-grandma-table', width: 21, height: 58, z: 5 } }, ...storePages,
      { id: 'epilogue-phone', label: '尚未发出的简历', x: 49, y: 65.5, icon: 'look', condition: clue('job-gap'), sprite: { asset: 'arrival-phone', width: 3.8, height: 5.4, z: 9 }, interaction: {
        kind: 'inspect', manipulation: 'phone',
        text: '手机亮了一下，简历还停在“能够适应”那半句。上一份工作的结束日期仍写着“至今”。你点进那一格，键盘弹出来，奶奶隔着桌子问谁发消息。\n\n“没有，我在改东西。”\n\n“那你改。等会儿要吃米酒就叫我，锅还在厨房。”她没再问，拿起刚才的针线。',
        exhibit: { kind: 'note', title: '尚未发出的简历', kicker: '手机里的草稿', phone: { time: '23:18', heading: '简历 · 未发送', footer: '个人简介仍未写完' }, lines: ['个人简介：能够适应……', '上一份工作：结束日期仍为“至今”'], footer: '可以只改这一项，也可以今晚先放一放。' },
        versions: [{ condition: flag('epilogue-updated-date'), text: '结束日期已经改成真正离职的那天。个人简介没动，简历也没有发出去。你看了一遍，保存草稿，将手机扣回桌上。奶奶把热水往你手边推了一点，问这下能不能先喝两口。', exhibit: { kind: 'note', title: '已经保存的草稿', kicker: '手机里的草稿', phone: { time: '23:18', heading: '简历 · 未发送', footer: '已保存草稿，尚未发送' }, lines: ['个人简介：能够适应……', '上一份工作：结束日期已改为实际离职日期'], footer: '其余的，今晚没有接着改。' } }],
        options: [{ id: 'epilogue-update-date', label: '把结束日期改对，保存草稿。', condition: not(flag('epilogue-updated-date')), effects: [{ kind: 'flag', id: 'epilogue-updated-date' }], feedback: '你把“至今”删掉，填回真正离职的日期，保存了草稿。个人简介仍留着半句，手机这回先扣在桌上。' }],
      } },
      { id: 'epilogue-slips', label: '三张短札', x: 56, y: 67, icon: 'letter', sprite: { asset: 'epilogue-slips', width: 9, height: 7, z: 10 }, condition: pages, completed: flag('epilogue-filed'), interaction: { kind: 'minigame', gameId: 'epilogue-filing' } },
      { id: 'epilogue-ticket', label: '车次单', x: 23, y: 72, icon: 'letter', sprite: { asset: 'epilogue-ticket', width: 8, height: 5, z: 10 }, interaction: { kind: 'dialogue', dialogueId: 'epilogue-departure' } },
    ] },
    { id: 'epilogue-gate', tint: 'dawn', decorations: [
      { id: 'epilogue-breakfast-grandma', asset: 'epilogue-grandma', x: 45, y: 98, width: 19, height: 61, z: 4, condition: flag('epilogue-breakfast') },
    ], title: '次晨 · 院门', time: '次晨 · 临出门前', asset: 'epilogue-gate-dawn', description: '院门已经打开。昨夜说定的事，留在书页和车次单上。',
    variants: [
      { condition: flag('epilogue-breakfast'), time: '次晨九点 · 留下吃早饭', description: '改到十一点十分的车还来得及。先坐回檐下，听锅盖响。' },
      { condition: flag('epilogue-call'), time: '次晨 · 赶八点二十的车', description: '车次单背面抄着“周日一点”。从门槛跨出去，奶奶在院里又问了一声。' },
      { condition: flag('epilogue-book'), time: '次晨 · 书先留在这里', description: '书留在檐下。小满已经走到门槛，奶奶递来落下的外套。' },
    ], links: [], hotspots: [
      { id: 'epilogue-morning', label: '次晨这一幕', x: 26, y: 68.5, icon: 'look', sprite: { asset: 'epilogue-book', width: 11, height: 7, z: 6 }, variants: [{ condition: flag('epilogue-breakfast'), asset: 'epilogue-bowls', x: 30, y: 73, width: 13, height: 10 }, { condition: flag('epilogue-call'), asset: 'epilogue-ticket', x: 67, y: 83, width: 9, height: 6 }, { condition: flag('epilogue-book'), asset: 'epilogue-jacket', x: 67, y: 83, width: 12, height: 11 }], interaction: { kind: 'inspect', text: '书放在桌上，纸页压平了。', versions: [
        { condition: flag('epilogue-breakfast'), text: '九点，锅盖响起来。你已经穿好衣服，听见奶奶在厨房找碗，便过去打开碗橱。\n\n“上头那两只，干净的。”\n\n你端着碗出来，先把桌边的书挪到干处。十一点十分的车还来得及，包可以先放在门边。' },
        { condition: flag('epilogue-call'), text: '你在门槛外换了换提包的手。奶奶从院里问：“那张纸带上没？”\n\n你拍了拍胸口的兜，抽出来给她看。车次在正面，背面“周日一点”顺着折痕分成两半，摊开才能看全。\n\n“带着呢。”你折回原样，没有把它混进包里那摞票据。' },
        { condition: flag('epilogue-book'), text: '你刚跨出门，奶奶就叫了一声。外套还落在椅背上，她提着送过来，袖子翻在里面。\n\n“等一下，我给你捋过来。”\n\n你把包放下，接住另一只袖子。桌上的书已经合好，书签仍压着昨晚那页，旁边放着一支笔。' },
      ], action: { id: 'epilogue-see-morning', label: '看完次晨这一幕', condition: all(chosen, flag('epilogue-night-finished')), effects: [{ kind: 'flag', id: 'epilogue-morning-seen' }] } } },
    ] },
  ],
};

const tableExtras: DialogueSeed['choices'] = [
  { id: 'epilogue-open-stories', label: '坐一会儿，讲讲今天的事。', next: 'stories', effects: [] },
  { id: 'epilogue-check-recipes', label: '把新添的食谱念给你听。', next: 'recipes', effects: [] },
];
const tableNodes: DialogueSeed[] = [
  { id: 'table', speaker: '奶奶', choices: [{ id: 'epilogue-turn-pages', label: '先一页一页读给你听。', effects: [] }, ...tableExtras] },
  { id: 'filed', speaker: '奶奶', choices: [{ id: 'epilogue-reviewed', label: '去看车次单。', effects: [{ kind: 'flag', id: 'epilogue-reviewed' }] }, { id: 'epilogue-continue-book', label: '这本书以后怎样续记？', next: 'continuation', effects: [] }, ...tableExtras.map(c => ({ ...c, id: `${c.id}-filed` }))] },
  { id: 'continuation', speaker: '奶奶', choices: [{ id: 'epilogue-back-filed', label: '写日期。没说定的，就先夹着。', next: 'filed', effects: [] }] },
  { id: 'stories', speaker: '奶奶', choices: [
    { id: 'epilogue-tell-chen', label: '陈伯今天叫我包了一只肉的。', next: 'chen', condition: flag('morning-played'), effects: [] },
    { id: 'epilogue-tell-qin', label: '琴姐那儿，今天差点忙乱套。', next: 'qin', condition: flag('noon-played'), effects: [] },
    ...[['pickup', 'night-pickup'], ['cancelled', 'night-called-off'], ['missed', 'night-missed'], ['legacy', 'night-legacy']].map(([id, result]) => ({ id: `epilogue-tell-night-${id}`, label: '夜饭馆那盏灯，十一点就关。', next: `night-${id}`, condition: flag(result!), effects: [] })),
    { id: 'epilogue-tell-self', label: '先讲我自己吧。', next: 'self', effects: [] },
    { id: 'epilogue-tell-photo', label: '翻到旧合照，讲讲那只月亮包子。', next: 'photo', condition: all(clue('family-photo'), flag('morning-played')), effects: [] },
    { id: 'epilogue-stories-close', label: '今天先讲这些，剩下的改天。', effects: [] },
  ] },
  ...['chen', 'qin', 'night-pickup', 'night-cancelled', 'night-missed', 'night-legacy', 'self', 'photo'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-story-back-${id}`, label: '再讲点别的。', next: 'stories', effects: [{ kind: 'flag' as const, id: 'epilogue-story-told' }] }] })),
  { id: 'recipes', speaker: '奶奶', choices: [
    ...[['chen', 'morning-played', '陈家的包子。'], ['qin', 'noon-played', '琴记的汤面。'], ['night', 'night-played', '许叔的豆腐烧菜饭。']].map(([id, result, label]) => ({ id: `epilogue-read-recipe-${id}`, label: label!, next: `recipe-${id}`, condition: flag(result!), effects: [] })),
    { id: 'epilogue-recipes-close', label: '先把书页放平，歇一会儿。', effects: [] },
  ] },
  ...['chen', 'qin', 'night'].map(id => ({ id: `recipe-${id}`, speaker: '奶奶', choices: [{ id: `epilogue-recipe-back-${id}`, label: '翻翻别的食谱。', next: 'recipes', effects: [{ kind: 'flag' as const, id: 'epilogue-recipes-checked' }] }] })),
];
const departureNodes: DialogueSeed[] = [
  { id: 'ticket', speaker: '奶奶', choices: [{ id: 'epilogue-times', label: '记清车次和你的空当。', next: 'options', effects: [{ kind: 'flag', id: 'epilogue-ticket-read' }] }] },
  { id: 'options', speaker: '小满', choices: [
    { id: 'epilogue-ask-calendar', label: '日历上那句“别问工作”……', condition: clue('calendar'), next: 'calendar', effects: [] },
    { id: 'epilogue-ask-apron', label: '阿川说起回来帮忙的那天。', condition: clue('chuan-return'), next: 'apron', effects: [] },
    { id: 'epilogue-ask-both', label: '想起你的茶和琴姐的围裙。', condition: all(clue('calendar'), clue('chuan-return')), next: 'both', effects: [] },
    { id: 'epilogue-tell-riceball', label: '有一回我回你“快了”……', condition: clue('night-riceball'), next: 'riceball', effects: [{ kind: 'flag', id: 'epilogue-riceball-told' }] },
    ...['breakfast', 'call', 'book'].map(id => ({ id: `epilogue-confirm-${id}`, label: id === 'breakfast' ? '我改坐晚一班，九点跟你吃早饭。' : id === 'call' ? '我照原班走，周日午饭后给你打电话。' : '我照原班走。书先放你这儿，下次的事再说。', decision: 'epilogue', next: id, condition: ready, unavailable: '先翻齐三页、归好短札，再听奶奶说完。', effects: [{ kind: 'flag' as const, id: `epilogue-${id}` }] })),
    { id: 'epilogue-wait', label: '先回桌边看看，等会儿再定。', effects: [] },
  ] },
  ...['calendar', 'apron', 'both', 'riceball'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-back-${id}`, label: '把话说完，再看车次。', next: 'options', effects: [] }] })),
  ...['breakfast', 'call', 'book'].map(id => ({ id, speaker: '奶奶', choices: [{ id: `epilogue-finish-${id}`, label: '收好纸笔，等天亮。', effects: [{ kind: 'flag' as const, id: 'epilogue-night-finished' }] }] })),
];
// The returning topic menus are finite: each question consumes its original
// action key, and an interrupted answer resumes before the menu is shown again.
function boundedTopics(seeds: DialogueSeed[], menus: string[], targets?: string[]): NonNullable<Dialogue['entries']> {
  const entries: NonNullable<Dialogue['entries']> = [];
  for (const menu of seeds.filter(n=>menus.includes(n.id))) for (const choice of menu.choices) {
    if (!choice.next || choice.decision || targets && !targets.includes(choice.next)) continue;
    const target=seeds.find(n=>n.id===choice.next)!;
    const back=target.choices.find(c=>c.next===menu.id);
    if(!back)continue;
    const key=choice.onceKey??choice.id;
    choice.condition=all(...(choice.condition?[choice.condition]:[]),not({kind:'reward',id:key}));
    entries.push({condition:all({kind:'reward',id:key},not({kind:'reward',id:back.onceKey??back.id})),nodeId:target.id});
  }
  return entries;
}
const pendingTable=boundedTopics(tableNodes,['stories','recipes','filed'],['chen','qin','night-pickup','night-cancelled','night-missed','night-legacy','self','photo','recipe-chen','recipe-qin','recipe-night','continuation']);
const pendingDeparture=boundedTopics(departureNodes,['options'],['calendar','apron','both','riceball']);
const dialogue = (id: string, seeds: DialogueSeed[], entry: string, entries?: Dialogue['entries']): Dialogue => ({ id, entry, entries, nodes: seeds.map(seed => scriptNode(seed, epilogueScripts[seed.id])) });
export const epilogueDialogues: Dialogue[] = [
  dialogue('epilogue-home', [{ id: 'greeting', speaker: '奶奶', choices: [{ id: 'epilogue-sit', label: '饭吃了。我把书搬过去。', effects: [{ kind: 'flag', id: 'epilogue-greeted' }] }] }], 'greeting'),
  dialogue('epilogue-table-talk', tableNodes, 'table', [...pendingTable,{ condition: flag('epilogue-filed'), nodeId: 'filed' }]),
  dialogue('epilogue-departure', departureNodes, 'ticket', [...['breakfast', 'call', 'book'].map(id => ({ condition: flag(`epilogue-${id}`), nodeId: id })), ...pendingDeparture,{ condition: flag('epilogue-ticket-read'), nodeId: 'options' }]),
];
export const epilogueGame: MinigameDefinition = {
  id: 'epilogue-filing', chapterId: 'epilogue', module: 'filing', title: '把三张札放对地方', description: '先读札子正反面，再选去处。可以随时重选，也可以请奶奶一起读。', target: 100, condition: pages,
  reward: { id: 'epilogue-filed', label: '收好短札', effects: [{ kind: 'flag', id: 'epilogue-filed' }] },
  itinerary: { slots: [{ id: 'today', label: '写进今天', time: '问清的吃法' }, { id: 'pending', label: '先夹着，等回话', time: '尚未定下' }, { id: 'private', label: '收回信封', time: '当事人的私话' }], slips: [
    { id: 'half', title: '半份、不要葱', detail: '琴记，窗边那位要半份、不要葱。札角注明：今天当面问过。', slot: 'today' },
    { id: 'sunday', title: '周日午饭后打电话？', detail: '末尾留着问号。奶奶还没答应这张札上的约。', slot: 'pending' },
    { id: 'confidence', title: '折起的私札', detail: '只写当事人准许留在店记里的内容。', slot: 'private' },
  ] },
};
export const epilogueEndings: Ending[] = [
  { id: 'breakfast', title: '锅盖响的时候', condition: flag('epilogue-breakfast'), asset: 'epilogue-gate-dawn', text: '奶奶舀起米酒，看了一眼你放好的碗：“你那只再添半勺。”\n\n你伸手去接，她叫你先放在桌上，端着晃，汤又要洒。勺子碰过碗沿，她坐下来，问昨天哪样最好吃。\n\n你还没选出来，她就说：“那今天先尝这个，别净惦记别人家的。”\n\n你吹了吹碗里的热气。书搁在够不着水的地方，今天新添的字已经干了。车票改好了，先把这碗吃完。' },
  { id: 'call', title: '周日一点', condition: flag('epilogue-call'), asset: 'epilogue-gate-dawn', text: '奶奶送到院门边，又问你周日是不是还照一点。\n\n“一点。你要出门，也先跟我说。”\n\n“我知道。别光顾着说我，你自己路上看着点。”\n\n你把包提稳，沿巷子往外走。走出一段，胸前的纸角硌了一下，便伸手往兜里按平。那张车次单背面还有空，昨晚只添了约好的这一行。' },
  { id: 'book', title: '今天这页', condition: flag('epilogue-book'), asset: 'epilogue-gate-dawn', text: '外套穿好了，你把包重新提起来。奶奶回桌边，将昨晚那页打开一点，问有个字究竟是盐还是糖。\n\n“盐。旁边那行也写着呢。”\n\n“写了两回，两回都这样？行，下回回来你自己认。”\n\n你站在门外笑，让她先别涂掉。她把笔横搁在书旁，转身收杯子，没有在日历上多添一个日子。\n\n院门留着。你往巷口走，书先放在她那里，今天新记的几页也在。' },
  { id: 'unfinished', title: '灯下的书', asset: 'epilogue-gate-dawn', text: '书后头还空着几行。奶奶把卷起的纸角压平，将笔搁在一旁，没有往空白处填字。\n\n院门外有人经过，她抬头看了一眼，又把杯子挪远一点。' },
];
