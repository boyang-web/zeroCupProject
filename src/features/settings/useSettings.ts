import { ref, watch } from 'vue';
import type { StoragePort } from '../../infrastructure/saves.ts';
export function useSettings(storage: StoragePort) {
  let initial: { reducedMotion?: boolean; volume?: number; musicVolume?:number; effectsVolume?:number; muted?:boolean } = {};
  try { initial = JSON.parse(storage.getItem('baiwei:settings:v1') ?? '{}') ?? {}; } catch { /* use defaults */ }
  const reducedMotion = ref(typeof initial.reducedMotion === 'boolean' ? initial.reducedMotion : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const level=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.min(1,Math.max(0,value)):fallback;
  const musicVolume=ref(level(initial.musicVolume,typeof initial.volume==='number'&&initial.volume>0?level(initial.volume,.36)*.5:.18));
  const effectsVolume=ref(level(initial.effectsVolume,.25));
  const muted=ref(initial.muted===true);
  watch([reducedMotion, musicVolume,effectsVolume,muted], () => {
    try { storage.setItem('baiwei:settings:v1', JSON.stringify({ reducedMotion: reducedMotion.value, musicVolume:musicVolume.value,effectsVolume:effectsVolume.value,muted:muted.value })); } catch { /* Settings stay available for this session. */ }
  });
  return { reducedMotion, musicVolume,effectsVolume,muted };
}
