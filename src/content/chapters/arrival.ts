import type { Chapter, Dialogue, DialogueBeat, MinigameDefinition } from '../../core/contracts.ts';
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
    {"id":"thread-spool","label":"白线轴","x":64.3,"y":83,"cameraView":"tea","icon":"look","sprite":{"asset":"arrival-thread-spool","width":2.8,"height":3.5,"z":11},"completed":{"kind":"any","conditions":[{"kind":"flag","id":"arrival-spool-returned"},{"kind":"reward","id":"arrival-remember"},{"kind":"reward","id":"arrival-notice-book"}]},"variants":[{"condition":{"kind":"any","conditions":[{"kind":"flag","id":"arrival-spool-returned"},{"kind":"reward","id":"arrival-remember"},{"kind":"reward","id":"arrival-notice-book"}]},"x":59.5,"y":59.7,"width":1.65,"height":2.5}],"drag":{"actionId":"return-spool","target":{"x":58.3,"y":57,"width":3.2,"height":6},"hint":"把白线轴放到奶奶手边的小几上，也能点开归还。"},"interaction":{"kind":"inspect","text":"白线轴滚到椅脚外，线头拖着一点。你拾起来，奶奶先叫你别拿着越缠越紧，下回找线头又得抠半天。\n\n木轴还好好的，白线和篮里的蓝线不是补同一件东西。小几上有个空处，可以先放回她手边。","versions":[{"condition":{"kind":"any","conditions":[{"kind":"flag","id":"arrival-spool-returned"},{"kind":"reward","id":"arrival-remember"},{"kind":"reward","id":"arrival-notice-book"}]},"text":"线轴已经放回小几，线头留在外面，没打结。奶奶用指尖抽出一截，够这一段就压回去，伸手就能接着缝。"}],"action":{"id":"look-thread-spool","label":"看看这卷线","effects":[{"kind":"clue","id":"thread-spool"}]},"options":[{"id":"return-spool","label":"留好线头，放回奶奶手边","condition":{"kind":"not","condition":{"kind":"any","conditions":[{"kind":"flag","id":"arrival-spool-returned"},{"kind":"reward","id":"arrival-remember"},{"kind":"reward","id":"arrival-notice-book"}]}},"unavailable":"线轴已经在手边了。","effects":[{"kind":"flag","id":"arrival-spool-returned"},{"kind":"metric","id":"attention","amount":1}],"feedback":"你松开一圈，将线头留在外面。奶奶试着抽一下，说这就好，别再给她系个解不开的结。"}]}},
    {"id":"grocery-slip","label":"从旧书里取出的便条","x":51.1,"y":47.5,"cameraView":"desk","icon":"letter","sprite":{"asset":"arrival-grocery-slip","width":3.4,"height":2.1,"z":8},"condition":{"kind":"clue","id":"book"},"completed":{"kind":"clue","id":"osmanthus-note"},"interaction":{"kind":"inspect","manipulation":"flip","text":"奶奶从旧书里取出的购物单，先搁在桌边。鸡蛋、青菜、桂花，前头的价钱有的画过线，桂花旁边倒另圈了一下。\n\n翻到背面，米酒的做法挤在原来空着的地方，糖那句旁边有更细的笔迹。你问是不是一张纸用了两回，奶奶说还能写，为什么不能用。","exhibit":{"kind":"note","kicker":"购物单背面 · 米酒旧方","title":"桂花最后撒","lines":["正面：鸡蛋、青菜、桂花。","背面：米酒，清水，糖。","细笔改字：尝过再放。"]},"action":{"id":"read-osmanthus-note","label":"看清两种笔迹","effects":[{"kind":"clue","id":"osmanthus-note"}]}}},
    { id: 'grandma', label: '奶奶', cameraView: 'grandma', x: 77, y: 95, icon: 'talk', sprite: { asset: 'grandmother-home', width: 28, height: 71, z: 6 }, interaction: { kind: 'dialogue', dialogueId: 'commission' }, completed: { kind: 'flag', id: 'entrusted' } },
    { id: 'book', label: '百味录', cameraView: 'desk', x: 46, y: 48.2, icon: 'book', sprite: { asset: 'arrival-book', width: 6.3, height: 4, z: 7 }, condition: { kind: 'any', conditions: [{ kind: 'not', condition: { kind: 'flag', id: 'arrival-packed' } }, revisitUnlocked] }, completed: { kind: 'clue', id: 'book' }, interaction: {"kind":"inspect","manipulation":"book","journalLink":true,"text":"旧书放在窗下，书脊补过一截新线，靠前的页夹得鼓，后面却还平着。你拿近，先沿着书脊托住，不敢一下掰开。\n\n奶奶说没那么娇气，翻就是，夹的纸别一块儿倒地上。封面下还有几张长短不同的纸，得翻开才看得清。","exhibit":{"kind":"book","kicker":"奶奶的旧食谱","title":"百味录","lines":["桂花米酒 · 奶奶的旧方","清水煮开，酒酿拨散，最后撒桂花。","“糖先少放，尝了再说。”"],"caption":"先把这一页誊清。其余的，等走到店里再问。"},"action":{"id":"inspect-book","label":"翻开书页","effects":[{"kind":"clue","id":"book"}]},"activityId":"arrival-route","versions":[{"condition":{"kind":"clue","id":"book"},"text":"扉页写着百味录，旁边那只碗长了两条腿。你伸手挡住，奶奶就说画都画了这么多年，现在才嫌不好看。\n\n米酒方子夹在前头，一张购物单翻过来，背面才是水、酒酿和糖。奶奶把纸抽出，先搁在桌边，叫你别将它跟要带走的三张书签夹混。\n\n糖的量被划掉，旁边细笔添着尝过再放。你想把旧的涂黑，她说留着，下回问起为什么改，还能看原来的。你把这一句抄清，后面三家店的时间也得重新理一理。"}]} },
    { id: 'photo', label: '旧合照', cameraView: 'cabinet', x: 21.6, y: 44, icon: 'look', sprite: { asset: 'prop-photo', width: 6.5, height: 8.7, z: 4 }, completed: { kind: 'clue', id: 'family-photo' }, interaction: {"kind":"inspect","manipulation":"flip","text":"照片里的你踩着小凳，手够着案板，袖口卷得一边高一边低。陈伯在后头扶凳背，奶奶手里拿着你的外套，自己只露半边肩膀。\n\n案上那个包子没合拢，馅从边上冒出来。你记得从前讲这件事，总说自己做成一个月亮，这张照的却不太像。相框背板能松动，翻过去还有奶奶的字。","exhibit":{"kind":"photo","kicker":"照片背面 · 祖母的字","title":"那年，第一笼包子","lines":["“小满六岁。闹着要帮忙，","最后帮着吃了三个。”"],"caption":"“三个”被圈过一回，旁边的日期倒没有圈。"},"action":{"id":"read-family-photo","label":"记住这张照片","effects":[{"kind":"clue","id":"family-photo"},{"kind":"metric","id":"attention","amount":1}]},"versions":[{"condition":{"kind":"clue","id":"family-photo"},"text":"背面写小满六岁，闹着要帮忙，最后帮着吃了三个。最后那几个字挤到框边，三个又给圈了一遍。\n\n你问为什么特意圈，奶奶说你回来跟人家报只吃一个，那另两个难道是凳子吃的。你忍不住笑，翻到正面，又看一眼那个没包住的口。\n\n陈伯到底怎么让你把它放进笼的，到了店里可以问问他。"}]} },
    { id: 'letter', label: '信封', cameraView: 'entry', x: 13.3, y: 70.5, icon: 'letter', sprite: { asset: 'arrival-letter', width: 9, height: 5, z: 9 }, completed: { kind: 'clue', id: 'invitation' }, interaction: {"kind":"inspect","manipulation":"unfold","text":"小满：\n\n你说工作的事，我知道了。上次电话没问清，住的地方还方便不方便，东西多不多，要搬的时候有人搭把手没有。要回来就回来，被子晒过，床单也换了，不用到家再找。\n\n我还想请你帮个忙，以前记吃食的那本书，后面几页老空着。陈家和琴记现在怎么做，想去问，买完菜又先回来，改天改天，就一直没改到。你回来有空，替我跑两趟。\n\n不是叫你一下车就忙，觉先睡足。那件厚点的外套带着，早晚坐门口用得上。别带东西，家里有。住几天都行，不用先跟我定返程，你把来的车次说准，改了也告诉我。\n\n——奶奶\n\n信封里还夹着到站的票根。你在车上重折过，没照她原来的折痕，这两道现在都压在纸上，摊开才平。","exhibit":{"kind":"letter","kicker":"回家前寄来 · 已拆封","title":"小满：","lines":["你说工作的事，我知道了。","想回来就回来，屋子给你留着。","那本旧书还空着几页，正好想找你帮忙。","不用带东西，住几天都行。"],"caption":"最后一行，比前面的字小一点。"},"action":{"id":"read-invitation","label":"把信折回去","effects":[{"kind":"clue","id":"invitation"},{"kind":"metric","id":"attention","amount":1}]}} },
    { id: 'tea', label: '温茶', cameraView: 'tea', x: 61.9, y: 60, icon: 'tea', sprite: { asset: 'arrival-cup', width: 4, height: 4.1, z: 10 }, variants: [{ condition: { kind: 'flag', id: 'tea-offered' }, x: 64.4, y: 59.9 }], drag: { actionId: 'offer-tea', target: { x: 63.5, y: 58.8, width: 2, height: 2.4 }, hint: '往靠近藤椅的一侧挪' }, completed: { kind: 'flag', id: 'tea-offered' }, interaction: {"kind":"inspect","text":"杯碟放在小几外沿，你一伸手就碰得到，奶奶却要往前探。她刚才够过一次，没够着，接着又先问别的。\n\n你想将缺口转开，端近才看见本来就朝里。奶奶说她认得哪边喝，叫你托住底碟，里头还有一点洒的水，别只提杯耳。往靠藤椅的那边挪一点，她就够得着。","versions":[{"condition":{"kind":"flag","id":"tea-offered"},"text":"杯碟已经让到奶奶手边。她转过半圈喝一口，放回去，又让缺口朝里。\n\n你还想替她转，她摆手说这样就好，叫你给自己那只杯子倒一点，别光在壶边站着。"}],"options":[{"id":"offer-tea","label":"把茶杯往奶奶手边挪一点","effects":[{"kind":"flag","id":"tea-offered"},{"kind":"metric","id":"attention","amount":1}],"feedback":"奶奶扶住杯碟，转半圈才端起来，说这边就够得着。她见你还站着，又指旁边那只空杯子：“你那杯呢？壶里有，先给自己倒一口。”"}]} },
    { id: 'calendar', label: '旧日历', cameraView: 'wall', x: 22.6, y: 32, icon: 'look', sprite: { asset: 'prop-calendar', width: 6.1, height: 16.3, z: 3 }, interaction: {"kind":"inspect","manipulation":"flip","text":"取眼镜、买桂花、小满回家，挤在同一个格子。前两件各打了小勾，名字旁边却是圈，外头还改过一次日期。\n\n你问怎么还不打勾，奶奶说昨晚光顾着叫你吃饭，后来收完碗就忘了。她让你先别撕，说取眼镜的小票夹在背面，等下还得看。\n\n你将票放回原处，想起改车次那回，自己在手机上退了重买，只回过一个电话，墙上也跟着涂改了一次。","exhibit":{"kind":"note","kicker":"日历页角","title":"这几天","lines":["取眼镜。","买桂花。","小满回家。"],"caption":"你的名字旁边，她画了一个圈。"},"action":{"id":"read-calendar","label":"看清改过的日期","effects":[{"kind":"clue","id":"calendar"}]}} },
    { id: 'phone', label: '手机', cameraView: 'entry', x: 7.5, y: 73.8, icon: 'look', sprite: { asset: 'arrival-phone', width: 6.2, height: 5.5, z: 9 }, completed: { kind: 'clue', id: 'job-gap' }, interaction: {"kind":"inspect","manipulation":"phone","text":"手机搁在低柜上，昨晚回来时就放在这里，充电线还压在包带底下。你拿起来看一眼，奶奶在窗边问是不是有人找。\n\n你说没有，就看一下。她叫你先把线抽出来，别提着手机，连包也拖走。屏幕还是暗的，轻触一下就能亮。","exhibit":{"kind":"note","kicker":"草稿 · 尚未发出","title":"个人简历","lines":["起止：仍写着“至今”","简介：能够适应……","返程：暂未决定"],"caption":"昨晚回家时，奶奶先让你吃了饭。"},"action":{"id":"arrival-read-phone","label":"看看屏幕","effects":[{"kind":"clue","id":"job-gap"}]},"versions":[{"condition":{"kind":"clue","id":"job-gap"},"text":"个人简介下面停着能够适应，后面没接上。你在车上换过几回说法，没改好，回到家又先说吃完饭再改。\n\n结束日期还留着至今。你点进去，光标就闪在那里，奶奶又问是不是没看清字，要不要给你挪灯。\n\n你说看得清，是没想好。她应一声，叫你别一直拿着壳子转，底下那截线快给绕成结了。"}]} },
  ],
};

