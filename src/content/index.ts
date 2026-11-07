import type { ContentPack } from '../core/contracts.ts';
import { assets } from './assets.ts';
import { arrival, commission, arrivalGame } from './chapters/arrival.ts';
import { night, nightDialogues, nightGame, nightClues } from './chapters/night.ts';
import { epilogue } from './chapters/epilogue.ts';
import { morning, morningDialogues, morningGame } from './chapters/morning.ts';
import { noon, noonDialogues, noonGame } from './chapters/noon.ts';
import { progression, recipes, collection } from './progression.ts';
export const content: ContentPack = {
  id: 'baiwei-homecoming', version: 5, firstChapter: 'arrival', assets, progression, recipes, collection,
  chapters: [arrival, morning, noon, night, epilogue], dialogues: [commission, ...morningDialogues, ...noonDialogues, ...nightDialogues], minigames: [arrivalGame, morningGame, noonGame, nightGame],
  quests: [arrival, morning, noon, night, epilogue].map(c => ({ id: c.questId, chapterId: c.id, title: c.title, text: c.objective })),
  clues: [
    ...nightClues,
    { id: 'tian-curtain', title: '门帘上的旧针脚', text: '琴记门帘的边，田姨补过三回。新换的那幅，下午再带来。', category: 'detail' },
    { id: 'qin-recipe-tip', title: '清汤与煮面分开', text: '琴姐让清汤另温，面另起水煮，捞进碗后再兑汤。葱最后问过再撒，别临时从不要葱的那碗里捡。', category: 'detail' },
    { id: 'job-gap', title: '我这次回来', text: "简历停在“能够适应”，后头还没想好填什么。上一份工作的结束日期倒很清楚，只占一小格；可那个“至今”，不能再留在那里了。\n\n昨晚奶奶叫我洗手吃饭，我说吃完再改。今天屏幕亮起来，仍是那一句。我先看了一遍有没有新消息，明明没有发出什么，又不知在等谁回。\n\n还没有买返程票。到站的票根留在信封里，原想整理行李时扔掉，包却还没拆完。", category: 'life', asset: 'arrival-phone' },
    { id: 'grandma-first-page', title: '奶奶的第一张食谱', text: "奶奶说，她第一回把米酒煮糊，还怪过锅。隔壁的人接过锅铲，刮给她看，她才不再辩。\n\n我一直认得这张配方，不知道糖那句是别人添的。奶奶让我念，念错了笔迹归谁，她纠正一次；漏掉一个“再”，她又拦住。尝过，再放。那个字写得轻，压在水痕旁，不挪近一点就会看漏。\n\n她没有说要给这一页换纸。我把那个“再”补清，别的仍留在原处。", category: 'life', asset: 'recipe-rice' },
    { id: 'photo-margin', title: '背板的小字', text: '“第一次来长明巷，认门认了三回。”这句话写在旧照片背板的边缘，奶奶还没讲过。', category: 'detail' },
    { id: 'my-first-pay', title: '第一份工资那天', text: "旧便签里记着：“今晚吃顿好的。”下面是小馆的名字，还有三个人各要什么。轮到我，写了一个“肉”，后面两个字已经忘了为什么没打。\n\n那天真点菜时，还是选了平常那几样，只多加一份。朋友叫我别又算人均，我说这回我请，等付钱时才发现，自己从坐下就一直捏着手机。\n\n走出店，几个人又在路边站了一会儿，没谁急着散。我原以为那顿吃了很贵的菜，菜单都忘了，这个小动作倒想得起来。", category: 'life', asset: 'phone-stand' },
    { id: 'book', title: '百味录', text: '三张书签，三家店。末尾几页的纸还很新。' },
    { id: 'family-photo', title: '六岁那年的合照', text: '你挤在大人中间，袖口卷得很高。照片背面写着：六岁，闹着帮忙，最后帮着吃了三个。' },
    { id: 'invitation', title: "奶奶的信", text: '“你说工作的事，我知道了。想回来就回来，屋子给你留着。”到站票根也夹在信封里。' },
    { id: 'calendar', title: '日历上的小勾', text: '日历上记着取眼镜、买桂花和小满回家。几件事挤在同一个格子里。' },
    { id: 'book-purpose', title: "奶奶托我问的事", text: "陈家的馅、琴记的汤，奶奶想问现在的做法。肯讲就记，不肯讲也能先吃一碗。" },
    { id: 'chen-memory', title: '陈伯记得你', text: '你离开之后，陈伯也问过几回。后来不问了，只说孩子忙。' },
    { id: 'schedule', title: '阿宁的备料表', text: "六点半送发好的面团，先验再收；先蒸两笼，七点开门。阿宁把电话写在背面，另留一句：爸，你先别急着说不行。" },
    { id: 'board-marks', title: "案板上的准线", text: "案板上刻过一段分剂子的准线。陈伯说，从前也有一头切大、一头切小的时候。如今撒了粉，不仔细看就找不到。" },
    { id: 'knee-note', title: "盒盖里那个“好”", text: '“走楼梯的时候戴着。”陈伯在旁边写了个小小的“好”。' },
    { id: 'breakfast-order', title: '周叔那一袋', text: "老周七点半来取，两只青菜包分两袋。陈伯说褶收得齐的那只给他老伴，老周自己拿着走。" },
    { id: 'old-customer', title: "七点半的老周", text: "老周七点半来。陈伯说，他退休以后仍爱早出门，进店等一会儿，就又要帮忙擦台子、招呼客人。" },
    { id: 'school-letter', title: '城南小学', text: '下周一报到。卡片上有孩子的字：陈老师，给你留了靠窗的座位。' },
    { id: 'bus-note', title: '账本最后一页', text: '城南小学，六点十分，下雨到桥下等。陈伯抄了三遍，末尾写着：豆沙，放保温袋。' },
    { id: 'ning-photo', title: '店门口的校服照', text: '相框背面：她说长大了当老师。' },
    { id: 'ning-breakfast', title: '她那只豆沙包', text: "阿宁说，小时候拿成绩单回来，总先洗手擦桌子，迟迟不肯开书包。陈伯递给她豆沙包，她收了，反而更不敢把成绩单拿出来。" },
    { id: 'morning-record', title: '一笼早饭', text: "陈伯进后院，手擦干了，自己的碗还在外侧。他说你先吃，阿宁也说你先吃。我跟着站在旁边，好像得等谁再说一句，才能坐下。\n\n后来阿宁掰开豆沙包，他也把肉的拿起来。纸还在桌上，碗要放下时，得把纸让开一点。父女俩说一句，吃一口，没有再隔着门喊。\n\n我把书从腿上挪到干凳，先吃自己的那份。想问肉馅怎么调，等咽下这口，终于能慢点问。", category: 'life', asset: 'morning-breakfast' },
    { id: 'morning-unfinished', title: '没说完的早饭', text: "阿宁说，下周一照常去报到，表留下，晚点再谈。她拿走教案，没有把报到信重新压进包底。陈伯说原来的数不改，收碗时又把自己的分了出来。\n\n我本来还想说一句“过几天就好了”。看着桌上那张没被拿走的纸，终于没说。送面晚了怎么办，谁来验，原来每一项都得问过人，不能只靠我在中间点头。\n\n临走，我把自己那只碗放到水池边。陈伯说下次来了先吃，别一进门就跟着忙。", category: 'life', asset: 'morning-breakfast' },
    { id: 'orders', title: '不要葱', text: '新订单和旧账页上，同一个名字后面跟着同三个字。' },
    { id: 'wrong-bowl', title: '那碗没动的面', text: '田姨要半份，不要葱。端来的却是加葱的一整碗。' },
    { id: 'half-portion', title: '旧菜单上的半份', text: '小字写着：中午不够吃可以加。手机里还没有这一项。' },
    { id: 'two-pots', title: '灶上两口锅', text: '半份也要现擀，省不了一半手。' },
    { id: 'capacity', title: '五张十五分钟', text: '吐单机旁边有阿川算到一半的数。他在“十五分钟”下面打了问号。' },
    { id: 'order-limit', title: '没按下的开关', text: '同时接单数可以改。阿川在旁边写了“二”，还没按下去。' },
    { id: 'familiar-names', title: '琴姐的旧账本', text: '田姨半份不葱，阿宁少醋。祖母的名字后面画着一只小碗。' },
    { id: 'cancelled-order', title: '退回来的一碗', text: '超时的单子，纸角有一圈汤印。' },
    { id: 'half-missed', title: '琴姐没写下的事', text: "琴姐说，手机菜单先填整份，是她跟阿川一起定的；半份怎么算、怎么装，原打算空下来再说，后来一直没说。" },
    { id: 'chuan-count', title: '阿川算过的数', text: "阿川原来的数只算下锅，漏了捞面、兑汤、装盒和交接。他把两口锅画在空单上，要重新把这些工序填进去。" },
    { id: 'chuan-return', title: '回来帮忙的阿川', text: "阿川说，回来那天，家里让琴姐给他留面。她问下午有没有事，他说没有，留到现在。其实那天下午，他原想改简历。" },
    { id: 'tian-order', title: '田姨的六分钟', text: "田姨要半份、不放葱。从下锅起六分钟做好，还得留出吃面的工夫。真赶不上，要直接告诉她，她对面还有衣服等着缝。" },
    { id: 'noon-record', title: '窗边这碗', text: "田姨要的不是吃得快，是吃得完。错端过来那碗，她没挑葱，没动筷，得等我们重新做。那阵工夫，她始终挎着包坐着。\n\n下午要送的帘边还在对面，她没有趁等饭跑回去拿。面上桌以后，总算能将包搁下，卷起第一筷子。\n\n三张单收下去了。琴姐把我的面端来，让书离碗远一点。我先夹一口，烫，又舍不得马上放下，吹了好几回。该怎么记这碗清汤，等吃完再问。", category: 'life', asset: 'plain-noodle' },
    { id: 'noon-unfinished', title: '又响起来的小票', text: "三张旧单做完，又来新单。屏幕仍照十五分钟接着，琴姐叫阿川先出去说赶不上。他走得快，到门口反倒慢了，得听完对方的话再解释。\n\n我说自己的面不急，琴姐说，不急也得做，先答应过我。她留了算得歪歪扭扭的原纸，说哪个时间改过，她晚上要看。\n\n我没有把那张重誊。新的纸拿回来了，原的还在夹子底下；希望下回来时，他们拿出来讲过。", category: 'life', asset: 'noon-order-rail' },
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
    { id: 'echo', title: '夹在账本里的纸', text: '两家店的账本都夹着另外一张纸。', annotation: "一张记着送面团的时间，一张记着窗边的半份面。纸都在，人各站在门的一边，刚才还没来得及对过。", condition: { kind: 'all', conditions: [{ kind: 'clue', id: 'schedule' }, { kind: 'clue', id: 'orders' }] } },
    { id: 'two-papers', title: '两张纸', text: '一张想让父亲晚起，一张怕女儿误车。', condition: { kind: 'flag', id: 'morning-plan' } },
    { id: 'home-clothes', title: '外套和围裙', text: "奶奶叫我吃饭。琴姐留阿川帮忙。", annotation: "阿川说他那天下午没事，其实原想回去改简历。陈伯问我请几天假时，我也没有答。", condition: { kind: 'all', conditions: [{ kind: 'clue', id: 'calendar' }, { kind: 'clue', id: 'chuan-return' }] } },
    { id: 'all-pages', title: '末尾的小字', text: '多了三行。你把字写得比前面大了一点。', condition: { kind: 'all', conditions: ['schedule', 'orders', 'late-note'].map(id => ({ kind: 'clue', id })) } },
  ],
  endings: [
    { id: 'connected', title: '灯还亮着', text: "奶奶翻到新添的那页，问：“陈伯这字？”\n\n“我的。”\n\n她把书举近一点，又放下来。你以为她嫌乱，正想找张纸重抄，她却指着页角问，这一笔是不是盐。\n\n你说是，她叫你写清，别把调料都记成你自己才认得的样子。写到一半，她拿走笔，添上一个“尝”。你等她写完，才把今天没记进菜谱的事，从陈伯问你请几天假那里讲起。", condition: { kind: 'all', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'remembered', title: '留在书里', text: "奶奶听到一半，问那人后来怎么说。你想了想，说没问。\n\n她哦了一声，把翻起的纸页放平，没有替你接后来的事。窗外的车声过去，你又想起一句刚才漏掉的话，叫她先别翻。\n\n她的手停在页边。你重新从那句话讲，讲到自己答错的地方，先笑出来。奶奶等你笑完，才问：“那你怎么回的？”", condition: { kind: 'any', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'unfinished', title: '空着的几行', text: "你把书摊开，先念今天问到的做法。奶奶听着，伸手摸了摸后头还空着的纸。\n\n“这几页呢？”\n\n你说没问完。她看你一会儿，叫你把那支快滚到桌边的笔拿回来。笔捡回来，你在空白处写下店名，没有先添一个结尾。\n\n奶奶将书挪离茶壶，说今晚先搁这里。明天起来，你还得从这张桌边经过。" },
  ],
};
