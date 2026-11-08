import type { Chapter, Condition, Dialogue, Entry, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { nightScripts } from '../scripts/night.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const sprite = (asset: string, width: number, height: number, z = 3) => ({ asset, width, height, z });
const person = (id: string, label: string, asset: string, x: number, y: number, dialogueId: string, cameraView: string): Hotspot => ({ id, label, x, y, icon: 'talk', sprite: sprite(asset, 19, 54, 5), cameraView, interaction: { kind: 'dialogue', dialogueId } });
const ready = all(flag('night-listened'), flag('night-luo-heard'), flag('night-table-wiped'));
const unfinished = not(flag('night-ended'));
const replyText = '今晚替同事多顶一会儿。十点五十五能到，辣酱另放，带双筷子。留得下回我一声。我下班前没收到准话，就直接上车。';
export const night: Chapter = {
  id: 'night', number: 4, title: '夜里有饭', subtitle: '卷帘门留着半人高。', time: '22:40 · 长明巷夜饭小馆',
  asset: 'night-front', position: 'center', tint: 'night', questId: 'night', metricIds: ['care'], next: 'epilogue',
  firstScene: 'night-front', hotspots: [], description: "卷帘门没放到底，里面还亮着灶火，许叔说今晚只剩两份饭。靠门的小桌有一圈水渍，罗姐进来先问豆腐还留没留，巷口跟着响过一辆车。你将书放到干的那边，先听他们怎么安排。",
  objective: '擦出一张桌，分清两份饭，再把留餐的事回个准话。',
  exit: flag('night-ended'), exitHint: '许叔还没把今晚的事交代完。去柜边听他说完，再离店。', exitLabel: '合上书，离开小馆',
  revisitDescription: "十一点以后门已经落锁，柜边仍留着当晚写过的条。哪句回过、哪份交走过，都能照原来的纸再看，没写下的地方仍空着。",
  beats: [{ label: '听清两份饭，擦好桌', condition: ready }, { label: '看小梁的回信', condition: flag('night-reply-read') }, { label: '核对堂食与留餐', condition: flag('night-played') }, { label: '回信并听完锁门前的话', condition: flag('night-ended') }],
  scenes: [
    { id: 'night-front', title: '店门', time: '22:40 · 还有两份饭', asset: 'night-front', description: "卷帘门挡住半截招牌，进来得低一下头。左边小桌还没收，右侧柜后留着火，许叔抬手指了指能坐的地方，罗姐先将包从凳上拿开。",
      variants: [{ condition: flag('night-ended'), time: '23:00 · 回看今晚的店门', description: '罗姐已经赶车去了。许叔收起碗，卷帘门就要放到底。' }, { condition: flag('night-played'), time: '22:48 · 罗姐吃完，起身赶车' }],
      camera: { views: [{ id: 'owner', label: '柜旁的许叔', x: 79, y: 58, zoom: 1.35 }, { id: 'table', label: '靠门小方桌', x: 19, y: 60, zoom: 1.65 }, { id: 'luo', label: '赶末班车的罗姐', x: 38, y: 56, zoom: 1.4 }, { id: 'note', label: '门边纸条', x: 68, y: 39, zoom: 1.8 }] },
      links: [{ sceneId: 'night-kitchen', label: '进灶边，核对两份饭', condition: ready, unavailable: '先跟许叔和罗姐说话，再把靠门那张桌擦好。' }],
      hotspots: [
        person('night-person', '许叔', 'night-xu', 79, 94, 'night-talk', 'owner'),
        { ...person('night-luo', '罗姐', 'night-luo', 38, 91, 'night-luo-talk', 'luo'), condition: not(flag('night-luo-left')), variants: [{ condition: flag('night-played'), asset: 'night-luo-seated', x: 29, y: 89, width: 18, height: 44, cameraView: 'table' }] },
        { id: 'night-table', label: '桌角的抹布', x: 10.5, y: 64, cameraView: 'table', icon: 'look', sprite: sprite('night-cloth', 6, 3.5), completed: flag('night-table-wiped'),
          variants: [{ condition: flag('night-table-wiped'), x: 10, y: 61.5, width: 5, height: 3 }],
          drag: { actionId: 'night-wipe', target: { x: 9, y: 60, width: 16, height: 5 }, hint: '把左侧的抹布拖过桌面，也可点开擦桌。' },
          interaction: { kind: 'inspect', text: "桌左侧放着抹布，右边留了一圈水印。罗姐把布包从凳上拿开，让你有地方转身，嘴上还在跟许叔确认那份豆腐。\n\n你先把挨桌沿的东西往里让，水渍连着擦干，待会儿端来的碗才有一块稳当地方。", versions: [{ condition: flag('night-table-wiped'), text: "水印已经擦干，抹布叠在左后角，右边可以放饭碗。罗姐拉开凳子，说这里就好，抬头能看到巷口，不用吃一口又起来看车来了没有。" }], options: [{ id: 'night-wipe', label: '把这张桌擦干净', effects: [{ kind: 'flag', id: 'night-table-wiped' }], feedback: "你把水渍擦干，将抹布叠到左后角，给碗留出一块空处。罗姐把凳子往里让，说这里就好，吃着也看得到巷口，包就放自己手边，不再占一整张凳。" }] } },
        { id: 'night-note', label: '门边留餐纸条', x: 68, y: 43, cameraView: 'note', icon: 'letter', sprite: sprite('night-clip', 5, 12), completed: clue('late-note'),
          interaction: { kind: 'inspect', manipulation: 'unfold', text: "纸条只写十点四十和一句谢谢，最后那个谢挤进折痕，展开才读得全。\n\n纸上没有后来改到几点，许叔将它单独朝外夹着，免得收钱时拿混。真要知道今晚来不来，还得看手机的新消息。", exhibit: { kind: 'note', kicker: '门边 · 小梁原来的约定', title: '十点四十，谢谢', lines: ['十点四十，谢谢。', '最后一个“谢”挤进了折痕。'] }, action: { id: 'night-read', label: '记下纸条上的字', effects: [{ kind: 'clue', id: 'late-note' }] } } },
        { id: 'night-served-bowl', label: '罗姐的那碗饭', x: 19.5, y: 64, cameraView: 'table', icon: 'look', sprite: sprite('night-bowl', 9, 6.5), condition: all(flag('night-played'), not(flag('night-luo-left'))),
          interaction: { kind: 'inspect', text: "许叔端来堂食，辣酱留在碗沿，没有拌进饭里。罗姐先拨开，夹一块豆腐尝过，才自己添一点。\n\n她的包已经从凳上拿走，放在手边，吃完就能起身，不用再围着桌子找东西。", versions: [{ condition: flag('night-luo-left'), text: "罗姐把吃完的碗送到柜边，筷子摆在碗沿，包往肩上一提就走了。她赶十点五十那班车，门口没有留下等着再问什么的人，饭这一份也已经收清。" }] } },
      ] },
    { id: 'night-kitchen', title: '灶边', time: '22:40—22:48 · 分装', asset: 'night-kitchen', description: "饭锅还盖着，手机搁在不沾水的干台旁，许叔刚洗过手，叫你替他看新消息。碗和空盒各占一边，两张单也没放到一起，拿之前得先认清是谁的。",
      variants: [{ condition: flag('night-ended'), time: '回看今晚的灶边', description: '今晚的分装已经做过。柜边保留着交接记录。' }],
      camera: { views: [{ id: 'reply', label: '干台边的回信', x: 40, y: 52, zoom: 1.8 }, { id: 'packing', label: '分装台', x: 54, y: 54, zoom: 1.65 }, { id: 'xu', label: '灶旁的许叔', x: 74, y: 56, zoom: 1.35 }] },
      links: [{ sceneId: 'night-front', label: '回店门的小方桌' }, { sceneId: 'night-counter', label: '去柜边交接', condition: flag('night-played'), unavailable: '先读小梁的回信，核对两张分装单。' }],
      hotspots: [
        { ...person('night-xu-kitchen', '灶旁的许叔', 'night-xu', 74, 94, 'night-kitchen-talk', 'xu'), condition: not(flag('night-luo-left')) },
        { id: 'night-phone', label: '许叔让你看的回信', x: 40, y: 57, cameraView: 'reply', icon: 'look', sprite: sprite('night-phone', 7, 4), completed: flag('night-reply-read'),
          interaction: { kind: 'inspect', manipulation: 'phone', text: "许叔手上有水，用手背将手机转向你，叫你念新来的那条，别替他翻前面一堆已经回过的。\n\n小梁说侧门出来才能往这家走，从正门出去就是上车，得在下班前知道留没留。你把最后那句也念全，许叔这回没有只听见改过的时间就把手机收回去。", exhibit: { kind: 'note', kicker: '22:42 · 小梁的订餐回信', title: '今晚改点', phone: { time: '22:42', heading: '小梁 · 订餐消息', footer: '只查看许叔让你读的这一条' }, lines: [replyText] }, action: { id: 'night-read-reply', label: '把这条回信念给许叔', condition: ready, effects: [{ kind: 'flag', id: 'night-reply-read' }, { kind: 'clue', id: 'night-reply' }] },
            options: [{ id: 'night-recall-message', label: '想起一条旧消息', condition: flag('night-reply-read'), effects: [{ kind: 'clue', id: 'night-riceball' }], feedback: "你想起有回很晚才往住处走，便利店只剩一个饭团。奶奶问到家没有，你站在门外拆包装，先回一句快了，想着吃完再慢慢走，后来也没将当时还没到的那半句补上。" }] } },
        { id: 'night-object', label: '分装台上的空饭盒', x: 59, y: 57, cameraView: 'packing', icon: 'look', sprite: sprite('night-box', 12, 10), completed: flag('night-played'), condition: all(unfinished, not(flag('night-luo-left'))),
          interaction: { kind: 'minigame', gameId: 'night-game' } },
        { id: 'night-kitchen-bowl', label: '堂食的浅碗', x: 48, y: 56.5, cameraView: 'packing', icon: 'look', sprite: sprite('night-empty-bowl', 8, 6), condition: not(flag('night-played')), interaction: { kind: 'inspect', text: "浅碗是罗姐在店里吃的，辣酱搁碗沿，筷子放旁边。留餐饭盒对应另一张单，不能因为两份菜一样，就当要求也一样。\n\n你把碗和空盒分开放，让两张纸各压在自己那一边，拿起哪份就先看哪张。" } },
      ] },
    { id: 'night-counter', title: '柜边', time: '22:48 · 回个准话', asset: 'night-counter', description: "空饭盒留在柜上，纸夹压着原来约的时间，旧牌靠在下面。手机里又来了新的一句，许叔看过还没答，门灯照着店里，从这里不容易看清巷口。",
      variants: [{ condition: flag('night-ended'), time: '23:00 · 门灯熄了', description: '许叔把手机扣下，伸手去拉卷帘门。今晚的事写在新条上。' }, { condition: flag('night-wait'), time: '23:00 · 没有人来取' }, { condition: flag('night-reserve'), time: '22:55 · 小梁到了' }, { condition: flag('night-luo-left'), time: '22:48 · 罗姐赶车去了' }],
      camera: { views: [{ id: 'xu', label: '柜边的许叔', x: 47, y: 55, zoom: 1.35 }, { id: 'handoff', label: '留餐夹', x: 37, y: 34, zoom: 1.8 }, { id: 'lamp', label: '门边小灯', x: 10, y: 47, zoom: 1.8 }, { id: 'box', label: '柜上的交接处', x: 67, y: 48, zoom: 1.7 }, { id: 'old-sign', label: '柜台下的旧牌', x: 60, y: 74, zoom: 1.7 }, { id: 'liang', label: '小梁', x: 85, y: 58, zoom: 1.35 }] },
      links: [{ sceneId: 'night-kitchen', label: '回灶边看看' }],
      hotspots: [
        person('night-xu-counter', '柜边的许叔', 'night-xu', 47, 94, 'night-handoff', 'xu'),
        { id: 'night-handoff-clip', label: '留餐夹 · 确认回信', x: 37, y: 42, cameraView: 'handoff', icon: 'talk', sprite: sprite('night-clip', 6, 14), interaction: { kind: 'dialogue', dialogueId: 'night-handoff' } },
        { id: 'night-old-sign', label: '柜台下的旧牌', x: 60, y: 80, cameraView: 'old-sign', icon: 'look', sprite: sprite('night-sign', 7, 11), completed: clue('night-old-sign'),
          interaction: { kind: 'inspect', manipulation: 'flip', text: "旧牌收在柜下靠着脚边，正面那句晚点来也行还看得清。翻过去才有另一行小字，前头一句没把话说到几点算晚。\n\n你将牌放稳，没有替许叔重新挂出门，今晚要怎么等，还得照现在说定的时间来。", exhibit: { kind: 'note', kicker: '许叔后来补在背面的字', title: '23:00 收', lines: ['正面：晚点来也行。', '背面：23:00 收。', '许叔：有人以为十一点半还行，来时门都落了。'] }, action: { id: 'night-read-sign', label: '翻看旧牌背面', effects: [{ kind: 'clue', id: 'night-old-sign' }] } } },
        { id: 'night-lamp', label: '照着巷口的小灯', x: 9, y: 54, cameraView: 'lamp', icon: 'look', sprite: sprite('night-lamp-on', 6, 14), variants: [{ condition: flag('night-ended'), asset: 'night-lamp-off' }],
          interaction: { kind: 'inspect', text: "小灯仍朝着店里，柜面照得亮，从巷口却不容易看见门还开着。罗姐刚才走过一次才折回来，她看一眼灯，吃完还要顺手给它转个方向。", versions: [{ condition: flag('night-ended'), text: "小灯熄了，远一点的巷口还有路灯。许叔收好柜面，等人出去才放卷帘门，店里不用再靠这一点光接着等谁。" }, { condition: flag('night-luo-left'), text: "罗姐转过的小灯现在朝向巷口，她自己已经赶车去了。你从柜边往外看，门槛也亮了一块，来的人走近之前，就能认出这里还开着。" }] } },
        { id: 'night-waiting-box', label: '柜上待装的饭盒', x: 66, y: 53, cameraView: 'box', icon: 'look', sprite: sprite('night-box', 9, 7.5), condition: all(flag('night-played'), not(flag('night-box-removed'))),
          interaction: { kind: 'inspect', text: "空盒和分装单并排留着，搭扣试过，筷子也按要求放好。饭菜还在锅里，没有为了等人提前盛出来。\n\n许叔看一眼盒口，叫你留着先别拿锅铲，他去看手机。新的消息还停在那里，他得先给对方一句准话。" } },
        { id: 'night-returned-bowl', label: '罗姐送回的空碗', x: 58, y: 52.5, cameraView: 'box', icon: 'look', sprite: sprite('night-empty-bowl', 5.5, 3.8), condition: flag('night-luo-left'), interaction: { kind: 'inspect', text: "空碗放在柜面左侧，跟饭盒和新条分着，没有压住要回的消息。罗姐提包赶十点五十的车去了，许叔伸手拿碗时，先看一眼里面，才把这份收进已吃完的那边。" } },
        { ...person('night-liang', '小梁', 'night-liang', 85, 95, 'night-liang-talk', 'liang'), condition: all(flag('night-arrived'), not(flag('night-pickup'))) },
        { id: 'night-record', label: '今晚的新条', x: 73.5, y: 51.5, cameraView: 'box', icon: 'letter', sprite: sprite('night-flat-note', 6, 3), condition: flag('night-ended'),
          interaction: { kind: 'inspect', text: "十一点落锁，今晚的交接已经收尾。你将时间写在新的一行，前面谁说过什么，就照自己真听见的记，没有再给后头添一句猜想。", versions: [
            { condition: flag('night-legacy'), text: "旧纸只留了当时作出的决定，后来有没有取到饭、回过哪条消息，没有记下来。你把没写的地方留着，今晚新听到的另放一页，没有替旧事补上新的细节。" },
            { condition: flag('night-pickup'), text: "十点五十五取到饭，改时间先回信，十一点落锁。你把双方说定的几句记清，小梁不愿公开的顶班那一段另折起来，没有混进店记。\n\n饭盒已经带走，柜边不用再替他占着位置。" },
            { condition: flag('night-called-off'), text: "取消消息提前发出，这份饭没有交出去，十一点照时落锁。手机上还没有新的回信，你没把对方没回的那半句替他写出来。\n\n许叔收的是空盒，饭并没有先装好等到凉。" },
            { condition: flag('night-missed'), text: "盒子留到关门，手机没有等来新的确认，人也没到。十一点，许叔收起空盒，照说好的时间落锁。\n\n你把未回复那半句抄在时间下面，许叔看完说就是这里漏了，伸手将纸夹回柜边。" },
          ] } },
      ] },
  ],
};
const xuNodes: DialogueSeed[] = [
  { id: 'opening', speaker: '许叔',  choices: [{ id: 'night-listen', label: '订好的那份，留到几点？', next: 'concern', effects: [{ kind: 'flag', id: 'night-listened' }, { kind: 'metric', id: 'care', amount: 1 }] }, { id: 'night-bye', label: '我先看看桌子。', effects: [] }] },
  { id: 'concern', speaker: '许叔',   choices: [{ id: 'night-thanks', label: '我再问问这位客人怎么吃。', effects: [] }, { id: 'night-ask-shift', label: '他每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'shift', speaker: '许叔',  choices: [{ id: 'night-shift-close', label: '我记住了。', effects: [] }] },
  { id: 'preparing', speaker: '许叔',  choices: [{ id: 'night-preparing-close', label: '好，我过去。', effects: [] }, { id: 'night-preparing-ask-shift', label: '纸条上订饭的人，每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'after-game', speaker: '许叔',  choices: [{ id: 'night-after-game-close', label: '我去柜边。', effects: [] }] },
  { id: 'after', speaker: '许叔',  choices: [{ id: 'night-after-close', label: '书在这儿。你也早点回。', effects: [] }] },
];
const handoffNodes: DialogueSeed[] = [
  { id: 'xu-opening', speaker: '许叔',  choices: [{ id: 'night-xu-let-luo-leave', label: '给罗姐让出送碗的地方。', next: 'luo-leaves', effects: [] }] },
  { id: 'not-ready', speaker: '许叔',  choices: [{ id: 'night-counter-prepare', label: '先去灶边。', effects: [] }] },
  { id: 'luo-leaves', speaker: '罗姐', portrait: 'night-luo',   choices: [{ id: 'night-luo-leave', label: '慢点走。把灯留朝着巷口。', next: 'decision', effects: [{ kind: 'flag', id: 'night-luo-left' }] }] },
  { id: 'decision', speaker: '许叔',   choices: [
    { id: 'night-agree', label: '回他，十一点前都能取。到巷口看门灯。', decision: 'night', next: 'pickup-arrival', effects: [{ kind: 'flag', id: 'night-reserve' }] },
    { id: 'night-cancel', label: '今晚先撤，告诉他可以直接上车。', decision: 'night', next: 'cancelled', effects: [{ kind: 'flag', id: 'night-cancel-sent' }] },
    { id: 'night-overpromise', label: '先照旧摆着，等他来再说。', decision: 'night', next: 'missed', effects: [{ kind: 'flag', id: 'night-wait' }] },
    { id: 'night-later', label: '我再看看，先不定。', effects: [] },
  ] },
  { id: 'pickup-arrival', speaker: '许叔',   choices: [{ id: 'night-pass-box', label: '把饭盒递过去。', next: 'liang', effects: [{ kind: 'flag', id: 'night-arrived' }, { kind: 'flag', id: 'night-box-removed' }] }] },
  { id: 'xu-liang', speaker: '许叔',  choices: [{ id: 'night-xu-listen-liang', label: '转向小梁，听他说完。', next: 'liang', effects: [] }] },
  { id: 'liang', speaker: '小梁', portrait: 'night-liang',   choices: [{ id: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', next: 'closing', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'cancelled', speaker: '许叔',   choices: [{ id: 'night-cancel-record', label: '记下已发取消，没把这份饭交出去。', next: 'closing', effects: [{ kind: 'flag', id: 'night-called-off' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-cancelled' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'missed', speaker: '许叔',   choices: [{ id: 'night-missed-record', label: '记下没有回信，也没人来取。', next: 'closing', effects: [{ kind: 'flag', id: 'night-missed' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-missed' }, { kind: 'quest', id: 'night', status: 'failed' }] }] },
  { id: 'closing', speaker: '许叔',   choices: [{ id: 'night-lock-up', label: '把“十一点落锁”写进店记。', condition: flag('night-pickup'), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }] }, { id: 'night-fold-xu-note', label: '店记写关门时间，许叔的私话另折起来。', condition: not(flag('night-pickup')), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }, { kind: 'clue', id: 'night-private-xu' }] }] },
  { id: 'after', speaker: '许叔',   choices: [{ id: 'night-farewell', label: '收好书和随身的东西。', effects: [] }] },
  // Compatibility flag is produced only by migration, and described here for content/save validation.
  { id: 'legacy', speaker: '许叔',  choices: [{ id: 'night-legacy-close', label: '保留原来的记录。', effects: [{ kind: 'flag', id: 'night-legacy' }, { kind: 'flag', id: 'night-ended' }] }] },
];
const nightDialogueSeeds: (Omit<Dialogue, 'nodes'> & { nodes: DialogueSeed[] })[] = [
  { id: 'night-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-luo-left'), nodeId: 'counter-progress' }, { condition: flag('night-played'), nodeId: 'after-game' }, { condition: flag('night-listened'), nodeId: 'preparing' }], nodes: [...xuNodes, { id: 'counter-progress', speaker: '许叔',  choices: [{ id: 'night-return-counter', label: '回柜边接着说。', effects: [] }] }].map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-luo-talk', entry: 'opening', entries: [{ condition: flag('night-luo-left'), nodeId: 'departed' }, { condition: flag('night-played'), nodeId: 'eating' }], nodes: [{ id: 'opening', speaker: '罗姐', portrait: 'night-luo',  choices: [{ id: 'night-luo-order', label: '堂食一碗，辣酱碗沿，筷子碗边。', effects: [{ kind: 'flag', id: 'night-luo-heard' }] }] }, { id: 'eating', speaker: '罗姐', portrait: 'night-luo',   choices: [{ id: 'night-luo-eating-close', label: '好，我去柜边。', effects: [] }] }, { id: 'departed', speaker: '柜边',  choices: [{ id: 'night-luo-departed-close', label: '放下碗，回许叔那边。', effects: [] }] }] },
  { id: 'night-kitchen-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-played'), nodeId: 'prepared' }], nodes: [
    { id: 'opening', speaker: '许叔', portrait: 'night-xu',  choices: [{ id: 'night-kitchen-close', label: '我看看手机，再核对分装。', effects: [] }] },
    { id: 'after', speaker: '许叔', portrait: 'night-xu',  choices: [{ id: 'night-kitchen-after', label: '好。', effects: [] }] },
    { id: 'prepared', speaker: '许叔', portrait: 'night-xu',  choices: [{ id: 'night-kitchen-prepared', label: '去柜边。', effects: [] }] },
  ] },
  { id: 'night-handoff', entry: 'xu-opening', entries: [
    { condition: flag('night-legacy'), nodeId: 'legacy' }, { condition: flag('night-ended'), nodeId: 'after' },
    ...['night-pickup', 'night-called-off', 'night-missed'].map(id => ({ condition: flag(id), nodeId: 'closing' })),
    { condition: flag('night-arrived'), nodeId: 'xu-liang' }, { condition: flag('night-reserve'), nodeId: 'pickup-arrival' }, { condition: flag('night-cancel-sent'), nodeId: 'cancelled' }, { condition: flag('night-wait'), nodeId: 'missed' }, { condition: flag('night-luo-left'), nodeId: 'decision' }, { condition: not(flag('night-played')), nodeId: 'not-ready' },
  ], nodes: handoffNodes.map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-liang-talk', entry: 'opening', entries: [{ condition: flag('night-pickup'), nodeId: 'departed' }, { condition: not(flag('night-arrived')), nodeId: 'awaiting' }], nodes: [
    { id: 'opening', speaker: '小梁', portrait: 'night-liang',   choices: [
      { id: 'night-liang-record', onceKey: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] },
      { id: 'night-liang-close', label: '回柜边，听完交接。', effects: [] },
    ] },
    { id: 'awaiting', speaker: '柜边',  choices: [{ id: 'night-liang-await-close', label: '先找许叔。', effects: [] }] },
    { id: 'departed', speaker: '柜边',  choices: [{ id: 'night-liang-departed-close', label: '回许叔那边。', effects: [] }] },
  ] },
];
export const nightDialogues: Dialogue[] = nightDialogueSeeds.map(({nodes,...dialogue}) => ({ ...dialogue, nodes:nodes.map(node => scriptNode(node,nightScripts[dialogue.id]?.[node.id])) }));
export const nightGame: MinigameDefinition = {
  id: 'night-game', chapterId: 'night', module: 'dual-packing', title: '一碗堂食，一盒带走', target: 100, assistedItem: 'insulated-bag',
  description: '先选一张单，再核对容器、饭菜、辣酱和筷子。罗姐的饭先盛；小梁那份排好分装单，等回信再盛。',
  condition: all(ready, flag('night-reply-read'), unfinished), unavailable: '先听清两位的要求、擦好桌，再读灶边的小梁回信。',
  packing: { orders: [
    { id: 'luo', person: '罗姐 · 堂食', hint: '浅碗，辣酱碗沿，筷子碗边；赶 22:50 末班车。', vessel: 'bowl', sauce: 'rim', utensils: 'beside' },
    { id: 'liang', person: '小梁 · 留餐', hint: '22:55 能到，辣酱另杯，筷子盒外；没收到准话就上车。', vessel: 'box', sauce: 'cup', utensils: 'outside' },
  ] },
  reward: { id: 'night-game-reward', label: '这碗先端走，空盒等回信', feedback: "搭扣试响了一声，许叔将筷子挪到盒外，叫你把好掰的那侧朝外留。罗姐的浅碗端走，另一只饭盒仍空着，他回头交代：“这个等回信再盛，东西分清了就别又拿来装一遍。”", effects: [{ kind: 'flag', id: 'night-played' }, { kind: 'metric', id: 'care', amount: 1 }] },
};
export const nightClues: Entry[] = [
  { id: 'night-reply', title: '小梁改到五十五', text: "小梁说十点五十五到，辣酱另放，筷子留盒外。下班前没等到准话就直接上车，走正门还是侧门，要先看许叔回的这一句。许叔让我读的只有这条新消息，别的没让我翻。", category: 'detail', asset: 'night-phone' },
  { id: 'night-old-sign', title: '旧牌背面的时间', text: "旧牌正面写晚点来也行，背面又补二十三点收。许叔说有人按前头那句，十一点半才来，到了门口才看见锁。写晚一点的人和听晚一点的人，原来没算同一个点。", category: 'detail', asset: 'night-sign' },
  { id: 'night-riceball', title: '那句“快了”', text: "有回很晚才回住处，便利店剩一个饭团，我拿到门口才想起来看看手机。奶奶问到家没有，我回快了，觉得总不能让她跟着等。\n\n回完其实还站在店外拆包装，走到楼下又怕她问吃没吃。那次没跟她讲清，今天念小梁最后半句时才重新想起来。", category: 'life', asset: 'night-phone' },
  { id: 'night-record-pickup', title: '夜饭店记 · 取到了饭', text: "十点五十五，小梁从侧门出来，照着门灯找过来，接到刚盛的饭。辣酱另外装，筷子在外面，搭扣也能用手套掰开。\n\n改时间先回一句准话，十一点落锁，店里这几件写在同一张上。", category: 'life', asset: 'night-packed-box' },
  { id: 'night-record-cancelled', title: '夜饭店记 · 提前取消', text: "许叔提前发消息，说今晚这份先撤，下回再留，盒子没有先装饭。十一点收妥，照时关了门。\n\n屏幕没有新的回信，小梁看见没有、那会儿上没上车，我都不知道，就只记到发出去这一句。", category: 'life', asset: 'night-clip' },
  { id: 'night-record-missed', title: '夜饭店记 · 留到关门', text: "五十五没人进门，十一点也没有回信。许叔翻手机才看到，对方那句没收到准话就上车，自己一直没答。\n\n空盒收回去了，十一点落锁。小梁后来往哪头走，今晚有没有吃别的，没有听到，先不往后记。", category: 'life', asset: 'night-clip' },
  { id: 'night-private-liang', title: '折札 · 小梁的私话', text: "小梁取饭时另外说，今晚替同事顶班的事不要写出来，同事也认识这家店。怎么改时间、往哪里回话可以留，自己那句不想给人围着问。\n\n这段另折着收，店记只留双方约好的办法，没有把它抄进去。", category: 'detail', asset: 'night-clip' },
  { id: 'night-private-xu', title: '折札 · 许叔的私话', text: "许叔说前阵子总拖晚，答应女儿十一点关门，她却还要等他进门才睡。电话里叫先躺着，回来开门，人仍坐在那里。\n\n他让我只记关门时间，这句家里的话听过就好。店记写十一点，别的另折起来。", category: 'detail', asset: 'night-clip' },
];
