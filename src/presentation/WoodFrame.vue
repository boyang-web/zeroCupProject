<script setup lang="ts">
import { computed } from 'vue';
import { assets } from '../content/assets';
import AssetImage from '../shared/AssetImage.vue';
import { frameSizes, frameSlices } from './frame-layout';
const props = withDefaults(defineProps<{ kind?: string }>(), { kind: 'ui-menu' });
const dimensions = computed(() => frameSizes[props.kind] ?? frameSizes['ui-paper']!);
const slices = computed(() => frameSlices(assets[props.kind], dimensions.value.source));
</script>
<template><span class="wood-frame" :class="'wood-frame--' + kind" :style="{ '--frame-corner': dimensions.display + 'px' }" aria-hidden="true"><AssetImage v-for="(slice, i) in slices" :key="i" :asset="slice" stretch /></span></template>
