<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { gsap } from 'gsap';
import type { Chapter, ContentPack, GameState, Hotspot, SceneCameraView } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { sceneOf } from '../../core/scenes.ts';
import UiButton from '../../shared/UiButton.vue';
import { cameraScrollLeft, frameCamera } from '../../presentation/scene-camera.ts';
import WoodFrame from '../../presentation/WoodFrame.vue';
const props = defineProps<{ chapter: Chapter; content: ContentPack; state: GameState; hints: boolean; guideTarget?: string; reducedMotion?: boolean; developer?: boolean; blocked?: boolean }>();
const emit = defineEmits<{ interact: [hotspot: Hotspot]; move: [id: string]; option: [hotspot: Hotspot, actionId: string]; framing: [close: boolean] }>();
const scene = computed(() => sceneOf(props.state, props.content));
const failed = ref(false);
const viewport = ref<HTMLElement>();
const canvas = ref<HTMLElement>();
const camera = reactive(frameCamera());
const activeView = ref<SceneCameraView>();
const moving = ref(false);
let cameraTween: gsap.core.Timeline | undefined;
let settleCamera: ((completed: boolean) => void) | undefined;
let overviewScrollLeft = 0;
const dragging = ref<{ id: string; x: number; y: number; moved: boolean }>();
let origin = { x: 0, y: 0, px: 0, py: 0 }, suppressClick = false;
function stopCamera() {
  cameraTween?.kill(); cameraTween = undefined;
  settleCamera?.(false); settleCamera = undefined; moving.value = false;
}
function frame(view?: SceneCameraView, scrollLeft?: number): Promise<boolean> {
  stopCamera(); activeView.value = view;
  const target = frameCamera(view);
  if (props.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (viewport.value && scrollLeft !== undefined) viewport.value.scrollLeft = scrollLeft;
    Object.assign(camera, target); return Promise.resolve(true);
  }
  moving.value = true;
  return new Promise(resolve => {
    settleCamera = resolve;
    cameraTween = gsap.timeline({ onComplete: () => {
      moving.value = false; cameraTween = undefined; settleCamera = undefined; resolve(true);
    } });
    cameraTween.to(camera, { ...target, duration: .7, ease: 'power2.inOut' }, 0);
    if (viewport.value && scrollLeft !== undefined) cameraTween.to(viewport.value, { scrollLeft, duration: .7, ease: 'power2.inOut' }, 0);
  });
}
function returnToOverview() { void frame(undefined, overviewScrollLeft); }
function cameraKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || props.blocked || event.defaultPrevented || !activeView.value && !moving.value) return;
  event.preventDefault(); returnToOverview();
}
onMounted(() => document.addEventListener('keydown', cameraKey));
onBeforeUnmount(() => { stopCamera(); emit('framing', false); document.removeEventListener('keydown', cameraKey); });
watch(activeView, view => emit('framing', !!view));
watch(() => props.reducedMotion, reduced => { if (reduced) cameraTween?.progress(1); });
watch(() => props.blocked, (blocked, wasBlocked) => {
  if (!blocked && wasBlocked && activeView.value) { returnToOverview(); return; }
  if (!blocked || !moving.value) return;
  stopCamera(); Object.assign(camera, frameCamera()); activeView.value = undefined;
  if (viewport.value) viewport.value.scrollLeft = overviewScrollLeft;
});
function pose(h: Hotspot) { return h.variants?.find(v => matches(props.state, v.condition)); }
function position(h: Hotspot) { return dragging.value?.id === h.id ? dragging.value : { x: pose(h)?.x ?? h.x, y: pose(h)?.y ?? h.y }; }
function beginDrag(event: PointerEvent, h: Hotspot) {
  if (!h.drag || !props.developer && h.completed && matches(props.state, h.completed)) return;
  const p = position(h); origin = { x: p.x, y: p.y, px: event.clientX, py: event.clientY };
  dragging.value = { id: h.id, x: p.x, y: p.y, moved: false };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}
