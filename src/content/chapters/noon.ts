import type { Chapter, Condition, Dialogue, DialogueNode, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const sprite = (asset: string, width: number, height: number, z = 2) => ({ asset, width, height, z });
const object = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId?: string): Hotspot => ({ id, label, x, y, icon: 'look', sprite: sprite(asset,width,height), completed: clueId ? clue(clueId) : undefined, interaction: { kind: 'inspect', text, action: clueId ? { id: `read-${id}`, label: '记在页边', effects: [{ kind: 'clue', id: clueId }] } : undefined } });
export const noon: Chapter = {
  id: 'noon', number: 3, title: '窗边那一桌', subtitle: '午休还剩一刻钟。', time: '正午 · 琴记面馆', asset: 'noon-front', position: 'center', tint: 'day', questId: 'noon', metricIds: ['research'], hotspots: [], next: 'night', firstScene: 'noon-front',
  description: '店里坐得不满，小票却一张接一张地吐。窗边的人看了两回表，没招手。',
  objective: '先把等着的几碗面端出去。', exitLabel: '晚些时候，再出门', exitHint: '这几张单还没理顺，琴姐也有话要说。',
  exit: { kind: 'any', conditions: [{ kind: 'quest', id: 'noon', status: 'completed' }, { kind: 'quest', id: 'noon', status: 'failed' }] },
  beats: [{ label: '问问琴姐', condition: flag('noon-listened') }, { label: '听清两头的难处', condition: all(flag('chuan-heard'),flag('tian-heard')) }, { label: '安排出餐', condition: flag('noon-played') }, { label: '说定明天的办法', condition: flag('noon-ended') }],
  scenes: [
    { id: 'noon-front', title: '店堂', description: '吊扇在转，风吹不到窗边那碗面。', asset: 'noon-front', links: [{ sceneId: 'noon-kitchen', label: '去面案', condition: flag('noon-listened'), unavailable: '先跟琴姐打个招呼。' }, { sceneId: 'noon-corner', label: '去柜边看看' }], hotspots: [
      { id: 'noon-person', label: '琴姐', x: 64, y: 94, icon: 'talk', sprite: sprite('qin',20,62,3), interaction: { kind: 'dialogue', dialogueId: 'noon-talk' } },
      { id: 'tian', label: '田姨', x: 33, y: 94, icon: 'talk', sprite: sprite('tian',17,55,3), interaction: { kind: 'dialogue', dialogueId: 'tian-talk' } },
      {id:'untouched-bowl',label:'窗边的面',x:12,y:68,icon:'look',sprite:sprite('noodle-bowl',17,18),variants:[{condition:flag('noon-played'),asset:'plain-noodle'}],interaction:{kind:'inspect',text:'面上浮着葱。田姨把筷子搁在碗边，说她那份不是这个。琴姐在灶后应了一声，手没停。',versions:[{condition:flag('noon-played'),text:'半份，没有葱。田姨卷起一筷子，碗里还在冒热气。'}],action:{id:'read-untouched-bowl',label:'看一看',condition:{kind:'not',condition:flag('noon-played')},effects:[{kind:'clue',id:'wrong-bowl'}]}}},
      object('front-menu','手写菜单','food-menu',46,33,11,20,'老菜单上有“半份”，旁边添着小字：中午不够吃可以加。手机上的菜单只列整碗。','half-portion'),
      { ...object('window-cup','窗边的茶','prop-tea',24,67,11,15,'田姨给面馆缝过三回门帘。桌边这个茶壶，琴姐一直单留给她用。'), interaction: { kind: 'inspect', text: '田姨的杯子空了。她把表往袖口里推了推，没再看。', options: [{ id: 'pour-tian-tea', label: '续一点茶', feedback: '“谢谢，别倒满。一会儿还得赶回去。”', effects: [{ kind: 'flag', id: 'tian-tea' }] }] } },
    ] },
    { id: 'noon-kitchen', title: '面案', description: '灶上就两口锅，案上的单子已经排到窗下。', asset: 'noon-kitchen', links: [{ sceneId: 'noon-front', label: '回店堂' }, { sceneId: 'noon-corner', label: '绕去柜边' }], hotspots: [
      { id: 'noon-object', label: '排单，出面', x: 51,y:81,icon:'look',sprite:sprite('noodle-bowl',20,22),interaction:{kind:'minigame',gameId:'noon-game'},completed:flag('noon-played') },
      object('noon-note','传菜夹上的单子','order-slip',27,77,12,14,'这一张写“半份，不要葱”，另外两张只印着统一的出餐时间。阿川用笔把其中一个“十五分钟”圈住，又打了问号。','orders'),
      object('noon-board','案上的擀面杖','prop-board',25,88,27,22,'面团分成大小不一的几块。琴姐说半碗也是现擀，少一半面，省不了一半手。','two-pots'),
      object('noon-seasoning','调味罐','seasoning',71,61,14,21,'醋瓶底下垫着折过的收据。琴姐抬眼看见你：“先别拿错，老醋是圆肚子那只。”'),
      object('noon-chopsticks','多留的一双筷子','chopsticks',66,85,12,12,'筷子洗得很净，摆在新碗旁。琴姐说：“你等我忙完，也吃一碗。你阿婆来，总说我下手盐重。”'),
    ] },
    { id: 'noon-corner', title: '柜边', description: '打印机还在响。阿川把音量调小了一格。', asset: 'noon-corner', links: [{ sceneId: 'noon-front', label: '回店堂' }, { sceneId: 'noon-kitchen', label: '去面案' }], hotspots: [
      { id:'chuan',label:'阿川',x:90,y:96,icon:'talk',sprite:sprite('chuan',19,63,3),interaction:{kind:'dialogue',dialogueId:'chuan-talk'} },
      object('receipt-printer','吐单机','printer',60,70,16,21,'小票卷在桌边，最后一张还没撕。五单面，排在同一个十五分钟里。底下有阿川算到一半的笔迹。','capacity'),
      object('order-phone','接单手机','phone-stand',43,70,11,24,'满额后停止接单的开关没打开。页面写着：最多可设同时五单。阿川在便利贴上写了个“二”，迟迟没改。','order-limit'),
      object('old-ledger','旧账本','blue-ledger',27,74,16,17,'田姨，半份，不葱。陈家阿宁，醋少一点。阿婆的名字后面，琴姐画了一只小碗。','familiar-names'),
      object('rejected-slip','取消的一单','order-slip',76,72,11,12,'昨天那单超过了半小时。客人退掉，骑手又把面送回来。纸角有一圈干掉的汤印。','cancelled-order'),
    ] },
  ],
};
const qinNodes: DialogueNode[] = [
  {id:'opening',speaker:'琴姐',direction:'她擦了擦手，转身又去接锅里的面。',text:'小满？你阿婆终于把你叫回来了。\n\n先往里坐。那张新桌子没人，窗边……窗边给田姐留着。',choices:[{id:'noon-listen',label:'你先忙。我能帮什么？',next:'rush',effects:[{kind:'flag',id:'noon-listened'},{kind:'metric',id:'research',amount:1}]},{id:'noon-bye',label:'我在这儿等一会儿。',effects:[]}]},
  {id:'rush',speaker:'琴姐',text:'单子都在夹子上。堂食的，送出去的，掺在一块了。\n\n以前中午最多忙两阵，现在手机不分时候响。阿川说能把闲时补起来，我也想试。可这两口锅又没长出第三口。',choices:[{id:'noon-thanks',label:'我去问阿川怎么排。',effects:[]},{id:'noon-qin-cost',label:'田姨那份，怎么放错了？',next:'half',condition:clue('wrong-bowl'),unavailable:'窗边有一碗没动过的面。',effects:[]}]},
  {id:'half',speaker:'琴姐',text:'她那份我记得。刚才阿川按手机出的整碗，赶着装袋，又给放了葱。\n\n不怪他，半份没写进手机里。我总想着我记得就行，忙起来还真就顾不过来了。',choices:[{id:'noon-half-close',label:'我把她那份单独夹出来。',effects:[{kind:'clue',id:'half-missed'}]}]},
  {id:'preparing',speaker:'琴姐',text:'田姐赶着回去开机，门口那两张外送也不能一直等。\n\n你跟他们都问清楚，咱们按锅的空当下。',choices:[{id:'noon-qin-return',label:'窗边那碗，我还想问一句。',next:'half',condition:clue('wrong-bowl'),unavailable:'窗边有一碗没动过的面。',effects:[]},{id:'noon-before-game-close',label:'好，我去面案。',effects:[]}]},
  {id:'decision',speaker:'琴姐',direction:'她终于把灶火关小，靠在案边。',text:'这几碗是赶上了。可明天不能还这么接。\n\n阿川，你刚才在手机上写那个“二”，到底怎么算的？',choices:[
    {id:'noon-show-limit',label:'把两口锅和五张小票一起算给她看。',condition:all(clue('capacity'),clue('order-limit'),flag('chuan-heard')),unavailable:'先问阿川，再看看接单手机和那几张小票。',next:'limit',effects:[]},
    {id:'noon-write-counter',label:'先把半份和不要葱，写进每一张单。',next:'counter',effects:[]},
    {id:'noon-promise-fast',label:'既然接了，先照十五分钟答应客人。',next:'overload',effects:[]},
    {id:'noon-decide-later',label:'我再核对一下。',effects:[]},
  ]},
  {id:'limit',speaker:'阿川',portrait:'chuan',text:'每口锅前面只留一单。再来就先告诉客人要多等，等不起的别接。\n\n堂食那一栏我也加进去。不是田姨来就临时插单，是她刚坐下就得记上。',choices:[{id:'noon-limit-ask-qin',label:'琴姐，你看呢？',next:'limit-qin',effects:[]}]},
  {id:'limit-qin',speaker:'琴姐',text:'行。半份也写上，别老让我在锅边喊。\n\n先试一周。少接的那几单，月底我们再算账。阿川，账不好看也得拿给我，别自己憋着。',choices:[{id:'noon-agree',label:'把今天算过的数夹在账本里。',decision:'noon',next:'limited-end',effects:[{kind:'quest',id:'noon',status:'completed'},{kind:'flag',id:'noon-limited'},{kind:'flag',id:'noon-ended'},{kind:'metric',id:'research',amount:1}]}]},
  {id:'limited-end',speaker:'阿川',portrait:'chuan',direction:'他按下开关，打印机停了两秒。',text:'设好了。\n\n……突然这么安静，我还有点不习惯。',choices:[{id:'noon-limit-record',label:'趁这会儿，吃那碗面。',effects:[{kind:'clue',id:'noon-record'}]}]},
  {id:'counter',speaker:'琴姐',text:'对。写纸上也行，先别只靠我脑子记。\n\n阿川，饭后你把半份加上。接多少单，我们晚上收了摊再算。',choices:[{id:'noon-counter-agree',label:'给堂食单也腾出一只夹子。',decision:'noon',next:'counter-end',effects:[{kind:'quest',id:'noon',status:'completed'},{kind:'flag',id:'noon-counter'},{kind:'flag',id:'noon-ended'}]}]},
  {id:'counter-end',speaker:'琴姐',direction:'她把“半份，不葱”写得很大。',text:'总算不用扯着嗓子喊了。\n\n你的呢？还是小时候那样，醋只沾一点？',choices:[{id:'noon-counter-record',label:'今天可以多一点。',effects:[{kind:'clue',id:'noon-record'}]}]},
  {id:'overload',speaker:'阿川',portrait:'chuan',text:'可下一单也快进来了。刚才是有人帮忙，咱们才赶得上。\n\n真都答应十五分钟？',choices:[{id:'noon-overpromise',label:'先接着，我再帮一阵。',decision:'noon',next:'overload-end',effects:[{kind:'quest',id:'noon',status:'failed'},{kind:'flag',id:'noon-overload'},{kind:'flag',id:'noon-ended'}]},{id:'noon-reconsider',label:'也是。先把能做多少算清楚。',next:'decision',effects:[]}]},
  {id:'overload-end',speaker:'琴姐',direction:'她没再往碗里放面，先拿起了电话。',text:'那张二十分钟前的单，先跟人说一声。来不及就别叫人家干等。\n\n小满，你先吃。我给客人回个话。',choices:[{id:'noon-overload-record',label:'把多出的那几分钟写下来。',effects:[{kind:'clue',id:'noon-unfinished'}]}]},
  {id:'after',speaker:'琴姐',text:'吃好啦？跟你阿婆说，碗搁着，下回来再带。\n\n对了，夜里那家小馆，你到了先问还有没有饭，别一进去就翻本子。',choices:[{id:'noon-after-bye',label:'知道了。碗我会记得。',effects:[]}]},
];
const chuanNodes: DialogueNode[] = [
  {id:'opening',speaker:'阿川',text:'你帮我看一眼，堂食这几张是不是少夹了一张？\n\n我一转身，小票就绕地上了。这机器倒是一天都不歇。',choices:[{id:'chuan-listen',label:'怎么一下来了这么多？',next:'why-online',effects:[{kind:'flag',id:'chuan-heard'},{kind:'metric',id:'research',amount:1}]},{id:'chuan-bye',label:'我看看柜上的单子。',effects:[]}]},
  {id:'why-online',speaker:'阿川',text:'以前下午两点过了，店里一坐就是半天。我姨不说，我知道房租涨过。\n\n我回来帮忙，想着把网上的也接起来。头一天响了一声，她高兴得多下了半碗面。现在倒是我怕它响。',choices:[{id:'chuan-ask-limit',label:'能不能少接一点？',next:'count',effects:[]},{id:'chuan-ask-back',label:'你回来多久了？',next:'returned',effects:[]}]},
  {id:'count',speaker:'阿川',text:'能。开关就在这儿。我写了个二，想等中午忙完，跟她算一算。\n\n可我又怕两单太少。客人第一次来没点上，往后就不找我们了。',choices:[{id:'chuan-back-story',label:'你刚才说，回来没多久？',next:'returned',effects:[]},{id:'chuan-count-close',label:'先看看两口锅到底赶得上几张单。',effects:[{kind:'clue',id:'chuan-count'}]}]},
  {id:'returned',speaker:'阿川',text:'上个月。以前做夜班，地方撤了，就回来歇两天。\n\n我姨没问我下一份找好了没，先给我系条围裙。现在倒像我给她添了麻烦。',choices:[{id:'chuan-return-close',label:'先别这么算。你教我认单子。',next:'count',effects:[{kind:'clue',id:'chuan-return'}]}]},
  {id:'after',speaker:'阿川',text:'刚才那张纸别扔。我想把每种面要几分钟也补上。\n\n不然过两天一忙，又全靠我姨在锅边喊。',choices:[{id:'chuan-after-bye',label:'好，给你留在账本里。',effects:[]}]},
];
const tianNodes: DialogueNode[] = [
  {id:'opening',speaker:'田姨',direction:'她把袖口的线头揪下来，握在手心。',text:'你坐，不用让。我不是嫌慢。\n\n对面还有一件衣服等着锁边，机器开了，不能搁太久。',choices:[{id:'tian-listen',label:'你的午休到几点？',next:'break',effects:[{kind:'flag',id:'tian-heard'},{kind:'metric',id:'research',amount:1}]},{id:'tian-bye',label:'我去问问还要多久。',effects:[]}]},
  {id:'break',speaker:'田姨',text:'再过六分钟得回去。半碗就够，别加葱。琴妹子知道，以前我一坐下她就往锅里放了。\n\n现在她忙，我也不好意思一来就催。',choices:[{id:'tian-order-close',label:'我把时间和半份一起写到单上。',effects:[{kind:'clue',id:'tian-order'}]}]},
  {id:'served',speaker:'田姨',direction:'她拿起筷子，先把碗转了半圈。',text:'这回是我的了。\n\n我下午给她把门帘带过来，边都锁好了。你别急着付，琴妹子准又不要。',choices:[{id:'tian-served-close',label:'你先吃，回头我替你说。',effects:[]}]},
];
export const noonDialogues: Dialogue[] = [
  {id:'noon-talk',entry:'opening',entries:[{condition:flag('noon-ended'),nodeId:'after'},{condition:flag('noon-played'),nodeId:'decision'},{condition:flag('noon-listened'),nodeId:'preparing'}],nodes:qinNodes.map(n=>({portrait:'qin',...n}))},
  {id:'chuan-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'after'},{condition:flag('chuan-heard'),nodeId:'count'}],nodes:chuanNodes.map(n=>({portrait:'chuan',...n}))},
  {id:'tian-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'served'},{condition:flag('tian-heard'),nodeId:'break'}],nodes:tianNodes.map(n=>({portrait:'tian',...n}))},
];
export const noonGame: MinigameDefinition = {
  id:'noon-game',chapterId:'noon',module:'service-queue',title:'两口锅，三张单',target:100,
  description:'先选一张单，再放进一口锅里。每口锅按放入顺序出餐；田姨赶时间，还要核对半份和不要葱。',
  condition:all(flag('noon-listened'),flag('chuan-heard'),flag('tian-heard')),unavailable:'先问清琴姐、阿川和田姨这三头的事。',
  service:{pots:2,tickets:[{id:'delivery',person:'门口的外送',cook:4,deadline:8,note:'八分钟内交出去。'},{id:'tian',person:'窗边田姨',cook:3,deadline:6,note:'六分钟后回去。半份，不要葱。',half:true,noScallion:true},{id:'inside',person:'后来的一桌',cook:5,deadline:12,note:'刚坐下，说可以等。'}]},
  reward:{id:'noon-game-reward',label:'面端出去了',feedback:'窗边那碗先到，门口的纸袋也交了出去。打印机暂时没响，琴姐腾出手擦了擦案上的水。',effects:[{kind:'flag',id:'noon-played'},{kind:'metric',id:'research',amount:1}]},
};
