<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { ContentPack, GameState } from '../../core/contracts';
import { matches } from '../../core/conditions';
import UiButton from '../../shared/UiButton.vue';
import AssetImage from '../../shared/AssetImage.vue';
import ObjectViewer from './ObjectViewer.vue';
import { objectModels } from '../../content/object-models';
const props = defineProps<{ content: ContentPack; state: GameState; developer?: boolean; reducedMotion?: boolean }>();
defineEmits<{ study: [id: string] }>();
const owned = computed(() => (props.content.collection ?? []).filter(e => props.developer || matches(props.state, e.condition)));
const selected = ref('');
const entry = computed(() => owned.value.find(e => e.id === selected.value) ?? owned.value[0]);
const source = ref<HTMLElement>();
const viewer=ref<InstanceType<typeof ObjectViewer>>();
defineExpose({closeObject:()=>{if(!source.value)return false;void viewer.value?.close();return true;}});
const reading = ref<HTMLElement>();
watch(entry, async () => { await nextTick(); reading.value?.scrollTo({top:0}); });
</script>
<template><div class="collection-view object-browser">
  <nav class="collection-shelf" aria-label="已记录的物件" :inert="!!source"><UiButton v-for="item in owned" :key="item.id" :tone="entry?.id === item.id ? 'jade' : 'paper'" @click="selected = item.id">{{ item.title }}</UiButton></nav>
  <section v-if="entry" class="collection-detail" :inert="!!source"><figure><button class="object-preview" :aria-label="'拿起'+entry.title+'，进入3D查看'" @click="source=$event.currentTarget as HTMLElement"><AssetImage :asset="content.assets[entry.asset]!" /><span>点按物件 · 拿起细看</span></button></figure><div class="collection-copy"><h2>{{ entry.title }}</h2><div ref="reading" class="collection-reading text-scroll" tabindex="0"><p>{{ entry.description }}</p><blockquote>{{ entry.detail }}</blockquote></div><UiButton v-if="entry.study && (developer || !state.rewards.includes(entry.study.onceKey ?? entry.study.id))" @click="$emit('study', entry.id)">{{ entry.study.label }}</UiButton></div></section>
  <p v-else class="muted">与物件实际互动之后，它们才会出现在这里。</p>
  <ObjectViewer ref="viewer" v-if="source&&entry&&objectModels[entry.id]" :title="entry.title" :description="entry.detail" :kind="objectModels[entry.id]!" :art="content.assets[entry.asset]" :source="source" :reduced-motion="reducedMotion" @close="source=undefined" />
</div></template>
