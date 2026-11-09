import type { ContentPack, GameState } from '../core/contracts.ts';
import { matches } from '../core/conditions.ts';
import { isRevisiting } from '../core/progression.ts';
import { scenesOf, sceneOf } from '../core/scenes.ts';

export interface SceneRoute {
  id: string;
  label: string;
  side: 'left' | 'right';
  kind: 'move' | 'home' | 'travel';
  sceneId?: string;
  disabled?: boolean;
  hint?: string;
  control?: 'home' | 'departure';
}

export function sceneRoutes(state: GameState, content: ContentPack, options: { canTravel: boolean; home: boolean; developer?: boolean }): SceneRoute[] {
  const chapter = content.chapters.find(c => c.id === state.chapterId)!;
  const rooms = scenesOf(chapter), scene = sceneOf(state, content);
  const current = rooms.findIndex(s => s.id === scene.id);
  const routes: SceneRoute[] = scene.links.map(link => ({
    id: 'move-' + link.sceneId, label: link.label, kind: 'move', sceneId: link.sceneId,
    side: rooms.findIndex(s => s.id === link.sceneId) < current ? 'left' : 'right',
    disabled: !options.developer && !matches(state, link.condition), hint: link.unavailable,
  }));
  if (options.home && state.chapterId !== 'arrival') routes.push({ id: 'home', kind: 'home', label: '回奶奶家', side: 'left', control: 'home' });
  if (isRevisiting(state)) {
    const anchor = content.chapters.find(c => c.id === state.journey.chapterId)!;
    const room = scenesOf(anchor).find(s => s.id === state.journey.sceneId)!;
    routes.push({
      id: 'resume', kind: 'travel', side: 'right', control: 'departure',
      label: '回到' + (anchor.location ?? anchor.title) + (room.title !== anchor.title ? ' · ' + room.title : ''),
    });
  } else if (options.canTravel) routes.push({ id: 'departure', kind: 'travel', label: chapter.exitLabel ?? '往前走', side: 'right', control: 'departure' });
  return routes;
}
