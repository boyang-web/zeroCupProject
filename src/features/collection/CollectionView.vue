<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContentPack, GameState } from '../../core/contracts';
import { matches } from '../../core/conditions';
import UiButton from '../../shared/UiButton.vue';
import AssetImage from '../../shared/AssetImage.vue';
const props = defineProps<{ content: ContentPack; state: GameState; developer?: boolean }>();
defineEmits<{ study: [id: string] }>();
const owned = computed(() => (props.content.collection ?? []).filter(e => props.developer || matches(props.state, e.condition)));
const selected = ref('');
const entry = computed(() => owned.value.find(e => e.id === selected.value) ?? owned.value[0]);
const rotation = ref(0);
</script>
<template><div class="collection-view"><nav class="collection-shelf" aria-label="已记录的物件"><UiButton v-for="item in owned" :key="item.id" :tone="entry?.id === item.id ? 'jade' : 'paper'" @click="selected = item.id; rotation = 0">{{ item.title }}</UiButton></nav><section v-if="entry" class="collection-detail"><figure><AssetImage :asset="content.assets[entry.asset]!" :style="{ transform: `rotate(${rotation}deg)` }" /><label>换个角度看看<input v-model.number="rotation" type="range" min="-15" max="15" /></label></figure><div><p class="eyebrow">曾经碰过的东西</p><h2>{{ entry.title }}</h2><p>{{ entry.description }}</p><blockquote>{{ entry.detail }}</blockquote><UiButton v-if="entry.study" :disabled="!developer && state.rewards.includes(entry.study.onceKey ?? entry.study.id)" @click="$emit('study', entry.id)">{{ !developer && state.rewards.includes(entry.study.onceKey ?? entry.study.id) ? '这个细节已经记住了' : entry.study.label }}</UiButton></div></section><p v-else class="muted">与物件实际互动之后，它们才会出现在这里。</p></div></template>
