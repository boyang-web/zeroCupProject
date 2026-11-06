<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Chapter, ContentPack, GameState, Hotspot } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { sceneOf } from '../../core/scenes.ts';
import { computed } from 'vue';
const props = defineProps<{ chapter: Chapter; content: ContentPack; state: GameState; hints: boolean }>();
const emit = defineEmits<{ interact: [hotspot: Hotspot]; move: [id: string] }>();
const scene = computed(() => sceneOf(props.state, props.content));
const failed = ref(false);
function pose(h: Hotspot) { return h.variants?.find(v => matches(props.state, v.condition)); }
watch(() => scene.value.id, () => { failed.value = false; });
</script>
<template>
  <div class="scene-window" aria-label="场景探索区">
  <div class="scene" :class="[`tint-${chapter.tint}`, { 'show-hints': hints }]">
    <img v-if="!failed" class="scene-image" :src="content.assets[scene.asset]?.url" :style="{ objectPosition: scene.position ?? chapter.position }" :alt="scene.title" fetchpriority="high" @error="failed = true" />
    <div v-else class="scene-fallback">{{ chapter.title }}<small>场景图片暂未载入，仍可继续探索</small></div>
    <div class="scene-shade" aria-hidden="true"></div>
    <div class="scene-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div v-if="chapter.character && !failed" class="scene-character" :style="{ left: chapter.character.x + '%', top: chapter.character.y + '%', width: chapter.character.width + '%', height: chapter.character.height + '%' }" aria-hidden="true"><img :src="content.assets[chapter.character.asset]?.url" alt="" /></div>
    <div class="scene-caption"><span><Icon name="sun" /> {{ chapter.time }}</span><h2>{{ chapter.title }}<span class="chapter-seal">第{{ ['一','二','三','四','五'][chapter.number - 1] }}章</span></h2><p>{{ chapter.subtitle }}</p></div>
    <template v-for="h in scene.hotspots" :key="h.id">
      <button v-if="matches(state, h.condition)" class="hotspot" :class="{ 'world-object': h.sprite, discovered: h.completed && matches(state, h.completed) }" :style="{ left: (pose(h)?.x ?? h.x) + '%', top: (pose(h)?.y ?? h.y) + '%', width: h.sprite ? h.sprite.width + '%' : undefined, height: h.sprite ? h.sprite.height + '%' : undefined, zIndex: h.sprite?.z }" :aria-label="h.label" @click="emit('interact', h)">
        <AssetImage v-if="h.sprite" :asset="content.assets[pose(h)?.asset ?? h.sprite.asset]!" />
        <span v-else class="hotspot-symbol"><Icon :name="h.completed && matches(state, h.completed) ? 'check' : h.icon" /></span><span class="hotspot-label">{{ h.label }}</span>
      </button>
    </template>
    <span class="scene-footnote"><span></span> 移到物件上看看</span>
  </div>
  </div>
  <nav v-if="scene.links.length" class="scene-paths" aria-label="场景通路"><span>{{ scene.title }}</span><button v-for="link in scene.links" :key="link.sceneId" :disabled="!matches(state, link.condition)" :title="!matches(state, link.condition) ? link.unavailable : undefined" @click="emit('move', link.sceneId)">{{ link.label }}<Icon name="arrow" /></button></nav>
  <nav class="mobile-objects" aria-label="身边的物件"><span>轻扫画面，或从这里选</span><button v-for="h in scene.hotspots.filter(h => matches(state, h.condition))" :key="h.id" @click="emit('interact', h)">{{ h.label }}</button></nav>
</template>
