import type { ContentPack, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';
import { featureUnlocked } from '../core/progression.ts';

export function discoveryNotice(previous: GameState, next: GameState, content: ContentPack) {
  // Continuing a save restores knowledge; it does not teach the first recipe
  // whose condition happens to be true in that save.
  if (previous.phase === 'title' || next.phase === 'title') return;
  const recipe = content.recipes?.find(r => matches(next, r.condition) && !matches(previous, r.condition));
  const life = content.clues.find(c => c.category === 'life' && next.clues.includes(c.id) && !previous.clues.includes(c.id));
  if (recipe || life && featureUnlocked(next, content, 'lifeNotes')) {
    return { entryId: recipe?.id ?? life!.id, title: recipe?.title ?? life!.title, text: recipe ? '食谱添了一页' : '人间百味有了新记' };
  }
  if (featureUnlocked(next, content, 'lifeNotes') && !featureUnlocked(previous, content, 'lifeNotes')) {
    return { title: '可以记下人的故事了', text: '百味录多了「人间百味」。也可以走访熟悉的地方。' };
  }
  if (featureUnlocked(next, content, 'collection') && !featureUnlocked(previous, content, 'collection')) {
    return { title: '物件收藏已开放', text: '从菜单细看以前互动过的物件，找找没留意的地方。' };
  }
}
