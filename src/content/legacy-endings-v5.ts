import type { Ending } from '../core/contracts.ts';
export const legacyEndings: Ending[] = [
    { id: 'connected', title: '灯还亮着', text: "奶奶翻到新添的那页，问：“陈伯这字？”\n\n“我的。”\n\n她把书举近一点，又放下来。你以为她嫌乱，正想找张纸重抄，她却指着页角问，这一笔是不是盐。\n\n你说是，她叫你写清，别把调料都记成你自己才认得的样子。写到一半，她拿走笔，添上一个“尝”。你等她写完，才把今天没记进菜谱的事，从陈伯问你请几天假那里讲起。", condition: { kind: 'all', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'remembered', title: '留在书里', text: "奶奶听到一半，问那人后来怎么说。你想了想，说没问。\n\n她哦了一声，把翻起的纸页放平，没有替你接后来的事。窗外的车声过去，你又想起一句刚才漏掉的话，叫她先别翻。\n\n她的手停在页边。你重新从那句话讲，讲到自己答错的地方，先笑出来。奶奶等你笑完，才问：“那你怎么回的？”", condition: { kind: 'any', conditions: ['morning', 'noon', 'night'].map(id => ({ kind: 'quest', id, status: 'completed' })) } },
    { id: 'unfinished', title: '空着的几行', text: "你把书摊开，先念今天问到的做法。奶奶听着，伸手摸了摸后头还空着的纸。\n\n“这几页呢？”\n\n你说没问完。她看你一会儿，叫你把那支快滚到桌边的笔拿回来。笔捡回来，你在空白处写下店名，没有先添一个结尾。\n\n奶奶将书挪离茶壶，说今晚先搁这里。明天起来，你还得从这张桌边经过。" },
  ];
