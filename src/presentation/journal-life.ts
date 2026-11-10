import type { ContentPack, GameState } from '../core/contracts.ts';
import {matches} from '../core/conditions.ts';

export function journalLifeEntries(content: ContentPack, state: GameState, developer = false) {
  const acquired = new Map(state.clues.map((id,index) => [id,index]));
  return content.clues.filter(entry => entry.category === 'life' && (developer || acquired.has(entry.id)))
    .sort((a,b) => (acquired.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (acquired.get(b.id) ?? Number.MAX_SAFE_INTEGER))
    .map(entry=>{const version=entry.versions?.find(v=>matches(state,v.condition));return {...entry,title:version?.title??entry.title,asset:version?.asset??entry.asset};});
}

export function lifePageForEntry(ids: string[], id: string | undefined, leaves: number) {
  const index = ids.indexOf(id ?? '');
  return index < 0 ? 0 : Math.floor(index / Math.max(1,leaves));
}
