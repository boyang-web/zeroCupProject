import type { DialogueBeat, DialogueNode, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';
import { narrativePages } from './narrative-pages.ts';

export function dialogueChoicesOnly(node: DialogueNode, state: GameState): boolean {
  return !!node.choicesOnlyWhen && matches(state, node.choicesOnlyWhen);
}

export function dialogueReadings(node: DialogueNode, state?: GameState): DialogueBeat[] {
  if (state && dialogueChoicesOnly(node, state)) return [{ kind: 'narration', text: '' }];
  const version = state && node.versions?.find(version => matches(state, version.condition));
  const beats: DialogueBeat[] = version ? version.beats : node.beats?.length ? node.beats : [{ kind:'speech', speaker:node.speaker, portrait:node.portrait, direction:node.direction, text:node.text }];
  return beats.flatMap(beat => narrativePages(beat.text,160,Array.from(beat.direction??'').length).map((text,i)=>({ ...beat, text, direction:i===0 ? beat.direction : undefined })));
}
