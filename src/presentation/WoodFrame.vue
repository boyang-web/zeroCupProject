<script setup lang="ts">
import { computed } from 'vue';
import { assets } from '../content/assets';
import AssetImage from '../shared/AssetImage.vue';
const props = withDefaults(defineProps<{ kind?: string }>(), { kind: 'ui-menu' });
// Nine slices preserve the carved corners instead of stretching them with the panel.
const slices = computed(() => {
  const asset = assets[props.kind]; const r = asset?.region; if (!r) return [];
  const x = Math.min(54, r.width / 4), y = Math.min(54, r.height / 4);
  const xs = [0, x, r.width - x, r.width], ys = [0, y, r.height - y, r.height];
  return Array.from({ length: 9 }, (_, i) => ({ ...asset, region: { ...r, x: r.x + xs[i % 3], y: r.y + ys[Math.floor(i / 3)], width: xs[i % 3 + 1] - xs[i % 3], height: ys[Math.floor(i / 3) + 1] - ys[Math.floor(i / 3)] } }));
});
</script>
<template><span class="wood-frame" aria-hidden="true"><AssetImage v-for="(slice, i) in slices" :key="i" :asset="slice" stretch /></span></template>
