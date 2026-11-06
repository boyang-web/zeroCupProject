import type { Component } from 'vue';
import type { Asset, GameState, MinigameDefinition, MinigameResult } from '../../core/contracts.ts';
export interface MinigameProps { definition: MinigameDefinition; state: GameState; reducedMotion: boolean; assets: Record<string, Asset>; developer?: boolean }
export interface MinigameModule { component: Component }
export type MinigameLoader = () => Promise<MinigameModule>;
export type { MinigameResult };
