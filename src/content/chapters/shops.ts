import type { Chapter, Dialogue, MinigameDefinition } from '../../core/contracts.ts';

// The fourth chapter keeps its short draft until the next content pass.
const seeds = [
  { id: 'night', number: 4, title: '夜里有饭', subtitle: '卷帘门留着半人高。', time: '深夜', next: 'epilogue', asset: 'night', position: 'center', tint: 'night',
    person: '许叔', object: '留餐饭盒', module: 'packing', metric: 'care', clue: 'late-note',
    opening: '还没吃？坐。那只饭盒先别动，有人下夜班来取。你这份我再给你盛。',
    note: '纸条上只写着“十点四十，谢谢”。最后一个字的笔画挤进了折痕。',
    concern: '我十一点关。他要赶不及，得先来个信。不然我在这儿等，他在路上急，谁也睡不好。',
    game: '装好留餐', instruction: '把主食、热菜和餐具放好，再看看保温。前面借的袋子用得上。', target: 75,
  },
];
export const shopChapters: Chapter[] = seeds.map(s => ({
  id: s.id, number: s.number, title: s.title, subtitle: s.subtitle, time: s.time,
  description: s.opening, asset: s.asset, position: s.position, tint: s.tint,
  objective: '帮一会儿忙，听他们把话说完。', questId: s.id, metricIds: [s.metric], next: s.next,
  exit: { kind: 'any', conditions: [{ kind: 'quest', id: s.id, status: 'completed' }, { kind: 'quest', id: s.id, status: 'failed' }] },
  exitHint: '桌上还有事没做完。',
  hotspots: [
    { id: `${s.id}-person`, label: s.person, x: 70, y: 40, icon: 'talk', interaction: { kind: 'dialogue', dialogueId: `${s.id}-talk` } },
    { id: `${s.id}-note`, label: '纸条', x: 24, y: 52, icon: 'letter', completed: { kind: 'clue', id: s.clue }, interaction: { kind: 'inspect', text: s.note, action: { id: `${s.id}-read`, label: '收进书里', effects: [{ kind: 'clue', id: s.clue }, { kind: 'metric', id: s.metric, amount: 1 }] } } },
    { id: `${s.id}-object`, label: s.object, x: 51, y: 73, icon: 'look', completed: { kind: 'flag', id: `${s.id}-played` }, interaction: { kind: 'minigame', gameId: `${s.id}-game` } },
    { id: `${s.id}-menu`, label: '菜单', x: 84, y: 24, icon: 'look', interaction: { kind: 'inspect', text: '“微辣”的“微”被圈了三次。下面有人添了两个字：再微。' } },
  ],
}));
export const shopDialogues: Dialogue[] = seeds.map(s => ({
  id: `${s.id}-talk`, entry: 'opening', nodes: [
    { id: 'opening', speaker: s.person, text: s.opening, choices: [
      { id: `${s.id}-listen`, label: '你慢慢说，我听着。', next: 'concern', effects: [{ kind: 'flag', id: `${s.id}-listened` }, { kind: 'metric', id: s.metric, amount: 1 }] },
      { id: `${s.id}-decide`, label: '忙完了，我们接着说刚才的事。', next: 'decision', condition: { kind: 'flag', id: `${s.id}-played` }, unavailable: '先把手里的活做完。', effects: [] },
      { id: `${s.id}-bye`, label: '我先看看。', effects: [] },
    ] },
    { id: 'concern', speaker: s.person, text: s.concern, choices: [{ id: `${s.id}-thanks`, label: '知道了，我想想。', effects: [] }] },
    { id: 'decision', speaker: s.person, text: '那就从明天试试？哪儿不合适，再坐下来改。', choices: [
      { id: `${s.id}-agree`, label: '先把能做的写清楚，再试。', decision: s.id, condition: { kind: 'flag', id: `${s.id}-listened` }, unavailable: '还没听完对方的打算。', effects: [{ kind: 'quest', id: s.id, status: 'completed' }, { kind: 'metric', id: s.metric, amount: 1 }] },
      { id: `${s.id}-overpromise`, label: '先照原来的办，往后再说。', decision: s.id, effects: [{ kind: 'quest', id: s.id, status: 'failed' }] },
      { id: `${s.id}-later`, label: '再等一下。', effects: [] },
    ] },
  ],
}));
export const shopGames: MinigameDefinition[] = seeds.map(s => ({
  id: `${s.id}-game`, chapterId: s.id, module: s.module, title: s.game,
  description: s.instruction, target: s.target, assistedItem: s.id === 'night' ? 'insulated-bag' : undefined,
  reward: { id: `${s.id}-game-reward`, label: '这边忙完了', effects: [{ kind: 'flag', id: `${s.id}-played` }, { kind: 'metric', id: s.metric, amount: 1 }] },
}));
