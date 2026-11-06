<script setup lang="ts">
import { computed, ref } from 'vue';
import { assets } from '../content/assets';
import WoodFrame from '../presentation/WoodFrame.vue';
import AssetImage from './AssetImage.vue';
const props = withDefaults(defineProps<{ tone?: 'paper' | 'jade' | 'wood' | 'quiet' | 'icon' }>(), { tone: 'paper' });
const hover = ref(false), focused = ref(false);
const kind = computed(() => props.tone === 'jade' ? 'ui-selected' : props.tone === 'wood' ? 'ui-header' : hover.value || focused.value ? 'ui-hover' : 'ui-button');
</script>
<template>
  <button type="button" class="ui-button" :class="'ui-button--' + tone" @pointerenter="hover = true" @pointerleave="hover = false" @focusin="focused = true" @focusout="focused = false">
    <AssetImage v-if="tone === 'icon'" class="ui-button__round" :asset="assets['ui-close']!" />
    <WoodFrame v-else-if="tone !== 'quiet'" :kind="kind" />
    <span class="ui-button__content"><slot /></span>
  </button>
</template>
