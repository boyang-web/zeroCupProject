import type { Chapter, ContentPack, GameState, SceneDefinition } from './contracts.ts';
export function scenesOf(chapter: Chapter): SceneDefinition[] {
  return chapter.scenes ?? [{ id: `${chapter.id}-main`, title: chapter.title, description: chapter.description, asset: chapter.asset, hotspots: chapter.hotspots, links: [], position: chapter.position, tint: chapter.tint }];
}
export function firstSceneOf(chapter: Chapter) { return chapter.firstScene ?? scenesOf(chapter)[0].id; }
export function sceneOf(state: GameState, content: ContentPack) {
  const chapter = content.chapters.find(c => c.id === state.chapterId)!;
  return scenesOf(chapter).find(s => s.id === state.sceneId)!;
}
export function hotspotsOf(chapter: Chapter) { return scenesOf(chapter).flatMap(s => s.hotspots); }
