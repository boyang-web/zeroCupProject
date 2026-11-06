import { ref, watch } from 'vue';
import type { StoragePort } from '../../infrastructure/saves.ts';
export function useSettings(storage: StoragePort) {
  let initial: { hints?: boolean; reducedMotion?: boolean; volume?: number } = {};
  try { initial = JSON.parse(storage.getItem('baiwei:settings:v1') ?? '{}') ?? {}; } catch { /* use defaults */ }
  const hints = ref(typeof initial.hints === 'boolean' ? initial.hints : true);
  const reducedMotion = ref(typeof initial.reducedMotion === 'boolean' ? initial.reducedMotion : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const volume = ref(typeof initial.volume === 'number' && Number.isFinite(initial.volume) ? Math.min(1, Math.max(0, initial.volume)) : 0);
  watch([hints, reducedMotion, volume], () => {
    try { storage.setItem('baiwei:settings:v1', JSON.stringify({ hints: hints.value, reducedMotion: reducedMotion.value, volume: volume.value })); } catch { /* Settings stay available for this session. */ }
  });
  return { hints, reducedMotion, volume };
}
