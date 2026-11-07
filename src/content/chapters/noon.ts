import type { Chapter, Condition, Dialogue, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { qinScripts, chuanScripts, tianScripts } from '../scripts/noon.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const any = (...conditions: Condition[]): Condition => ({ kind: 'any', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const sprite = (asset: string, width: number, height: number, z = 6) => ({ asset, width, height, z });
const object = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId: string | undefined, cameraView: string): Hotspot => ({ id, label, x, y, cameraView, icon: 'look', sprite: sprite(asset,width,height), completed: clueId ? clue(clueId) : undefined, interaction: { kind: 'inspect', text, action: clueId ? { id: `read-${id}`, label: '记在页边', effects: [{ kind: 'clue', id: clueId }] } : undefined } });
const ateOwnBowl = any(clue('noon-record'), clue('noon-unfinished'));
const laterJourney: Condition = any(...(['active','completed','failed'] as const).map(status => ({ kind: 'quest' as const, id: 'night', status })));
const chuanAtFront = all(flag('noon-played'), not(laterJourney));
const front: Hotspot[] = [
  { id: 'chuan-front', label: '阿川', x: 60.4, y: 84, cameraView: 'front-chuan', icon: 'talk', sprite: sprite('chuan',18,61,7), condition: chuanAtFront, interaction: { kind: 'dialogue', dialogueId: 'chuan-talk' } },
  { id: 'noon-person', label: '琴姐', x: 71.1, y: 84, cameraView: 'qin', icon: 'talk', sprite: sprite('qin',14,58,7), interaction: { kind: 'dialogue', dialogueId: 'noon-talk' } },
  { id: 'tian', label: '田姨', x: 32.5, y: 97, cameraView: 'tian', icon: 'talk', sprite: sprite('tian',20.5,60,7), condition: not(flag('noon-ended')), interaction: { kind: 'dialogue', dialogueId: 'tian-talk' } },
  { id: 'untouched-bowl', label: '窗边的碗', x: 18.9, y: 66.2, cameraView: 'window-table', icon: 'look', sprite: sprite('noon-bowl-wrong',5.8,5.2,8),
    variants: [{ condition: flag('noon-ended'), asset: 'noon-bowl-empty' }, { condition: flag('noon-played'), asset: 'plain-noodle' }],
    interaction: { kind: 'inspect', text: "一整碗，葱浮在汤面，筷子横在桌边。碗旁没有挑出来的葱，也没有吃过的痕迹。\n\n田姨见你看，指着面说：“半份，不要葱，我点的是这个。”她把碗留在原处，没有推到路中间。出餐口又响起一声报号，她转头等了一下，再把后半句说完：“重做那份还没来。”",
      versions: [{ condition: flag('noon-ended'), text: "空碗留着一圈汤迹，筷子并排放在旁边。田姨的包已经不在，隔着窗看，对面的门仍开着。\n\n这回是吃完了。你把碗往桌里收，给后来坐下的人让出桌沿。" }, { condition: flag('noon-played'), text: "半份，没有葱。田姨用筷尖卷起一口，吹了吹。你站在旁边，她抬头说：“你去吃你的，我这边不用看着了。”\n\n包已经从肩上卸下来。她伸手去拿杯子，这一回没有先看表。" }],
      action: { id: 'read-untouched-bowl', label: '看一看', condition: not(flag('noon-played')), effects: [{ kind: 'clue', id: 'wrong-bowl' }] } } },
  { ...object('front-menu','手写菜单','noon-menu',47.5,33.5,16,15.5,"粉笔字从整碗排到小菜。“半份也做”挤在两行中间，后面一个小箭头，指着“不够可以添”。\n\n你把板子翻过来，背面留着擦过的旧价。琴姐说过，半份不是新添的，只是后来重新写菜单，没有地方排，她就塞在中间。现在手机里找不到，店里的熟客却照旧点。",'half-portion','menu'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "粉笔字从整碗排到小菜。“半份也做”挤在两行中间，后面一个小箭头，指着“不够可以添”。\n\n你把板子翻过来，背面留着擦过的旧价。琴姐说过，半份不是新添的，只是后来重新写菜单，没有地方排，她就塞在中间。现在手机里找不到，店里的熟客却照旧点。",
      exhibit: { kind: 'note', kicker: '菜单背面 · 琴姐添的字', title: '半份也做', lines: ['半份，照样现煮。', '忌口写在单上。', '中午不够吃，可以再添。'] }, action: { id: 'read-front-menu', label: '看清菜单的小字', effects: [{ kind: 'clue', id: 'half-portion' }] } } },
  { id: 'window-cup', label: '窗边的茶', x: 13.5, y: 65.8, cameraView: 'window-table', icon: 'tea', sprite: sprite('noon-cup-empty',3.3,4.6,8), variants: [{ condition: flag('noon-ended'), asset: 'noon-cup-empty' }, { condition: flag('tian-tea'), asset: 'noon-cup-filled' }], completed: flag('tian-tea'),
    interaction: { kind: 'inspect', text: "杯底一点茶色，田姨没有动壶。你问要不要续，她先望向碗：“一点就好，别拿水给我算一顿饭。”\n\n壶在你这边，够得着。她将杯子向外让开，不想让你越过面碗倒水。", versions: [{ condition: flag('noon-ended'), text: '杯子已经放回窗边，田姨带着包回对面去了。杯壁还温着，你把它和空碗往里面让了让，给后来的人留出桌沿。' }, { condition: flag('tian-tea'), text: "茶添得不满，杯口留着能捧的地方。田姨摸一下杯壁，先把它往里挪，空出放面碗的地方。\n\n“水够了。”她看向出餐口，“你去问面。”" }], options: [{ id: 'pour-tian-tea', label: '续一点茶', condition: not(flag('noon-ended')), unavailable: '田姨已经回对面做活了。', feedback: "“一点就好。水够了，你去问面。”田姨把杯子让到碗旁。", effects: [{ kind: 'flag', id: 'tian-tea' }] }] } },
  { id: 'patched-curtain', label: '补过的门帘', x: 63.6, y: 25.7, cameraView: 'curtain', icon: 'look', sprite: sprite('noon-curtain',13.2,7.8),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "右下角换过一条边。旧针眼沿着折线延伸出去，新布却比原来窄一点，洗过的旧布已经缩了。\n\n你捏住背面，摸到三处不一样的锁边。琴姐说是对面的田姐补的，补完拿回来挂，仍得拆下一头重新量。她刚说“早知道那回就该”，锅里滚起来，后半句便没有了。\n\n窗边的田姨听见自己的名字，抬起头，又看了看那碗没动的面。", exhibit: { kind: 'note', kicker: '门帘反面 · 细密的锁边', title: '田姨补过三回', lines: ['旧针眼一行挨着一行。', '琴姐说，对面的田姐认得这块布。', '新换的边，她下午再带来。'] }, action: { id: 'read-patched-curtain', label: '记住这处针脚', effects: [{ kind: 'clue', id: 'tian-curtain' }] } } },
];
const kitchen: Hotspot[] = [
  { id: 'noon-object', label: '排单，出面', x: 80.3, y: 39, cameraView: 'service-rail', icon: 'look', sprite: sprite('noon-order-rail',9.5,8.5), interaction: { kind: 'minigame', gameId: 'noon-game' }, completed: flag('noon-played') },
  { ...object('noon-note','传菜夹上的单子','morning-prep',41.3,48.1,5,14.5,"三张单，只有窗边那张用手写。旁边印着外送尾号，另一张记“后来的一桌”。\n\n田姨：半份，不葱。\n外送：交接也算在八分钟里。\n后来的一桌：整份，可以等。\n\n夹子上方没有“熟客先放着”的位置。先下哪张，得把两口锅占用多久也算进去。你抽出一张看完，又按原来的方向夹好，没擅自递向灶边。",'orders','tickets'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "三张单，只有窗边那张用手写。旁边印着外送尾号，另一张记“后来的一桌”。\n\n田姨：半份，不葱。\n外送：交接也算在八分钟里。\n后来的一桌：整份，可以等。\n\n夹子上方没有“熟客先放着”的位置。先下哪张，得把两口锅占用多久也算进去。你抽出一张看完，又按原来的方向夹好，没擅自递向灶边。", exhibit: { kind: 'note', kicker: '手写的堂食单', title: '窗边 · 半份，不葱', lines: ['先问田姨还剩多少时间。', '门口的外送也要记交接时间。', '后来的一桌，说可以等。'] }, action: { id: 'read-noon-note', label: '把三张单看清楚', effects: [{ kind: 'clue', id: 'orders' }] } } },
  object('noon-board','案上的擀面杖','morning-board',35.4,72.6,22,11,"一团小面，擀开的步骤跟整份一样。琴姐转面，你以为她要切了，她又翻过来，补擀较厚的一边。\n\n“这边不擀薄，一碗里有的硬，有的烂。你要记半份三分钟，就得让案上的活先做完，别把我从揉到擀都算成一抬手。”\n\n她把擀好的面搁到干处，腾出案板。两口锅这会儿都空着，可面条没有自己走过去。",'two-pots','kneading'),
  object('noon-seasoning','调味罐','seasoning',53.3,53.6,8,12,"圆肚子瓶是老醋，细长的瓶装生抽。你提起老醋，瓶底带出一角收据，原来那里垫着纸。\n\n琴姐没看你手里，先说放回圆印上。台面上几只瓶子各有一圈痕，新的收据剪了一角，刚好露出她认的那个圆。",undefined,'seasoning'),
  object('noon-chopsticks','多留的一双筷子','noon-chopsticks',84.6,51.7,6.2,3.2,"出餐架上多留一双筷子，没装进外送餐具套里。你以为是谁漏拿，琴姐说是你的。\n\n“你奶奶叫你来问做法，没叫你端半天碗还空着肚子走。放着，我看得见。”\n\n她说着又拿了一双，自己那双比你的短一点，放在架子另一头。",undefined,'serving'),
];
const corner: Hotspot[] = [
  { id: 'chuan', label: '阿川', x: 72, y: 93.5, cameraView: 'chuan', icon: 'talk', sprite: sprite('chuan',17,59.5,7), condition: not(chuanAtFront), interaction: { kind: 'dialogue', dialogueId: 'chuan-talk' } },
  object('receipt-printer','吐单机','printer',29,62.5,9.5,9.4,"机器旁压着一张算到半途的草纸：\n\n下锅、捞面、兑汤、装盒。前两项写了时间，后两项只有一个加号。最底下圈着“十五分钟”，圈外又画了问号。\n\n新单吐出来，仍打印相同的承诺时间。草纸被推到一旁，缺的两项不会自己补上。你提起纸，下面还有昨天留下的半截，同一个加号也在那里。",'capacity','printer'),
  { ...object('order-phone','接单手机','phone-stand',45,62.2,4.3,12,"上限：五单。满额暂停：未启用。\n\n手机旁贴着一个手写的“二”。便签揭下又贴过，边角粘不住，阿川拿胶带压了一头。数字已经换了位置，屏幕里的设置却没动。\n\n你点进半份那一栏，列表从头到底只有整份。阿川说要加，手在屏幕上停了一下：“我得先问姨怎么收钱。上回我说等她空了问，一直没问。”",'order-limit','phone'),
    interaction: { kind: 'inspect', manipulation: 'phone', text: "上限：五单。满额暂停：未启用。\n\n手机旁贴着一个手写的“二”。便签揭下又贴过，边角粘不住，阿川拿胶带压了一头。数字已经换了位置，屏幕里的设置却没动。\n\n你点进半份那一栏，列表从头到底只有整份。阿川说要加，手在屏幕上停了一下：“我得先问姨怎么收钱。上回我说等她空了问，一直没问。”", exhibit: {"kind": "note", "kicker": "琴记 · 接单设置", "title": "同时接单", "lines": ["上限：5 单", "满额暂停：未启用", "便签：先算两口锅"], "footer": "阿川的手机 · 待核对"}, versions: [{ condition: flag('noon-limited'), exhibit: {"kind": "note", "kicker": "琴记 · 接单设置", "title": "先按两单试", "lines": ["上限：2 单", "堂食也计入排队", "满额先告知等待"], "footer": "已保存 · 先试一周"}, text: '同时接单已经改成二，堂食也计入排队。阿川把原先那张便利贴留在手机旁，等一周后再核对。' }, { condition: flag('noon-counter'), exhibit: {"kind": "note", "kicker": "琴记 · 接单备注", "title": "半份也记上", "lines": ["菜单已加入半份", "忌口随单传到灶上", "接单量：饭后再算"], "footer": "备注已更新"}, text: '半份与忌口已经加进接单备注，接单数量暂未调整。阿川说，晚上收摊再把两口锅的时间算清。' }], action: { id: 'read-order-phone', label: '核对接单设置', effects: [{ kind: 'clue', id: 'order-limit' }] } } },
  { ...object('old-ledger','旧点单簿','morning-ledger-flat',39,64,12.5,4.5,"田姨：半份，不葱。\n阿宁：醋少一点。\n阿婆：小碗，尝了再添。\n\n你认出几行名字，后面不是所有人都有字。有一条旧偏好划去了，添字的人还标了日子。琴姐说那人从前吃不了辣，后来自己要加，连着加了三回，她才肯改。\n\n“别照着旧字，替人家把今天也点了。”她让你把簿子留在柜边，拿新单去问。",'familiar-names','ledger'),
    interaction: { kind: 'inspect', manipulation: 'book', text: "田姨：半份，不葱。\n阿宁：醋少一点。\n阿婆：小碗，尝了再添。\n\n你认出几行名字，后面不是所有人都有字。有一条旧偏好划去了，添字的人还标了日子。琴姐说那人从前吃不了辣，后来自己要加，连着加了三回，她才肯改。\n\n“别照着旧字，替人家把今天也点了。”她让你把簿子留在柜边，拿新单去问。", exhibit: { kind: 'book', kicker: '琴记 · 点单簿', title: '点单簿', lines: ['田姨：半份，不葱。', '阿宁：醋少一点。', '阿婆：小碗，醋少一点。'] }, action: { id: 'read-old-ledger', label: '记住熟客的这一页', effects: [{ kind: 'clue', id: 'familiar-names' }] } } },
  { ...object('rejected-slip','取消的一单','morning-prep',60,46.4,5.5,14.5,"承诺十五分钟。取消时，已经过了半小时。\n\n这张退单没有夹回新单里。阿川在背面写了哪一锅先空，哪里等着装盒，最后一行写到“再加”，停住了。\n\n汤印从单子底部漫上来，遮掉半个时间。他把纸提到窗前，透着光还能认出那个数字。你问为什么留着，他说怕明天又以为，一共就只有锅里的几分钟。",'cancelled-order','rejected'),
    interaction: { kind: 'inspect', manipulation: 'flip', text: "承诺十五分钟。取消时，已经过了半小时。\n\n这张退单没有夹回新单里。阿川在背面写了哪一锅先空，哪里等着装盒，最后一行写到“再加”，停住了。\n\n汤印从单子底部漫上来，遮掉半个时间。他把纸提到窗前，透着光还能认出那个数字。你问为什么留着，他说怕明天又以为，一共就只有锅里的几分钟。", exhibit: { kind: 'note', kicker: '阿川留下的退单', title: '答应的十五分钟', lines: ['客人已经等过一回。', '面回来时，汤也凉了。', '这张没有夹回新单里。'] }, action: { id: 'read-rejected-slip', label: '看过这张退单', effects: [{ kind: 'clue', id: 'cancelled-order' }] } } },
];
export const noon: Chapter = {
  id: 'noon', number: 3, title: '窗边那一桌', subtitle: '午休还剩一刻钟。', time: '正午 · 琴记面馆', asset: 'noon-front', position: 'center', tint: 'day', questId: 'noon', metricIds: ['research'], hotspots: [], next: 'night', firstScene: 'noon-front',
  description: '你来替奶奶问一碗面的做法。窗边那碗却没人动，田姨把袖口里的表又推深了一点。传菜夹和吐单机隔着一道门，各自催着灶上的两口锅。',
  revisitDescription: '琴记的窗桌与两口锅。看看试行的办法，也可以把没问完的话接着讲。',
  objective: '先问清窗边那碗面，再帮琴姐理顺眼前的三张单。', exitLabel: '晚些时候，再出门', exitHint: '这几张单还没理顺，琴姐也有话要说。',
  exit: any({ kind: 'quest', id: 'noon', status: 'completed' }, { kind: 'quest', id: 'noon', status: 'failed' }),
  beats: [{ label: '问问琴姐', condition: flag('noon-listened') }, { label: '听清两头的难处', condition: all(flag('chuan-heard'),flag('tian-heard')) }, { label: '安排出餐', condition: flag('noon-played') }, { label: '说定明天的办法', condition: flag('noon-ended') }],
  scenes: [
    { id: 'noon-front', title: '店堂', time: '正午 · 窗桌与取餐', description: '窗桌留给坐下吃面的人，琴姐站在出餐通道旁，中央的路仍能过人。', asset: 'noon-front', hotspots: front,
      decorations: [{ id: 'tian-empty-seat', asset: 'noon-empty-seat', x: 33.2, y: 95.5, width: 8.2, height: 23, z: 7, condition: flag('noon-ended') }],
      camera: { views: [{ id: 'front-chuan', label: '阿川走近说话', x: 60.4, y: 43, zoom: 1.45 }, { id: 'qin', label: '出餐通道', x: 71.1, y: 44, zoom: 1.45 }, { id: 'tian', label: '田姨的座位', x: 32.5, y: 50.5, zoom: 1.45 }, { id: 'window-table', label: '窗边的碗', x: 18.9, y: 63.5, zoom: 1.85 }, { id: 'menu', label: '半份菜单', x: 47.5, y: 25.8, zoom: 1.8 }, { id: 'curtain', label: '门帘上的针脚', x: 63.6, y: 22, zoom: 1.8 }] },
      links: [{ sceneId: 'noon-kitchen', label: '穿过门帘，去面案', condition: flag('noon-listened'), unavailable: '先跟琴姐打个招呼。' }, { sceneId: 'noon-corner', label: '去接单柜看看' }] },
    { id: 'noon-kitchen', title: '面案', time: '正午 · 揉面与煮制', description: '揉面案靠窗，两口锅留在灶上，纸单挂在干墙，洁净出餐架靠近店堂。', asset: 'noon-kitchen', hotspots: kitchen,
      decorations: [{ id: 'player-noodles-ready', asset: 'plain-noodle', x: 80.2, y: 50.8, width: 5.3, height: 4.7, z: 6, condition: all(flag('noon-played'),not(ateOwnBowl)) }, { id: 'player-noodles-finished', asset: 'noon-bowl-empty', x: 80.2, y: 50.8, width: 5.3, height: 4.7, z: 6, condition: ateOwnBowl }],
      camera: { views: [{ id: 'service-rail', label: '三张单的木夹', x: 80.3, y: 35.3, zoom: 1.8 }, { id: 'tickets', label: '手写堂食单', x: 41.3, y: 40, zoom: 1.8 }, { id: 'kneading', label: '揉面案', x: 35.4, y: 68.5, zoom: 1.6 }, { id: 'seasoning', label: '灶边调味位', x: 53.3, y: 48, zoom: 1.75 }, { id: 'serving', label: '洁净出餐架', x: 82.5, y: 48.5, zoom: 1.8 }] },
      links: [{ sceneId: 'noon-front', label: '回店堂' }, { sceneId: 'noon-corner', label: '绕去接单柜' }] },
    { id: 'noon-corner', title: '接单柜', time: '正午 · 收单与核对', description: '手机、打印机与点单簿都在干柜上，窗外正对田姨做活的铺子。阿川站在柜旁，手里还夹着笔。', asset: 'noon-corner', hotspots: corner, variants: [{ condition: chuanAtFront, description: '手机和算过的单留在干柜上，阿川拿着便签去了店堂。窗外对面的机器，又接着响起来。' }],
      camera: { views: [{ id: 'chuan', label: '阿川身旁', x: 72, y: 48, zoom: 1.45 }, { id: 'printer', label: '吐单机', x: 29, y: 57.5, zoom: 1.8 }, { id: 'phone', label: '接单手机', x: 45, y: 55.5, zoom: 1.8 }, { id: 'ledger', label: '熟客的点单簿', x: 39, y: 62.5, zoom: 1.8 }, { id: 'rejected', label: '退回的那一单', x: 60, y: 39.5, zoom: 1.8 }] },
      links: [{ sceneId: 'noon-front', label: '回店堂' }, { sceneId: 'noon-kitchen', label: '去面案' }] },
  ],
};

