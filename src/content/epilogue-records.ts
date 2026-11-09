import type { GameState } from '../core/contracts.ts';

// Read actual local results, never infer a specific event from quest success.
export const shopRecords = [
  { id: 'morning', title: '一笼早饭', rows: [
    ['morning-plan', '后天六点半先送一盆样面，第一笼照旧，第二笼试。先验再收，试三天，再商量七点开门的事。'],
    ['morning-table', '父女俩先在后院吃了早饭。陈伯答应先看一盆样面，试三天和晚开门都还没定。'],
    ['morning-defer', '阿宁把备料表折好，放在柜旁。陈伯先照旧做，答应晚上再看；样面还没约，不往这页添试行的日期。'],
  ], fallback: '这页只记着陈家，还没留下父女最后怎么商量的。' },
  { id: 'noon', title: '窗边那一桌', rows: [
    ['noon-limited', '琴记先试一周，同时最多留两单，堂食也算。没接下的、做不出的都记着，试完一周一起对。'],
    ['noon-counter', '堂食单有了自己的夹子。半份、不要葱写清楚，纸上和手机上都要有；接几单留到晚上另算。'],
    ['noon-overload', '接单时间暂时仍留着十五分钟。阿川拿着单子出去说明赶不上，让客人决定等不等；改过时间的原纸留着晚上对。'],
  ], fallback: '这页还没记下琴记最后采用哪种接单办法。' },
  { id: 'night', title: '夜里有饭', rows: [
    ['night-legacy', '这页留着上回的决定。后头有没有取到饭、回过消息，没有记下，先不补。'],
    ['night-pickup', '十点五十五取到了饭。改时间先回信。十一点落锁。'],
    ['night-called-off', '提前发了取消消息。这份饭没有交出去。十一点落锁。'],
    ['night-missed', '饭盒留到关门。没有回信，也没人来取。十一点落锁。'],
  ], fallback: '这页只留着店名，交接的事还没有记全。' },
];
export function epilogueRecords(state: GameState) {
  return shopRecords.map(r => ({ id: r.id, title: r.title, text: r.rows.find(([flag]) => state.flags.includes(flag!))?.[1] ?? r.fallback }));
}
