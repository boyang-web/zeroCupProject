<script setup lang="ts">
const props = withDefaults(defineProps<{ text: string; animate?: boolean; delay?: number; reducedMotion?: boolean }>(), { animate: false, delay: 0, reducedMotion: false });
</script>
<template>
  <span class="handwritten" :class="{ 'handwritten--writing': animate && !reducedMotion }" :style="{'--ink-delay':`${Math.min(delay,.45)}s`}">{{text}}</span>
</template>