const qinNodes: DialogueSeed[] = [
  {id:'opening',speaker:'琴姐',  choices:[{id:'noon-listen',label:'你先忙。我能帮什么？',next:'rush',effects:[{kind:'flag',id:'noon-listened'},{kind:'metric',id:'research',amount:1}]},{id:'noon-bye',label:'我在这儿等一会儿。',effects:[]}]},
  {id:'rush',speaker:'琴姐',  choices:[{id:'noon-thanks',label:'我去问阿川怎么排。',effects:[]},{id:'noon-qin-cost',label:"田姨点的时候，你们记下了没有？",next:'half',condition:clue('wrong-bowl'),unavailable:'窗边有一碗没动过的面。',effects:[]}]},
  {id:'half',speaker:'琴姐',  choices:[{id:'noon-half-close',label:"我去看单子，她那张先别丢。",effects:[{kind:'clue',id:'half-missed'}]}]},
  {id:'preparing',speaker:'琴姐',  choices:[{id:'noon-qin-return',label:'窗边那碗，我还想问一句。',next:'half',condition:clue('wrong-bowl'),unavailable:'窗边有一碗没动过的面。',effects:[]},{id:'noon-before-game-close',label:'好，我去面案。',effects:[]}]},
  {id:'decision',speaker:'琴姐',  choices:[
    {id:'noon-show-limit',label:"阿川，把算过的时间拿来，跟琴姐一起看。",condition:all(clue('capacity'),clue('order-limit'),flag('chuan-heard')),unavailable:'先问阿川，再看看接单手机和那几张小票。',next:'limit',effects:[]},
    {id:'noon-write-counter',label:"接多少晚些再算，先让半份和忌口跟着单子走。",next:'counter',effects:[]},
    {id:'noon-promise-fast',label:"先照十五分钟接着，我再帮一阵。",next:'overload',effects:[]},
    {id:'noon-decide-later',label:'我再核对一下。',effects:[]},
  ]},
  {id:'limit',speaker:'阿川',portrait:'chuan',  choices:[{id:'noon-limit-ask-qin',label:'琴姐，你看呢？',next:'limit-qin',effects:[]}]},
  {id:'limit-qin',speaker:'琴姐',  choices:[{id:'noon-agree',label:"把今天这张留下，一周后照着核对。",decision:'noon',next:'limited-end',effects:[{kind:'quest',id:'noon',status:'completed'},{kind:'flag',id:'noon-limited'},{kind:'flag',id:'noon-ended'},{kind:'metric',id:'research',amount:1}]}]},
  {id:'limited-end',speaker:'阿川',portrait:'chuan',  choices:[{id:'noon-limit-record',label:'趁这会儿，吃那碗面。',effects:[{kind:'clue',id:'noon-record'}]}]},
  {id:'counter',speaker:'琴姐',  choices:[{id:'noon-counter-agree',label:'给堂食单也腾出一只夹子。',decision:'noon',next:'counter-end',effects:[{kind:'quest',id:'noon',status:'completed'},{kind:'flag',id:'noon-counter'},{kind:'flag',id:'noon-ended'}]}]},
  {id:'counter-end',speaker:'琴姐',  choices:[{id:'noon-counter-record',label:"半份吧。吃完还得问你做法。",effects:[{kind:'clue',id:'noon-record'}]}]},
  {id:'overload',speaker:'阿川',portrait:'chuan',  choices:[{id:'noon-overpromise',label:'先接着，我再帮一阵。',decision:'noon',next:'overload-end',effects:[{kind:'quest',id:'noon',status:'failed'},{kind:'flag',id:'noon-overload'},{kind:'flag',id:'noon-ended'}]},{id:'noon-reconsider',label:'也是。先把能做多少算清楚。',next:'decision',effects:[]}]},
  {id:'overload-end',speaker:'琴姐',  choices:[{id:'noon-overload-record',label:'把多出的那几分钟写下来。',effects:[{kind:'clue',id:'noon-unfinished'}]}]},
  {id:'after',speaker:'琴姐',  choices:[{id:'noon-ask-recipe',label:'这碗清汤的做法，我还想问两句。',next:'qin-recipe',effects:[]},{id:'noon-after-bye',label:"我先把吃过的这一口写下来。",effects:[]}]},
  {
    "id": "after-limit",
    "speaker": "琴姐",


    "choices": [
      {
        "id": "noon-after-limit-recipe",
        "label": "这碗清汤，怎么和煮面的水分开？",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-limit-bye",
        "label": "我把这一页带回去，给奶奶念念。",
        "effects": []
      }
    ]
  },
  {
    "id": "after-counter",
    "speaker": "琴姐",


    "choices": [
      {
        "id": "noon-after-counter-recipe",
        "label": "做法里，我还想把清汤这一条问准。",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-counter-bye",
        "label": "你们晚上算。我先把菜谱带回去。",
        "effects": []
      }
    ]
  },
  {
    "id": "after-overload",
    "speaker": "琴姐",


    "choices": [
      {
        "id": "noon-after-overload-recipe",
        "label": "我想把这碗面的做法记完整。",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-overload-bye",
        "label": "算过的纸留给你们，书我带着。",
        "effects": []
      }
    ]
  },
  {
    "id": "qin-recipe",
    "speaker": "琴姐",


    "choices": [
      {
        "id": "noon-record-qin-recipe",
        "label": "把清汤和煮面分开这一条，写在页边。",
        "effects": [
          {
            "kind": "clue",
            "id": "qin-recipe-tip"
          }
        ]
      }
    ]
  },

];
const chuanNodes: DialogueSeed[] = [
  {id:'opening',speaker:'阿川',  choices:[{id:'chuan-listen',label:"外送什么时候开始接的？",next:'why-online',effects:[{kind:'flag',id:'chuan-heard'},{kind:'metric',id:'research',amount:1}]},{id:'chuan-bye',label:'我看看柜上的单子。',effects:[]}]},
  {id:'why-online',speaker:'阿川',  choices:[{id:'chuan-ask-limit',label:'能不能少接一点？',next:'count',effects:[]},{id:'chuan-ask-back',label:'你回来多久了？',next:'returned',effects:[]}]},
  {id:'count',speaker:'阿川',  choices:[{id:'chuan-back-story',label:'你刚才说，回来没多久？',next:'returned',effects:[]},{id:'chuan-count-close',label:'先看看两口锅到底赶得上几张单。',effects:[{kind:'clue',id:'chuan-count'}]}]},
  {id:'returned',speaker:'阿川',  choices:[{id:'chuan-share-job-gap',label:'我也有一份没改完的简历。',condition:clue('job-gap'),unavailable:'还没翻过自己手机里的草稿。',next:'shared-counter',effects:[]},{id:'chuan-return-close',label:"你先教我认单子。算清这几张再说。",next:'count',effects:[{kind:'clue',id:'chuan-return'}]}]},
  {id:'after',speaker:'阿川',  choices:[{id:'chuan-after-bye',label:"放心，原的给你，我拿抄过的。",effects:[]}]},
  {
    "id": "shared-counter",
    "speaker": "阿川",


    "choices": [
      {
        "id": "chuan-shared-counter-close",
        "label": "好，先把这三张放稳，一张一张算。",
        "next": "count",
        "effects": [
          {
            "kind": "clue",
            "id": "chuan-return"
          }
        ]
      }
    ]
  },

];
const tianNodes: DialogueSeed[] = [
  {id:'opening',speaker:'田姨',  choices:[{id:'tian-listen',label:"你还等得及吗？",next:'break',effects:[{kind:'flag',id:'tian-heard'},{kind:'metric',id:'research',amount:1}]},{id:'tian-ask-curtain',label:'厨房门上那几道针脚，是你补的？',condition:clue('tian-curtain'),unavailable:'先看看门帘反面的针脚。',next:'curtain-story',effects:[]},{id:'tian-bye',label:'我去问问还要多久。',effects:[]}]},
  {id:'break',speaker:'田姨',  choices:[{id:'tian-break-curtain',label:'门帘反面那几道针脚，我刚才看见了。',condition:clue('tian-curtain'),unavailable:'先看看厨房门帘反面的针脚。',next:'curtain-story',effects:[]},{id:'tian-order-close',label:'我把时间和半份一起写到单上。',effects:[{kind:'clue',id:'tian-order'}]}]},
  {id:'served',speaker:'田姨',  choices:[{id:'tian-served-close',label:"知道，半份的钱照收。你先吃。",effects:[]}]},
  {
    "id": "curtain-story",
    "speaker": "田姨",


    "choices": [
      {
        "id": "tian-curtain-story-close",
        "onceKey": "tian-listen",
        "label": "好，你还剩多少时间，我一起记上。",
        "next": "break",
        "effects": [
          {
            "kind": "flag",
            "id": "tian-heard"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      }
    ]
  },

];
export const noonDialogues: Dialogue[] = [
  {id:'noon-talk',entry:'opening',entries:[{condition:flag('noon-limited'),nodeId:'after-limit'},{condition:flag('noon-counter'),nodeId:'after-counter'},{condition:flag('noon-overload'),nodeId:'after-overload'},{condition:flag('noon-ended'),nodeId:'after'},{condition:flag('noon-played'),nodeId:'decision'},{condition:flag('noon-listened'),nodeId:'preparing'}],nodes:qinNodes.map(n => scriptNode({ portrait: 'qin', ...n }, qinScripts[n.id]))},
  {id:'chuan-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'after'},{condition:flag('chuan-heard'),nodeId:'count'}],nodes:chuanNodes.map(n => scriptNode({ portrait: 'chuan', ...n }, chuanScripts[n.id]))},
  {id:'tian-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'served'},{condition:flag('tian-heard'),nodeId:'break'}],nodes:tianNodes.map(n => scriptNode({ portrait: 'tian', ...n }, tianScripts[n.id]))},
];
export const noonGame: MinigameDefinition = {
  id:'noon-game',chapterId:'noon',module:'service-queue',title:'两口锅，三张单',target:100,
  description:'田姨、门口的外送、后来的一桌。先问清时间与份量，再给两口锅排好顺序。',
  condition:all(flag('noon-listened'),flag('chuan-heard'),flag('tian-heard')),unavailable:'先问清琴姐、阿川和田姨这三头的事。',
  service:{pots:2,tickets:[{id:'delivery',person:'门口的外送',cook:4,deadline:8,note:'从下锅起算，八分钟内交出去。'},{id:'tian',person:'窗边田姨',cook:3,deadline:6,note:'从下锅起算，六分钟内做好。半份，不要葱。',half:true,noScallion:true},{id:'inside',person:'后来的一桌',cook:5,deadline:12,note:'刚坐下，说可以等。'}]},
  reward:{id:'noon-game-reward',label:'面端出去了',feedback:'窗边那碗先到，门口的纸袋也交了出去。打印机暂时没响，琴姐腾出手擦了擦案上的水。',effects:[{kind:'flag',id:'noon-played'},{kind:'metric',id:'research',amount:1}]},
};
