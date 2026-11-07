import type { DialogueBeat, DialogueNode } from '../core/contracts.ts';

export type DialogueSeed = Omit<DialogueNode, 'text' | 'direction' | 'beats'>;
export type DialogueScripts = Record<string, readonly DialogueBeat[]>;
const portraits: Record<string,string | undefined> = { '奶奶':'grandmother', '陈伯':'chen', '阿宁':'ning', '琴姐':'qin', '阿川':'chuan', '田姨':'tian' };
export function say(speaker: string, text: string, direction?: string): DialogueBeat {
  return { kind:'speech', speaker, text, portrait:portraits[speaker], ...(direction ? { direction } : {}) };
}
export function narrate(text: string): DialogueBeat { return { kind:'narration', text }; }
export function scriptNode(seed: DialogueSeed, script: readonly DialogueBeat[] | undefined): DialogueNode {
  const beats = script ? [...script] : [];
  return { ...seed, beats, text:beats.map(b=>b.kind==='speech' ? `${b.speaker}：${b.text}` : b.text).join('\n\n') };
}
