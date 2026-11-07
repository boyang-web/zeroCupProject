<script setup lang="ts">
import { ref, watch, useId } from 'vue';
import type { Asset } from '../core/contracts.ts';
const props = defineProps<{ asset: Asset; alt?: string; stretch?: boolean; anchor?: 'bottom' }>();
const failed = ref(false); watch(() => props.asset, () => { failed.value = false; });
const filterId = useId().replace(/:/g, '') + '-alpha';
const clipId = filterId + '-region';
</script>
<template>
  <span v-if="failed" class="asset-missing">{{ alt || asset.label }}</span>
  <svg v-else-if="asset.region" class="asset-image" :preserveAspectRatio="stretch ? 'none' : anchor === 'bottom' ? 'xMidYMax meet' : 'xMidYMid meet'" :viewBox="`${asset.region.x} ${asset.region.y} ${asset.region.width} ${asset.region.height}`" :aria-label="alt" :aria-hidden="!alt" role="img">
    <defs>
      <clipPath :id="clipId" clipPathUnits="userSpaceOnUse"><rect :x="asset.region.x" :y="asset.region.y" :width="asset.region.width" :height="asset.region.height" /></clipPath>
      <filter v-if="asset.alphaCutoff" :id="filterId" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" :slope="1 / (1 - asset.alphaCutoff)" :intercept="-asset.alphaCutoff / (1 - asset.alphaCutoff)" /></feComponentTransfer></filter>
    </defs>
    <g :clip-path="`url(#${clipId})`"><image :href="asset.url" :width="asset.region.canvasWidth" :height="asset.region.canvasHeight" :filter="asset.alphaCutoff ? `url(#${filterId})` : undefined" preserveAspectRatio="none" @error="failed = true" /><text v-for="(line,i) in asset.inscription?.lines ?? []" :key="i" :x="asset.region.x + asset.region.width / 2" :y="asset.region.y + asset.region.height * (.32 + i * .22)" :font-size="Math.min(asset.region.width / 10, asset.region.height / 7)" :fill="asset.inscription?.color ?? '#efe5cb'" text-anchor="middle" style="font-family:var(--font-story)">{{ line }}</text></g>
  </svg>
  <img v-else class="asset-image" :src="asset.url" :alt="alt ?? ''" :style="anchor === 'bottom' ? { objectPosition: '50% 100%' } : undefined" draggable="false" @error="failed = true" />
</template>
