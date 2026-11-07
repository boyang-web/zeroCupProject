import type { ContentPack } from '../core/contracts.ts';
import { assets } from './assets.ts';
import { arrival, commission, arrivalGame } from './chapters/arrival.ts';
import { shopChapters, shopDialogues, shopGames } from './chapters/shops.ts';
import { epilogue } from './chapters/epilogue.ts';
import { morning, morningDialogues, morningGame } from './chapters/morning.ts';
import { noon, noonDialogues, noonGame } from './chapters/noon.ts';
import { progression, recipes, collection } from './progression.ts';
export const content: ContentPack = {
  id: 'baiwei-homecoming', version: 4, firstChapter: 'arrival', assets, progression, recipes, collection,
  chapters: [arrival, morning, noon, ...shopChapters, epilogue], dialogues: [commission, ...morningDialogues, ...noonDialogues, ...shopDialogues], minigames: [arrivalGame, morningGame, noonGame, ...shopGames],
  quests: [arrival, morning, noon, ...shopChapters, epilogue].map(c => ({ id: c.questId, chapterId: c.id, title: c.title, text: c.objective })),
  clues: [
    { id: 'job-gap', title: '我这次回来', text: '上份工作已经结束。这趟回长明巷，暂时没有买返程票。手机里还存着没改完的简历。', category: 'life', asset: 'phone-stand' },
    { id: 'grandma-first-page', title: '奶奶的第一张食谱', text: '刚搬到长明巷时，奶奶也把米酒煮糊过。隔壁的大姐教过她，后来她开始拿本子记做法。大姐已经搬走，书里仍留着她写的几行字。', category: 'life', asset: 'recipe-rice' },
    { id: 'photo-margin', title: '背板的小字', text: '“第一次来长明巷，认门认了三回。”这句话写在旧照片背板的边缘，奶奶还没讲过。', category: 'detail' },
    { id: 'my-first-pay', title: '第一份工资那天', text: '那天你和朋友去常经过的小馆，点了平时舍不得加的菜。几个人一直坐到店家收桌子，才一起往回走。旧备忘里还记着店名。', category: 'life', asset: 'phone-stand' },
    { id: 'book', title: '百味录', text: '三张书签，三家店。末尾几页的纸还很新。' },
    { id: 'family-photo', title: '六岁那年的合照', text: '你挤在大人中间，袖口卷得很高。照片背面写着：六岁，闹着帮忙，最后帮着吃了三个。' },
    { id: 'invitation', title: '祖母的信', text: '“你说工作的事，我知道了。想回来就回来，屋子给你留着。”到站票根也夹在信封里。' },
    { id: 'calendar', title: '日历上的小勾', text: '日历上记着取眼镜、买桂花和小满回家。几件事挤在同一个格子里。' },
    { id: 'book-purpose', title: '祖母要问的事', text: '谁在掌勺，老客还来不来。她嘱咐：问过了再写。' },
    { id: 'chen-memory', title: '陈伯记得你', text: '你离开之后，陈伯也问过几回。后来不问了，只说孩子忙。' },
    { id: 'schedule', title: '阿宁的备料表', text: '面请人送，先蒸两笼，七点开门。纸上最后一行：爸，你先别急着说不行。' },
    { id: 'board-marks', title: '案板背面的铅笔线', text: '阿宁的身高，一道压着一道。新漆刷过一半，在那几条线旁边停了。' },
    { id: 'knee-note', title: '护膝盒盖', text: '“走楼梯的时候戴着。”陈伯在旁边写了个小小的“好”。' },
    { id: 'breakfast-order', title: '周叔那一袋', text: '两只青菜包，不要辣。陈伯另写：上次的围裙，还没谢她。' },
    { id: 'old-customer', title: '六点半的老周', text: '退休后仍按出车的点起。包子带回去，老伴的粥刚好熬好。' },
    { id: 'school-letter', title: '城南小学', text: '下周一报到。卡片上有孩子的字：陈老师，给你留了靠窗的座位。' },
    { id: 'bus-note', title: '账本最后一页', text: '城南小学，六点十分，下雨到桥下等。陈伯抄了三遍，末尾写着：豆沙，放保温袋。' },
    { id: 'ning-photo', title: '店门口的校服照', text: '相框背面：她说长大了当老师。' },
    { id: 'ning-breakfast', title: '她那只豆沙包', text: '阿宁小时候考坏了，在后院磨蹭。陈伯装没看见，照旧给她留甜的。' },
    { id: 'morning-record', title: '一笼早饭', text: '周叔的两只先拿走了。桌上剩一只豆沙，一只鲜肉，父女俩都坐了下来。', category: 'life', asset: 'prop-buns' },
    { id: 'morning-unfinished', title: '没说完的早饭', text: '阿宁把表收回了围裙兜。明早的面，陈伯还是按原来的数订。', category: 'life', asset: 'prop-buns' },
    { id: 'orders', title: '不要葱', text: '新订单和旧账页上，同一个名字后面跟着同三个字。' },
    { id: 'wrong-bowl', title: '那碗没动的面', text: '田姨要半份，不要葱。端来的却是加葱的一整碗。' },
    { id: 'half-portion', title: '旧菜单上的半份', text: '小字写着：中午不够吃可以加。手机里还没有这一项。' },
    { id: 'two-pots', title: '灶上两口锅', text: '半份也要现擀，省不了一半手。' },
    { id: 'capacity', title: '五张十五分钟', text: '吐单机旁边有阿川算到一半的数。他在“十五分钟”下面打了问号。' },
    { id: 'order-limit', title: '没按下的开关', text: '同时接单数可以改。阿川在旁边写了“二”，还没按下去。' },
    { id: 'familiar-names', title: '琴姐的旧账本', text: '田姨半份不葱，阿宁少醋。祖母的名字后面画着一只小碗。' },
    { id: 'cancelled-order', title: '退回来的一碗', text: '超时的单子，纸角有一圈汤印。' },
    { id: 'half-missed', title: '琴姐没写下的事', text: '她记得半份和不要葱，却没写进新菜单。忙起来，两头都顾不上。' },
    { id: 'chuan-count', title: '阿川算过的数', text: '一口锅前留一单。先把这两单做完，再接后面的。' },
    { id: 'chuan-return', title: '回来帮忙的阿川', text: '夜班的地方撤了。他回来时，琴姐没多问，先给他系上围裙。' },
    { id: 'tian-order', title: '田姨的六分钟', text: '半份，不放葱。吃完要赶回对面锁边，机器还开着。' },
    { id: 'noon-record', title: '窗边这碗', text: '半份、不葱，终于写进了传菜单。田姨吃了，琴姐也腾出手歇了一会儿。' },
    { id: 'noon-unfinished', title: '又响起来的小票', text: '下一张仍印着十五分钟。琴姐先关小灶火，给等久的客人回电话。' },
    { id: 'late-note', title: '十点四十', text: '留餐纸条，最后一个“谢”字挤进了折痕。' },
  ],
  items: [
    { id: 'baiwei-book', title: '祖母的百味录', icon: '书', text: '书脊补过。三张书签夹在该去的那几页，靠近后头的纸还很新。' },
    { id: 'small-key', title: '小钥匙', icon: '匙', text: '祖母交给你的钥匙，可以打开早餐店的小柜子。' },
    { id: 'insulated-bag', title: '陈伯的保温袋', icon: '袋', text: '他让你先拿着，跑完几家再还。内衬刚换过，摸着有点厚。' },
  ],
  metrics: [
    { id: 'attention', title: '留心', text: '在老宅里看看物件，听奶奶把话说完。' },
    { id: 'listening', title: '倾听', text: '在家庭小店中了解与参与的经历。' },
    { id: 'research', title: '调研', text: '在老店中了解需求并参与劳动的经历。' },
    { id: 'care', title: '照应', text: '在夜间小馆中体察与提供帮助的经历。' },
  ],
  achievements: [
    { id: 'home-again', title: '日历的小字', text: '奶奶把你回来的日子圈了起来。', condition: { kind: 'all', conditions: [{ kind: 'clue', id: 'calendar' }, { kind: 'clue', id: 'invitation' }] } },
    { id: 'ready-to-go', title: '书签整好了', text: '清晨、午间、深夜，祖母在旁边写了时间。', condition: { kind: 'flag', id: 'arrival-packed' } },
    { id: 'first-page', title: '第一页', text: '书脊有新补的棉线。', condition: { kind: 'clue', id: 'book' } },
    { id: 'echo', title: '夹在账本里的纸', text: '两家店的账本都夹着另外一张纸。', annotation: '阿宁算了六点半送面，琴姐记了客人不要葱。阿婆从前写在书里的，大约也有这些琐碎。', condition: { kind: 'all', conditions: [{ kind: 'clue', id: 'schedule' }, { kind: 'clue', id: 'orders' }] } },
    { id: 'two-papers', title: '两张纸', text: '一张想让父亲晚起，一张怕女儿误车。', condition: { kind: 'flag', id: 'morning-plan' } },
    { id: 'home-clothes', title: '外套和围裙', text: '祖母拎走外套。琴姐递来围裙。', annotation: '阿川说，琴姐没追问他下一份工作。你想起回家那晚，奶奶先让你把外套脱下来吃饭。', condition: { kind: 'all', conditions: [{ kind: 'clue', id: 'calendar' }, { kind: 'clue', id: 'chuan-return' }] } },
    { id: 'all-pages', title: '末尾的小字', text: '多了三行。你把字写得比前面大了一点。', condition: { kind: 'all', conditions: ['schedule', 'orders', 'late-note'].map(id => ({ kind: 'clue', id })) } },
  ],
  endings: [
    { id: 'connected', title: '灯还亮着', text: '祖母翻到一半，指着空出的一行问：“这儿呢？”你把椅子往桌前挪了挪，接过她手里的笔。', condition: { kind: 'all', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'remembered', title: '留在书里', text: '有一页写得很短。桌上还剩半壶茶，祖母等你从头说起。', condition: { kind: 'any', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'unfinished', title: '空着的几行', text: '祖母把书翻到末尾。你看了一会儿，先在页角写下今天的日期。' },
  ],
};
