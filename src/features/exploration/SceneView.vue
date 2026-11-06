<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Chapter, ContentPack, GameState, Hotspot } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { sceneOf } from '../../core/scenes.ts';
import { computed } from 'vue';
import UiButton from '../../shared/UiButton.vue';
const props = defineProps<{ chapter: Chapter; content: ContentPack; state: GameState; hints: boolean; guideTarget?: string; reducedMotion?: boolean; developer?: boolean }>();
const emit = defineEmits<{ interact: [hotspot: Hotspot]; move: [id: string]; option: [hotspot: Hotspot, actionId: string] }>();
const scene = computed(() => sceneOf(props.state, props.content));
const failed = ref(false);
const canvas = ref<HTMLElement>();
const dragging = ref<{ id: string; x: number; y: number; moved: boolean }>();
let origin = { x: 0, y: 0, px: 0, py: 0 }, suppressClick = false;
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
function select(h: Hotspot) { if (suppressClick) { suppressClick = false; return; } emit('interact', h); }
watch(() => scene.value.id, () => { failed.value = false; dragging.value = undefined; });
</script>
<template>
  <div class="scene-window" aria-label="场景探索区">
  <div ref="canvas" class="scene" :class="[`tint-${scene.tint ?? chapter.tint}`, { 'show-hints': hints }]">
    <img v-if="!failed" class="scene-image" :src="content.assets[scene.asset]?.url" :style="{ objectPosition: scene.position ?? chapter.position }" :alt="scene.title" fetchpriority="high" @error="failed = true" />
    <div v-else class="scene-fallback">{{ chapter.title }}<small>场景图片暂未载入，仍可继续探索</small></div>
    <div class="scene-shade" aria-hidden="true"></div>
    <img v-if="scene.foreground && !failed" class="scene-foreground" :src="content.assets[scene.asset]?.url" alt="" :style="{ clipPath: scene.foreground.clipPath, zIndex: scene.foreground.z }" aria-hidden="true" />
    <div class="scene-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div v-if="chapter.character && !failed" class="scene-character" :style="{ left: chapter.character.x + '%', top: chapter.character.y + '%', width: chapter.character.width + '%', height: chapter.character.height + '%' }" aria-hidden="true"><img :src="content.assets[chapter.character.asset]?.url" alt="" /></div>
    <div class="scene-caption"><span><Icon name="sun" /> {{ scene.time ?? chapter.time }}</span><h2>{{ chapter.title }}<span class="chapter-seal">第{{ ['一','二','三','四','五'][chapter.number - 1] }}章</span></h2><p>{{ chapter.subtitle }}</p></div>
    <template v-for="h in scene.hotspots" :key="h.id">
      <button v-if="developer || matches(state, h.condition)" class="hotspot" :class="{ 'world-object': h.sprite, discovered: h.completed && matches(state, h.completed), 'guide-object': guideTarget === h.id, 'object-dragging': dragging?.id === h.id }" :style="{ left: position(h).x + '%', top: position(h).y + '%', width: h.sprite ? h.sprite.width + '%' : undefined, height: h.sprite ? h.sprite.height + '%' : undefined, zIndex: dragging?.id === h.id ? 30 : h.sprite?.z }" :aria-label="h.label" @click="select(h)" @pointerdown="beginDrag($event, h)" @pointermove="moveDrag" @pointerup="endDrag(h)" @pointercancel="dragging = undefined">
        <AssetImage v-if="h.sprite" :asset="content.assets[pose(h)?.asset ?? h.sprite.asset]!" />
        <span v-else class="hotspot-symbol"><Icon :name="h.completed && matches(state, h.completed) ? 'check' : h.icon" /></span><span class="hotspot-label">{{ h.label }}</span>
      </button>
    </template>
    <div v-if="dragging && scene.hotspots.find(h => h.id === dragging?.id)?.drag" class="object-drop-target" :style="{ left: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.x + '%', top: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.y + '%', width: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.width + '%', height: scene.hotspots.find(h => h.id === dragging?.id)!.drag!.target.height + '%' }">{{ scene.hotspots.find(h => h.id === dragging?.id)!.drag!.hint }}</div>
    <span class="scene-footnote"><span></span> 移到物件上看看</span>
  </div>
  </div>
  <nav v-if="scene.links.length" class="scene-paths" aria-label="场景通路"><span>{{ scene.title }}</span><UiButton v-for="link in scene.links" :key="link.sceneId" tone="wood" :disabled="!developer && !matches(state, link.condition)" :title="!developer && !matches(state, link.condition) ? link.unavailable : undefined" @click="emit('move', link.sceneId)">{{ link.label }}<Icon name="arrow" /></UiButton></nav>
  <nav class="mobile-objects" aria-label="身边的物件"><span>轻扫画面，或从这里选</span><button v-for="h in scene.hotspots.filter(h => developer || matches(state, h.condition))" :key="h.id" @click="emit('interact', h)">{{ h.label }}</button></nav>
</template>
