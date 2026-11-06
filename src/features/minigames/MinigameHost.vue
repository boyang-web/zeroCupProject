<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, ref } from 'vue';
import type { Component } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import { getMinigame } from './registry.ts';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const component = shallowRef<Component>();
const error = ref(''); let cancelled = false; let settled = false;
function finish(result: MinigameResult) { if (settled || cancelled) return; settled = true; emit('finish', result); }
onMounted(async () => {
  try {
    const loader = getMinigame(props.definition.module);
    if (!loader) throw new Error('这个物件的操作暂未准备好，可以先返回探索。');
    const loaded = await loader(); if (!cancelled) component.value = loaded.component;
  } catch (e) { if (!cancelled) error.value = e instanceof Error ? e.message : '暂时无法拿起物件。'; }
});
onBeforeUnmount(() => { cancelled = true; });
</script>
<template>
  <p>{{ definition.description }}</p>
  <component :is="component" v-if="component" :definition="definition" :state="state" :reduced-motion="reducedMotion" :assets="assets" @finish="finish" />
  <p v-else role="status">{{ error || '正在准备桌面…' }}</p>
  <button class="quiet" @click="finish({ status: 'cancelled' })">先放下，稍后再来</button>
</template>
