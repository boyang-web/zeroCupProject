import { onScopeDispose, ref, watch } from 'vue';

type Schedule = (callback: () => void, delay: number) => () => void;
interface ReadingSource {
  texts: () => readonly string[];
  actions?: () => number;
  reduced?: () => boolean;
  identity?: () => string;
  lead?: number;
}
const schedule: Schedule = (callback, delay) => {
  const timer = setTimeout(callback, delay);
  return () => clearTimeout(timer);
};

// A reading cursor belongs to the open view, never to the story save.
export function useReadingSequence(source: ReadingSource, clock: Schedule = schedule) {
  const visibleCounts = ref<number[]>([]), visibleActions = ref(0), textDone = ref(false);
  let passages: string[][] = [], passage = 0, generation = 0;
  let cancel: (() => void) | undefined;
  const stop = () => { generation++; cancel?.(); cancel = undefined; };
  function later(callback: () => void, delay: number) {
    const expected = generation;
    cancel = clock(() => { cancel = undefined; if (expected === generation) callback(); }, delay);
  }
  function nextAction() {
    if (visibleActions.value >= (source.actions?.() ?? 0)) return;
    visibleActions.value++;
    if (visibleActions.value < (source.actions?.() ?? 0)) later(nextAction, 150);
  }
  function finishPassages() {
    textDone.value = true;
    if ((source.actions?.() ?? 0) > 0) later(nextAction, 180);
  }
  function advance() {
    while (passage < passages.length && visibleCounts.value[passage] >= passages[passage]!.length) passage++;
    if (passage >= passages.length) { finishPassages(); return; }
    const character = passages[passage]![visibleCounts.value[passage]!]!;
    visibleCounts.value[passage]!++;
    const atEnd = visibleCounts.value[passage] === passages[passage]!.length;
    if (atEnd && passage === passages.length - 1) { finishPassages(); return; }
    later(advance, atEnd || /[。！？!?…\n]/u.test(character) ? 220 : /[，、；：,;:]/u.test(character) ? 100 : 26);
  }
  function showAll() {
    stop(); visibleCounts.value = passages.map(p => p.length); textDone.value = true;
    visibleActions.value = source.actions?.() ?? 0;
  }
  function restart() {
    stop(); passages = source.texts().map(text => Array.from(text)); passage = 0;
    visibleCounts.value = passages.map(() => 0); visibleActions.value = 0; textDone.value = false;
    if (source.reduced?.()) { showAll(); return; }
    if (passages.every(p => p.length === 0)) finishPassages();
    else later(advance, source.lead ?? 120);
  }
  function finishText() {
    if (textDone.value) return;
    stop(); visibleCounts.value = passages.map(p => p.length); finishPassages();
  }
  watch(() => JSON.stringify([source.identity?.(), source.texts()]), restart, { immediate: true, flush: 'sync' });
  watch(() => source.actions?.() ?? 0, count => {
    visibleActions.value = Math.min(visibleActions.value, count);
    if (source.reduced?.()) visibleActions.value = count;
    else if (textDone.value && visibleActions.value < count && !cancel) later(nextAction, 180);
  }, { flush: 'sync' });
  watch(() => source.reduced?.(), reduced => { if (reduced) showAll(); }, { flush: 'sync' });
  onScopeDispose(stop);
  return { visibleCounts, visibleActions, textDone, finishText };
}
