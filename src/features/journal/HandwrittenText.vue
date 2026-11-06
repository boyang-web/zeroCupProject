<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{ text: string; animate?: boolean; delay?: number; reducedMotion?: boolean }>(), { animate: false, delay: 0, reducedMotion: false });
const characters = computed(() => Array.from(props.text));
</script>
<template>
  <span class="handwritten" :class="{ 'handwritten--writing': animate && !reducedMotion }"><span class="sr-only">{{ text }}</span><span aria-hidden="true"><span v-for="(char, index) in characters" :key="index" class="ink-character" :style="{ '--ink-delay': `${delay + index * Math.min(.035, 2.8 / Math.max(characters.length, 1))}s` }">{{ char }}</span></span></span>
</template>