function moveDrag(event: PointerEvent) {
  if (!dragging.value || !canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  dragging.value = { ...dragging.value, x: origin.x+(event.clientX-origin.px)/rect.width*100, y: origin.y+(event.clientY-origin.py)/rect.height*100, moved: dragging.value.moved || Math.hypot(event.clientX-origin.px, event.clientY-origin.py)>6 };
}
function endDrag(h: Hotspot) {
  const held = dragging.value; dragging.value = undefined;
  if (!held?.moved || !h.drag) return;
  suppressClick = true;
  const t = h.drag.target;
  if (held.x >= t.x && held.x <= t.x+t.width && held.y >= t.y && held.y <= t.y+t.height) emit('option', h, h.drag.actionId);
}
async function select(h: Hotspot) {
  if (suppressClick) { suppressClick = false; return; }
  const view = scene.value.camera?.views.find(v => v.id === (pose(h)?.cameraView ?? h.cameraView));
  if (view && !failed.value && view.id !== activeView.value?.id) {
    if (!activeView.value) overviewScrollLeft = viewport.value?.scrollLeft ?? 0;
    const scrollLeft = viewport.value && canvas.value ? cameraScrollLeft(view, canvas.value.offsetWidth, viewport.value.clientWidth) : undefined;
    if (!await frame(view, scrollLeft)) return;
  }
  emit('interact', h);
}
watch(() => scene.value.id, () => {
  stopCamera(); Object.assign(camera, frameCamera()); activeView.value = undefined;
  overviewScrollLeft = 0; if (viewport.value) viewport.value.scrollLeft = 0;
  failed.value = false; dragging.value = undefined; suppressClick = false;
});
</script>
<template>
  <div ref="viewport" class="scene-window" aria-label="场景探索区" :aria-busy="moving">
  <div class="scene" :class="[`tint-${scene.tint ?? chapter.tint}`, { 'show-hints': hints, 'camera-moving': moving, 'staged-scene': !!scene.camera }]">
  <div ref="canvas" class="scene-world" :style="{ transform: `translate(${camera.x}%, ${camera.y}%) scale(${camera.zoom})` }">
    <img v-if="!failed" class="scene-image" :src="content.assets[scene.asset]?.url" :style="{ objectPosition: scene.position ?? chapter.position }" :alt="scene.title" fetchpriority="high" @error="failed = true" />
    <div v-else class="scene-fallback">{{ chapter.title }}<small>场景图片暂未载入，仍可继续探索</small></div>
    <div class="scene-shade" aria-hidden="true"></div>
    <div v-if="scene.foreground && !failed" class="scene-foreground" :style="{ clipPath: scene.foreground.clipPath, zIndex: scene.foreground.z }" aria-hidden="true"><img class="scene-foreground__image" :src="content.assets[scene.asset]?.url" :style="{ objectPosition: scene.position ?? chapter.position }" alt="" /><div class="scene-foreground__shade"></div></div>
    <div class="scene-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div v-for="d in (scene.decorations ?? []).filter(d => matches(state, d.condition))" :key="d.id" :data-scenery="d.id" class="world-scenery" :style="{ left: d.x+'%', top: d.y+'%', width: d.width+'%', height: d.height+'%', zIndex: d.z ?? 2 }" aria-hidden="true"><AssetImage :asset="content.assets[d.asset]!" anchor="bottom" /></div>
    <div v-if="chapter.character && !failed" class="scene-character" :style="{ left: chapter.character.x + '%', top: chapter.character.y + '%', width: chapter.character.width + '%', height: chapter.character.height + '%' }" aria-hidden="true"><img :src="content.assets[chapter.character.asset]?.url" alt="" /></div>
    <template v-for="h in scene.hotspots" :key="h.id">
      <button v-if="developer || matches(state, h.condition)" class="hotspot" :disabled="moving" :class="{ 'world-object': h.sprite, 'world-person': h.interaction.kind === 'dialogue', discovered: h.completed && matches(state, h.completed), 'guide-object': guideTarget === h.id, 'object-dragging': dragging?.id === h.id }" :style="{ left: position(h).x + '%', top: position(h).y + '%', width: h.sprite ? (pose(h)?.width ?? h.sprite.width) + '%' : undefined, height: h.sprite ? (pose(h)?.height ?? h.sprite.height) + '%' : undefined, zIndex: dragging?.id === h.id ? 30 : h.sprite?.z }" :aria-label="h.label" :data-guide-object="h.id" @click="select(h)" @pointerdown="beginDrag($event, h)" @pointermove="moveDrag" @pointerup="endDrag(h)" @pointercancel="dragging = undefined">
        <AssetImage v-if="h.sprite" :asset="content.assets[pose(h)?.asset ?? h.sprite.asset]!" :anchor="scene.camera ? 'bottom' : undefined" />
        <span v-else class="hotspot-symbol"><Icon :name="h.completed && matches(state, h.completed) ? 'check' : h.icon" /></span><span class="hotspot-label">{{ h.label }}</span>
      </button>
    </template>
    <div v-if="dragging && scene.hotspots.find(h => h.id === dragging?.id)?.drag" class="object-drop-target" :style="{ left: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.x + '%', top: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.y + '%', width: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.width + '%', height: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.height + '%' }">{{ scene.hotspots.find(h => h.id === dragging?.id)!.drag!.hint }}</div>
    <span class="scene-footnote"><span></span> 移到物件上看看</span>
  </div>
    <div v-if="!activeView && !scene.camera" class="scene-caption"><span class="scene-time"><Icon name="sun" /> {{ scene.time ?? chapter.time }}</span><h2>{{ chapter.title }}<span class="chapter-seal">第{{ ['一','二','三','四','五'][chapter.number - 1] }}章</span></h2><p>{{ chapter.subtitle }}</p></div>
  </div>
  </div>
  <div v-if="scene.camera && !activeView" class="scene-caption scene-caption--room"><WoodFrame kind="ui-toast" /><span class="scene-time"><Icon name="sun" />{{ scene.time ?? chapter.time }}</span><h2>{{ scene.title }}<span class="chapter-seal">第{{ ['一','二','三','四','五'][chapter.number - 1] }}章</span></h2></div>
  <nav v-if="scene.links.length" class="scene-paths" aria-label="场景通路"><span>{{ scene.title }}</span><UiButton v-for="link in scene.links" :key="link.sceneId" tone="wood" :disabled="!developer && !matches(state, link.condition)" :title="!developer && !matches(state, link.condition) ? link.unavailable : undefined" @click="emit('move', link.sceneId)">{{ link.label }}<Icon name="arrow" /></UiButton></nav>
  <nav class="mobile-objects" aria-label="身边的物件"><span>轻扫画面，或从这里选</span><button v-for="h in scene.hotspots.filter(h => developer || matches(state, h.condition))" :key="h.id" :data-guide-shortcut="h.id" :disabled="moving" @click="select(h)">{{ h.label }}</button></nav>
</template>
