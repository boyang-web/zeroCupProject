import type { MinigameLoader } from './contracts.ts';
// Lazy-loaded modules return a result; only the domain layer can issue rewards.
const registry: Record<string, MinigameLoader> = {
  breakfast: async () => ({ component: (await import('./BreakfastGame.vue')).default }),
  'service-queue': async () => ({ component: (await import('./ServiceGame.vue')).default }),
  itinerary: async () => ({ component: (await import('./ItineraryGame.vue')).default }),
  steamer: async () => ({ component: (await import('./TuningGame.vue')).default }),
  rolling: async () => ({ component: (await import('./TuningGame.vue')).default }),
  packing: async () => ({ component: (await import('./PackingGame.vue')).default }),
  'dual-packing': async () => ({ component: (await import('./DualPackingGame.vue')).default }),
};
export function registerMinigame(id: string, loader: MinigameLoader) {
  if (registry[id]) throw new Error(`小游戏模块已注册：${id}`);
  registry[id] = loader;
}
export function getMinigame(id: string) { return registry[id]; }
export function registeredMinigames() { return Object.keys(registry); }