const nodes: DialogueSeed[] = [
  { id: 'welcome', speaker: '奶奶',   choices: [
    { id: 'arrival-ate', label: "吃了点，还能再吃。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
    { id: 'arrival-hungry', label: "还没，刚起来。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
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
    {"id":"arrival-thread-question","label":"那卷白线和蓝线补的还不一样？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
    {"id":"arrival-osmanthus-question","label":"这张单子上的桂花，就是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
    {"id":"arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},
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
  {"id":"grandma-early-return-arrival-thread-question","label":"那卷白线和蓝线补的还不一样？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
{"id":"grandma-early-return-arrival-osmanthus-question","label":"这张单子上的桂花，就是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
{"id":"grandma-early-return-arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},] },
  { id: 'grandma-chen-chat', speaker: '奶奶',   choices: [{ id: 'grandma-chen-chat-close', label: "我回去再看看他怎么说。", effects: [] }] },
  { id: 'grandma-ning-chat', speaker: '奶奶',   choices: [{ id: 'grandma-ning-chat-close', label: "好，我问她什么时候有空。", effects: [] }] },
  { id: 'grandma-later', speaker: '奶奶',   choices: [
    {"id":"grandma-ask-noon","label":"琴记那碗错的面，我还想跟你讲讲。","condition":{"kind":"flag","id":"noon-played"},"unavailable":"先在琴记做完眼前那几张单。","next":"grandma-noon-chat","effects":[]},
    { id: 'grandma-ask-first-page', label: '你最早是什么时候开始记做法的？', next: 'grandma-first-story', effects: [] },
    { id: 'grandma-ask-photo-margin', label: '照片背面说，你刚来时认门认了三回？', next: 'grandma-new-neighbor', condition: { kind: 'clue', id: 'photo-margin' }, unavailable: '重新细看那张照片，也许能找到这句话。', effects: [] },
    { id: 'grandma-return-bye', label: '我坐一会儿，等下还得出去。', effects: [] },
  {"id":"grandma-later-arrival-thread-question","label":"那卷白线和蓝线补的还不一样？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
{"id":"grandma-later-arrival-osmanthus-question","label":"这张单子上的桂花，就是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
{"id":"grandma-later-arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},] },
  { id: 'grandma-first-story', speaker: '奶奶',   choices: [{ id: 'grandma-record-first-story', label: "把那个“再”字补清楚。", effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  { id: 'grandma-new-neighbor', speaker: '奶奶',   choices: [{ id: 'grandma-photo-story-close', label: '原来门口的花盆还有这段事。', effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  {"id":"thread","speaker":"奶奶","choices":[{"id":"arrival-thread-close","label":"我不打结，给你放好。","effects":[]}]},
  {"id":"osmanthus","speaker":"奶奶","choices":[{"id":"arrival-osmanthus-close","label":"我先把糖这句抄准。","effects":[]}]},
  {"id":"phone-draft","speaker":"奶奶","choices":[{"id":"arrival-draft-close","label":"你点这里退一格，我给你看看。","effects":[]}]},
  {"id":"grandma-noon-chat","speaker":"奶奶","choices":[{"id":"grandma-noon-close","label":"我下次去还可以接着问。","effects":[]}]},
];
const returnToRequest: DialogueBeat[] = [{kind:'speech',speaker:'奶奶',portrait:'grandmother',text:'那就先照你问清的来，别把这会儿要问我的，也一块带去问陈伯。'},{kind:'speech',speaker:'小满',text:'我再确认一句。'},{kind:'speech',speaker:'奶奶',portrait:'grandmother',text:'问，等下出门就别又在台阶上翻半天。'}];
export const commission: Dialogue = {
  id: 'commission', entry: 'welcome', entries: [
    { condition: lifeUnlocked, nodeId: 'grandma-later' },
    { condition: revisitUnlocked, nodeId: 'grandma-early-return' },
    { condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'not', condition: { kind: 'flag', id: 'arrival-instructions' } }] }, nodeId: 'instructions' },
    { condition: { kind: 'flag', id: 'entrusted' }, nodeId: 'followup' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'flag', id: 'arrival-greeted' }, nodeId: 'home' },
  ], nodes: nodes.map(n => scriptNode({ portrait: 'grandmother', ...n, speaker: n.speaker === '祖母' ? '奶奶' : n.speaker, versions: n.id === 'request' ? [{condition:{kind:'any',conditions:[{kind:'reward',id:'arrival-understand-book'},{kind:'reward',id:'arrival-admit'},{kind:'reward',id:'arrival-photo-reply'}]},beats:returnToRequest}] : n.id === 'home' ? [{condition:{kind:'flag',id:'arrival-spool-returned'},beats:arrivalScripts.home!.map(beat=>beat.text==='一只白线轴从椅脚边滚过去。奶奶刚往前探，你已经弯下腰。'?{kind:'narration',text:'白线轴已经搁在小几上。奶奶伸手去拿，你先将旁边的布篮挪开一点。'}:beat.text==='就那个，别把篮子整个端起来，里头有针。'?{...beat,text:'线轴就放那儿，别把篮子整个端起来，里头有针。'}:beat)}] : undefined }, arrivalScripts[n.id])),
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
