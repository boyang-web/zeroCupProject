import type { DialogueBeat, DialogueNode } from '../core/contracts.ts';
import { narrativePages } from './narrative-pages.ts';

export function dialogueReadings(node: DialogueNode): DialogueBeat[] {
  const beats: DialogueBeat[] = node.beats?.length ? node.beats : [{ kind:'speech', speaker:node.speaker, portrait:node.portrait, direction:node.direction, text:node.text }];
  return beats.flatMap(beat => narrativePages(beat.text,160,Array.from(beat.direction??'').length).map((text,i)=>({ ...beat, text, direction:i===0 ? beat.direction : undefined })));
}
