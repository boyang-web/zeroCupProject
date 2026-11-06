<script setup lang="ts">
import { ref, watch, useId } from 'vue';
import type { Asset } from '../core/contracts.ts';
const props = defineProps<{ asset: Asset; alt?: string; stretch?: boolean }>();
const failed = ref(false); watch(() => props.asset, () => { failed.value = false; });
const filterId = useId().replace(/:/g, '') + '-alpha';
</script>
<template>
  <span v-if="failed" class="asset-missing">{{ alt || asset.label }}</span>
  <svg v-else-if="asset.region" class="asset-image" :preserveAspectRatio="stretch ? 'none' : 'xMidYMid meet'" :viewBox="`${asset.region.x} ${asset.region.y} ${asset.region.width} ${asset.region.height}`" :aria-label="alt" :aria-hidden="!alt" role="img"><defs v-if="asset.alphaCutoff"><filter :id="filterId" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" :slope="1 / (1 - asset.alphaCutoff)" :intercept="-asset.alphaCutoff / (1 - asset.alphaCutoff)" /></feComponentTransfer></filter></defs><image :href="asset.url" :width="asset.region.canvasWidth" :height="asset.region.canvasHeight" :filter="asset.alphaCutoff ? `url(#${filterId})` : undefined" preserveAspectRatio="none" @error="failed = true" /></svg>
  <img v-else class="asset-image" :src="asset.url" :alt="alt ?? ''" draggable="false" @error="failed = true" />
</template>
