import type { Chapter, Condition, Dialogue, DialogueNode, Entry, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
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
  firstScene: 'night-front', hotspots: [], description: '门里只剩两份饭。靠门的小方桌还没擦，巷口传来一声车响。',
  objective: '擦出一张桌，分清两份饭，再把留餐的事回个准话。',
  exit: flag('night-ended'), exitHint: '许叔还没把今晚的事交代完。去柜边听他说完，再离店。', exitLabel: '合上书，离开小馆',
  revisitDescription: '十一点已经落锁。柜边留着今晚的记录，先前的决定仍然保留。',
  beats: [{ label: '听清两份饭，擦好桌', condition: ready }, { label: '看小梁的回信', condition: flag('night-reply-read') }, { label: '核对堂食与留餐', condition: flag('night-played') }, { label: '回信并听完锁门前的话', condition: flag('night-ended') }],
  scenes: [
    { id: 'night-front', title: '店门', time: '22:40 · 还有两份饭', asset: 'night-front', description: '左边是吃饭的小方桌，右边的柜后还亮着灶火。卷帘门把招牌遮去了一半。',
      variants: [{ condition: flag('night-ended'), time: '23:00 · 回看今晚的店门', description: '罗姐已经赶车去了。许叔收起碗，卷帘门就要放到底。' }, { condition: flag('night-played'), time: '22:48 · 罗姐吃完，起身赶车' }],
      camera: { views: [{ id: 'owner', label: '柜旁的许叔', x: 79, y: 58, zoom: 1.35 }, { id: 'table', label: '靠门小方桌', x: 19, y: 60, zoom: 1.65 }, { id: 'luo', label: '赶末班车的罗姐', x: 38, y: 56, zoom: 1.4 }, { id: 'note', label: '门边纸条', x: 68, y: 39, zoom: 1.8 }] },
      links: [{ sceneId: 'night-kitchen', label: '进灶边，核对两份饭', condition: ready, unavailable: '先跟许叔和罗姐说话，再把靠门那张桌擦好。' }],
      hotspots: [
        person('night-person', '许叔', 'night-xu', 79, 94, 'night-talk', 'owner'),
        { ...person('night-luo', '罗姐', 'night-luo', 38, 91, 'night-luo-talk', 'luo'), condition: not(flag('night-luo-left')), variants: [{ condition: flag('night-played'), asset: 'night-luo-seated', x: 29, y: 89, width: 18, height: 44, cameraView: 'table' }] },
        { id: 'night-table', label: '桌角的抹布', x: 10.5, y: 64, cameraView: 'table', icon: 'look', sprite: sprite('night-cloth', 6, 3.5), completed: flag('night-table-wiped'),
          variants: [{ condition: flag('night-table-wiped'), x: 10, y: 61.5, width: 5, height: 3 }],
          drag: { actionId: 'night-wipe', target: { x: 9, y: 60, width: 16, height: 5 }, hint: '把左侧的抹布拖过桌面，也可点开擦桌。' },
          interaction: { kind: 'inspect', text: '抹布放在桌面左侧，右边还留着一圈水印。罗姐把布包从凳上拿开，给你让出手边的位置。', versions: [{ condition: flag('night-table-wiped'), text: '水印擦干了，抹布叠好放到左后角。右边腾出了端饭的位置。罗姐拉开凳子：“这儿就成，能看见巷口。”' }], options: [{ id: 'night-wipe', label: '把这张桌擦干净', effects: [{ kind: 'flag', id: 'night-table-wiped' }], feedback: '抹布叠好收在左后角。罗姐把凳子往桌边挪：“这儿就成，能看见巷口。”' }] } },
        { id: 'night-note', label: '门边留餐纸条', x: 68, y: 43, cameraView: 'note', icon: 'letter', sprite: sprite('night-clip', 5, 12), completed: clue('late-note'),
          interaction: { kind: 'inspect', manipulation: 'unfold', text: '纸条上只写着“十点四十，谢谢”。最后一个“谢”挤进了折痕。', exhibit: { kind: 'note', kicker: '门边 · 小梁原来的约定', title: '十点四十，谢谢', lines: ['十点四十，谢谢。', '最后一个“谢”挤进了折痕。'] }, action: { id: 'night-read', label: '记下纸条上的字', effects: [{ kind: 'clue', id: 'late-note' }] } } },
        { id: 'night-served-bowl', label: '罗姐的那碗饭', x: 19.5, y: 64, cameraView: 'table', icon: 'look', sprite: sprite('night-bowl', 9, 6.5), condition: all(flag('night-played'), not(flag('night-luo-left'))),
          interaction: { kind: 'inspect', text: '许叔把堂食端到桌上。罗姐拨开碗沿的辣酱，先吃了一口豆腐。', versions: [{ condition: flag('night-luo-left'), text: '罗姐把空碗送到柜边，包往肩上一提，赶十点五十的车去了。' }] } },
      ] },
    { id: 'night-kitchen', title: '灶边', time: '22:40—22:48 · 分装', asset: 'night-kitchen', description: '饭锅在右，水池在左。手机放在干台边，分装台留在两者之间。',
      variants: [{ condition: flag('night-ended'), time: '回看今晚的灶边', description: '今晚的分装已经做过。柜边保留着交接记录。' }],
      camera: { views: [{ id: 'reply', label: '干台边的回信', x: 40, y: 52, zoom: 1.8 }, { id: 'packing', label: '分装台', x: 54, y: 54, zoom: 1.65 }, { id: 'xu', label: '灶旁的许叔', x: 74, y: 56, zoom: 1.35 }] },
      links: [{ sceneId: 'night-front', label: '回店门的小方桌' }, { sceneId: 'night-counter', label: '去柜边交接', condition: flag('night-played'), unavailable: '先读小梁的回信，核对两张分装单。' }],
      hotspots: [
        { ...person('night-xu-kitchen', '灶旁的许叔', 'night-xu', 74, 94, 'night-kitchen-talk', 'xu'), condition: not(flag('night-luo-left')) },
        { id: 'night-phone', label: '许叔让你看的回信', x: 40, y: 57, cameraView: 'reply', icon: 'look', sprite: sprite('night-phone', 7, 4), completed: flag('night-reply-read'),
          interaction: { kind: 'inspect', manipulation: 'phone', text: '许叔手上沾着水，用手背把手机转过来：“你念那条新来的，别的我回头看。”侧门出来是来这儿，正门出去就是上车。他下班前得知道留没留。', exhibit: { kind: 'note', kicker: '22:42 · 小梁的订餐回信', title: '今晚改点', phone: { time: '22:42', heading: '小梁 · 订餐消息', footer: '只查看许叔让你读的这一条' }, lines: [replyText] }, action: { id: 'night-read-reply', label: '把这条回信念给许叔', condition: ready, effects: [{ kind: 'flag', id: 'night-reply-read' }, { kind: 'clue', id: 'night-reply' }] },
            options: [{ id: 'night-recall-message', label: '想起一条旧消息', condition: flag('night-reply-read'), effects: [{ kind: 'clue', id: 'night-riceball' }], feedback: '有回下夜班，便利店只剩一个饭团。奶奶问到家没有，你站在店门口，回了句“快了”。' }] } },
        { id: 'night-object', label: '分装台上的空饭盒', x: 59, y: 57, cameraView: 'packing', icon: 'look', sprite: sprite('night-box', 12, 10), completed: flag('night-played'), condition: all(unfinished, not(flag('night-luo-left'))),
          interaction: { kind: 'minigame', gameId: 'night-game' } },
        { id: 'night-kitchen-bowl', label: '堂食的浅碗', x: 48, y: 56.5, cameraView: 'packing', icon: 'look', sprite: sprite('night-empty-bowl', 8, 6), condition: not(flag('night-played')), interaction: { kind: 'inspect', text: '罗姐要用这只浅碗。辣酱搁碗沿，筷子放碗边；小梁的饭盒要用另一张单。' } },
      ] },
    { id: 'night-counter', title: '柜边', time: '22:48 · 回个准话', asset: 'night-counter', description: '空盒留在柜上。纸夹和旧牌都在手边，门灯还没转向巷口。',
      variants: [{ condition: flag('night-ended'), time: '23:00 · 门灯熄了', description: '许叔把手机扣下，伸手去拉卷帘门。今晚的事写在新条上。' }, { condition: flag('night-wait'), time: '23:00 · 没有人来取' }, { condition: flag('night-reserve'), time: '22:55 · 小梁到了' }, { condition: flag('night-luo-left'), time: '22:48 · 罗姐赶车去了' }],
      camera: { views: [{ id: 'xu', label: '柜边的许叔', x: 47, y: 55, zoom: 1.35 }, { id: 'handoff', label: '留餐夹', x: 37, y: 34, zoom: 1.8 }, { id: 'lamp', label: '门边小灯', x: 10, y: 47, zoom: 1.8 }, { id: 'box', label: '柜上的交接处', x: 67, y: 48, zoom: 1.7 }, { id: 'old-sign', label: '柜台下的旧牌', x: 60, y: 74, zoom: 1.7 }, { id: 'liang', label: '小梁', x: 85, y: 58, zoom: 1.35 }] },
      links: [{ sceneId: 'night-kitchen', label: '回灶边看看' }],
      hotspots: [
        person('night-xu-counter', '柜边的许叔', 'night-xu', 47, 94, 'night-handoff', 'xu'),
        { id: 'night-handoff-clip', label: '留餐夹 · 确认回信', x: 37, y: 42, cameraView: 'handoff', icon: 'talk', sprite: sprite('night-clip', 6, 14), interaction: { kind: 'dialogue', dialogueId: 'night-handoff' } },
        { id: 'night-old-sign', label: '柜台下的旧牌', x: 60, y: 80, cameraView: 'old-sign', icon: 'look', sprite: sprite('night-sign', 7, 11), completed: clue('night-old-sign'),
          interaction: { kind: 'inspect', manipulation: 'flip', text: '旧牌收在柜台下面，靠着柜脚。正面只写“晚点来也行”，背面另有一行小字。', exhibit: { kind: 'note', kicker: '许叔后来补在背面的字', title: '23:00 收', lines: ['正面：晚点来也行。', '背面：23:00 收。', '许叔：有人以为十一点半还行，来时门都落了。'] }, action: { id: 'night-read-sign', label: '翻看旧牌背面', effects: [{ kind: 'clue', id: 'night-old-sign' }] } } },
        { id: 'night-lamp', label: '照着巷口的小灯', x: 9, y: 54, cameraView: 'lamp', icon: 'look', sprite: sprite('night-lamp-on', 6, 14), variants: [{ condition: flag('night-ended'), asset: 'night-lamp-off' }],
          interaction: { kind: 'inspect', text: '门灯还朝着店里。罗姐一会儿要把它转过去，照到巷口。', versions: [{ condition: flag('night-ended'), text: '小灯熄了。巷口远处还有路灯，许叔把卷帘门放下来。' }, { condition: flag('night-luo-left'), text: '罗姐顺手转过的小灯照着巷口。她已经赶车去了。' }] } },
        { id: 'night-waiting-box', label: '柜上待装的饭盒', x: 66, y: 53, cameraView: 'box', icon: 'look', sprite: sprite('night-box', 9, 7.5), condition: all(flag('night-played'), not(flag('night-box-removed'))),
          interaction: { kind: 'inspect', text: '空盒和分装单留在一起。饭菜还在锅里，等许叔确认回信再盛。' } },
        { id: 'night-returned-bowl', label: '罗姐送回的空碗', x: 58, y: 52.5, cameraView: 'box', icon: 'look', sprite: sprite('night-empty-bowl', 5.5, 3.8), condition: flag('night-luo-left'), interaction: { kind: 'inspect', text: '罗姐把空碗送回柜面左侧，和饭盒、新条各放一处。包往肩上一提，赶十点五十的车去了。' } },
        { ...person('night-liang', '小梁', 'night-liang', 85, 95, 'night-liang-talk', 'liang'), condition: all(flag('night-arrived'), not(flag('night-pickup'))) },
        { id: 'night-record', label: '今晚的新条', x: 73.5, y: 51.5, cameraView: 'box', icon: 'letter', sprite: sprite('night-flat-note', 6, 3), condition: flag('night-ended'),
          interaction: { kind: 'inspect', text: '十一点落锁。今晚的交接已经收尾。', versions: [
            { condition: flag('night-legacy'), text: '这里保留的是旧短版的结果。它没有记录今晚是否取到了饭，也没有补写任何回信或私话。' },
            { condition: flag('night-pickup'), text: '十点五十五取到了饭。改时间先回信，十一点落锁。小梁那句顶班的私话另折起来，没有抄进店记。' },
            { condition: flag('night-called-off'), text: '提前发了取消消息。这份饭没有交出去。十一点落锁。屏幕上没有新的回信。' },
            { condition: flag('night-missed'), text: '饭盒留到关门。没有回信，也没人来取。十一点落锁。' },
          ] } },
      ] },
  ],
};
const xuNodes: DialogueNode[] = [
  { id: 'opening', speaker: '许叔', text: '小满？你阿婆叫你来问菜单的？炒菜是我，擦桌的刚进门。\n\n先帮我把靠门这张擦了。还剩两份，一份已经订了，另一份给眼前的人。', choices: [{ id: 'night-listen', label: '订好的那份，留到几点？', next: 'concern', effects: [{ kind: 'flag', id: 'night-listened' }, { kind: 'metric', id: 'care', amount: 1 }] }, { id: 'night-bye', label: '我先看看桌子。', effects: [] }] },
  { id: 'concern', speaker: '许叔', direction: '他拿起手机，给订餐的人发了条消息。', text: '小梁原来说十点四十来，还没见着。我问他一声。\n\n我十一点落锁。十一点零一，你就只能跟门说了。', choices: [{ id: 'night-thanks', label: '我再问问这位客人怎么吃。', effects: [] }, { id: 'night-ask-shift', label: '他每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'shift', speaker: '许叔', text: '看班次。上夜班才来，有时换人，有时改点。\n\n纸夹在门边，省得我给卖错了。', choices: [{ id: 'night-shift-close', label: '我记住了。', effects: [] }] },
  { id: 'preparing', speaker: '许叔', text: '先把桌擦出来，再问罗姐怎么放辣酱。她那班车，可不会等我这口锅。', choices: [{ id: 'night-preparing-close', label: '好，我过去。', effects: [] }, { id: 'night-preparing-ask-shift', label: '纸条上订饭的人，每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'after-game', speaker: '许叔', text: '这碗我先端走。盒子留这儿，等回信。\n\n去柜边吧，罗姐吃完就要赶车。', choices: [{ id: 'night-after-game-close', label: '我去柜边。', effects: [] }] },
  { id: 'after', speaker: '许叔', text: '十一点了。你也回吧，别叫你阿婆等门。\n\n书拿好了，别压在我抹布底下。', choices: [{ id: 'night-after-close', label: '书在这儿。你也早点回。', effects: [] }] },
];
const handoffNodes: DialogueNode[] = [
  { id: 'xu-opening', speaker: '许叔', text: '两张单都核对好了。罗姐刚把饭吃完，等她把碗放下，我跟你说小梁这份。', choices: [{ id: 'night-xu-let-luo-leave', label: '给罗姐让出送碗的地方。', next: 'luo-leaves', effects: [] }] },
  { id: 'not-ready', speaker: '许叔', text: '柜上先别放饭。去灶边读读小梁的回信，把堂食和留餐分清再来。', choices: [{ id: 'night-counter-prepare', label: '先去灶边。', effects: [] }] },
  { id: 'luo-leaves', speaker: '罗姐', portrait: 'night-luo', direction: '她把空碗送回柜边，伸手把小灯转向巷口。', text: '我刚才都走过一回了，还以为你今天关门。灯朝外转点，巷口就看得见。\n\n车到五十，我先走。碗给你搁这儿。', choices: [{ id: 'night-luo-leave', label: '慢点走。把灯留朝着巷口。', next: 'decision', effects: [{ kind: 'flag', id: 'night-luo-left' }] }] },
  { id: 'decision', speaker: '许叔', direction: '他删掉手机上打到一半的“你来了再说”。', text: '他说五十五能到，我十一点准时关。\n\n从侧门出来来这儿，从正门出去就是上车。要留我能等到十一点，要撤就趁他还没下班说。回哪句？', choices: [
    { id: 'night-agree', label: '回他，十一点前都能取。到巷口看门灯。', decision: 'night', next: 'pickup-arrival', effects: [{ kind: 'flag', id: 'night-reserve' }] },
    { id: 'night-cancel', label: '今晚先撤，告诉他可以直接上车。', decision: 'night', next: 'cancelled', effects: [{ kind: 'flag', id: 'night-cancel-sent' }] },
    { id: 'night-overpromise', label: '先照旧摆着，等他来再说。', decision: 'night', next: 'missed', effects: [{ kind: 'flag', id: 'night-wait' }] },
    { id: 'night-later', label: '我再看看，先不定。', effects: [] },
  ] },
  { id: 'pickup-arrival', speaker: '许叔', direction: '消息发出，小梁回了“收到”。十点五十五，卷帘门底下伸进一只戴手套的手。', text: '来了。饭刚盛，辣酱是小杯的，筷子在外头。\n\n小满，把搭扣递给他，好掰的那边朝外。', choices: [{ id: 'night-pass-box', label: '把饭盒递过去。', next: 'liang', effects: [{ kind: 'flag', id: 'night-arrived' }, { kind: 'flag', id: 'night-box-removed' }] }] },
  { id: 'xu-liang', speaker: '许叔', text: '饭已经递给小梁了。他还有句话跟你说，你听他把话说完，我再落锁。', choices: [{ id: 'night-xu-listen-liang', label: '转向小梁，听他说完。', next: 'liang', effects: [] }] },
  { id: 'liang', speaker: '小梁', portrait: 'night-liang', direction: '他付完钱，把饭盒提稳，又指了指许叔的手机。', text: '巷口就看见灯了。下回又改点，我还发这儿？\n\n怎么约可以记。今晚替人顶班那句别写，我同事也认识你们。', choices: [{ id: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', next: 'closing', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'cancelled', speaker: '许叔', direction: '他发出“今晚这份先撤，你直接坐车吧。下回再给你留”，收起空盒，把旧条取下。', text: '这回说清楚了。明天那张，我也得留个能回话的地方。\n\n屏幕就停在这儿，还没新回信。', choices: [{ id: 'night-cancel-record', label: '记下已发取消，没把这份饭交出去。', next: 'closing', effects: [{ kind: 'flag', id: 'night-called-off' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-cancelled' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'missed', speaker: '许叔', direction: '十点五十五，巷口有人经过，门没响。到十一点，他拿起手机，看见最后一句仍是“没收到准话，就直接上车”。', text: '我一直等他来。他等的是我回这一句。\n\n盒子收了吧。', choices: [{ id: 'night-missed-record', label: '记下没有回信，也没人来取。', next: 'closing', effects: [{ kind: 'flag', id: 'night-missed' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-missed' }, { kind: 'quest', id: 'night', status: 'failed' }] }] },
  { id: 'closing', speaker: '许叔', direction: '他看了一眼手机，把它扣在柜上，伸手去够门边的灯。', text: '前阵子我老把饭留过头。我答应闺女十一点关门回家，她等我进门才肯去睡。\n\n你书里写十一点关就成，家里等我的这句别写。', choices: [{ id: 'night-lock-up', label: '把“十一点落锁”写进店记。', condition: flag('night-pickup'), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }] }, { id: 'night-fold-xu-note', label: '店记写关门时间，许叔的私话另折起来。', condition: not(flag('night-pickup')), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }, { kind: 'clue', id: 'night-private-xu' }] }] },
  { id: 'after', speaker: '许叔', direction: '门灯熄了。他把钥匙从围裙兜里摸出来。', text: '去吧。书和随身的东西都拿上，别落在柜边。\n\n路口还有灯，慢点走。', choices: [{ id: 'night-farewell', label: '收好书和随身的东西。', effects: [] }] },
  // Compatibility flag is produced only by migration, and described here for content/save validation.
  { id: 'legacy', speaker: '许叔', text: '这里保留的是此前短版已经作出的决定；当晚取餐的细节没有记下来。', choices: [{ id: 'night-legacy-close', label: '保留原来的记录。', effects: [{ kind: 'flag', id: 'night-legacy' }, { kind: 'flag', id: 'night-ended' }] }] },
];
export const nightDialogues: Dialogue[] = [
  { id: 'night-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-luo-left'), nodeId: 'counter-progress' }, { condition: flag('night-played'), nodeId: 'after-game' }, { condition: flag('night-listened'), nodeId: 'preparing' }], nodes: [...xuNodes, { id: 'counter-progress', speaker: '许叔', text: '罗姐赶车去了。小梁这份的事，到柜边接着说。', choices: [{ id: 'night-return-counter', label: '回柜边接着说。', effects: [] }] }].map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-luo-talk', entry: 'opening', entries: [{ condition: flag('night-luo-left'), nodeId: 'departed' }, { condition: flag('night-played'), nodeId: 'eating' }], nodes: [{ id: 'opening', speaker: '罗姐', portrait: 'night-luo', text: '还有没有饭？我十点五十的车，豆腐照常，辣酱搁碗边，我自己拨。\n\n吃得完。站牌就在拐角，我还没老到要提前十分钟站那儿。', choices: [{ id: 'night-luo-order', label: '堂食一碗，辣酱碗沿，筷子碗边。', effects: [{ kind: 'flag', id: 'night-luo-heard' }] }] }, { id: 'eating', speaker: '罗姐', portrait: 'night-luo', direction: '她把碗沿那点辣酱拨开，夹起一块豆腐。', text: '这块烧透了，里面还烫。\n\n我吃完把碗送柜上。你先去，别站在这儿等我咽。', choices: [{ id: 'night-luo-eating-close', label: '好，我去柜边。', effects: [] }] }, { id: 'departed', speaker: '柜边', text: '罗姐已经赶车去了。空碗留在柜面左侧，门灯转向了巷口。', choices: [{ id: 'night-luo-departed-close', label: '放下碗，回许叔那边。', effects: [] }] }] },
  { id: 'night-kitchen-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-played'), nodeId: 'prepared' }], nodes: [
    { id: 'opening', speaker: '许叔', portrait: 'night-xu', text: '他下班常没脱手套，扣子缠圈粗布，好掰。\n\n先把两份分清。筷子放外面，别让他到了车上才从饭里拔。饭盒现在先留空，等回信再盛。', choices: [{ id: 'night-kitchen-close', label: '我看看手机，再核对分装。', effects: [] }] },
    { id: 'after', speaker: '许叔', portrait: 'night-xu', text: '锅盖好，灶也收了。今晚就到这儿。', choices: [{ id: 'night-kitchen-after', label: '好。', effects: [] }] },
    { id: 'prepared', speaker: '许叔', portrait: 'night-xu', text: '两份分清了，空盒也试扣过了。接着去柜边说留餐，不用再装一遍。', choices: [{ id: 'night-kitchen-prepared', label: '去柜边。', effects: [] }] },
  ] },
  { id: 'night-handoff', entry: 'xu-opening', entries: [
    { condition: flag('night-legacy'), nodeId: 'legacy' }, { condition: flag('night-ended'), nodeId: 'after' },
    ...['night-pickup', 'night-called-off', 'night-missed'].map(id => ({ condition: flag(id), nodeId: 'closing' })),
    { condition: flag('night-arrived'), nodeId: 'xu-liang' }, { condition: flag('night-reserve'), nodeId: 'pickup-arrival' }, { condition: flag('night-cancel-sent'), nodeId: 'cancelled' }, { condition: flag('night-wait'), nodeId: 'missed' }, { condition: flag('night-luo-left'), nodeId: 'decision' }, { condition: not(flag('night-played')), nodeId: 'not-ready' },
  ], nodes: handoffNodes.map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-liang-talk', entry: 'opening', entries: [{ condition: flag('night-pickup'), nodeId: 'departed' }, { condition: not(flag('night-arrived')), nodeId: 'awaiting' }], nodes: [
    { id: 'opening', speaker: '小梁', portrait: 'night-liang', direction: '他已经付过钱，饭盒提在手里。', text: '巷口就看见灯了。下回又改点，我还发这儿？\n\n怎么约可以记。今晚替人顶班那句别写，我同事也认识你们。', choices: [
      { id: 'night-liang-record', onceKey: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] },
      { id: 'night-liang-close', label: '回柜边，听完交接。', effects: [] },
    ] },
    { id: 'awaiting', speaker: '柜边', text: '小梁还没到店。先跟许叔确认要回哪一句。', choices: [{ id: 'night-liang-await-close', label: '先找许叔。', effects: [] }] },
    { id: 'departed', speaker: '柜边', text: '小梁已经提着饭盒离开。取餐的事记好了，许叔还在柜边收尾。', choices: [{ id: 'night-liang-departed-close', label: '回许叔那边。', effects: [] }] },
  ] },
];
export const nightGame: MinigameDefinition = {
  id: 'night-game', chapterId: 'night', module: 'dual-packing', title: '一碗堂食，一盒带走', target: 100, assistedItem: 'insulated-bag',
  description: '先选一张单，再核对容器、饭菜、辣酱和筷子。罗姐的饭先盛；小梁那份排好分装单，等回信再盛。',
  condition: all(ready, flag('night-reply-read'), unfinished), unavailable: '先听清两位的要求、擦好桌，再读灶边的小梁回信。',
  packing: { orders: [
    { id: 'luo', person: '罗姐 · 堂食', hint: '浅碗，辣酱碗沿，筷子碗边；赶 22:50 末班车。', vessel: 'bowl', sauce: 'rim', utensils: 'beside' },
    { id: 'liang', person: '小梁 · 留餐', hint: '22:55 能到，辣酱另杯，筷子盒外；没收到准话就上车。', vessel: 'box', sauce: 'cup', utensils: 'outside' },
  ] },
  reward: { id: 'night-game-reward', label: '这碗先端走，空盒等回信', feedback: '搭扣响了一声。许叔把筷子放到盒外：“对，别让他到了车上才从饭里拔。这碗我先端走，空盒留着，等回信。”', effects: [{ kind: 'flag', id: 'night-played' }, { kind: 'metric', id: 'care', amount: 1 }] },
};
export const nightClues: Entry[] = [
  { id: 'night-reply', title: '小梁改到五十五', text: '22:55 能到，辣酱另放，筷子盒外。下班前没收到准话，就直接上车。许叔只给小满看了这一条消息。', category: 'detail', asset: 'night-phone' },
  { id: 'night-old-sign', title: '旧牌背面的时间', text: '正面写“晚点来也行”，背面后来补了“23:00 收”。许叔说有人十一点半到了门口，才发现已经落锁。', category: 'detail', asset: 'night-sign' },
  { id: 'night-riceball', title: '那句“快了”', text: '有回下夜班，便利店只剩一个饭团。奶奶问到家没有，小满站在店门口，回了一句“快了”。这件事还没告诉她。', category: 'life', asset: 'night-phone' },
  { id: 'night-record-pickup', title: '夜饭店记 · 取到了饭', text: '十点五十五，小梁取到了饭。改时间先回信。十一点落锁。', category: 'life', asset: 'night-packed-box' },
  { id: 'night-record-cancelled', title: '夜饭店记 · 提前取消', text: '许叔提前发了取消消息。这份饭没有交出去。十一点落锁。没有新的回信，未得知小梁是否已读或上车。', category: 'life', asset: 'night-clip' },
  { id: 'night-record-missed', title: '夜饭店记 · 留到关门', text: '饭盒留到关门。没有回信，也没人来取。十一点落锁。未得知小梁当晚的去处。', category: 'life', asset: 'night-clip' },
  { id: 'night-private-liang', title: '折札 · 小梁的私话', text: '小梁说今晚替同事顶班，并叮嘱“怎么约可以记，顶班那句别写”。私札另收，没有抄进店记。', category: 'detail', asset: 'night-clip' },
  { id: 'night-private-xu', title: '折札 · 许叔的私话', text: '许叔答应女儿十一点关门，她等他进门才睡。他叮嘱只写关门时间，这句家里的话别写。私札另收。', category: 'detail', asset: 'night-clip' },
];
