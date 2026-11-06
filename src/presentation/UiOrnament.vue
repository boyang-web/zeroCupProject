<script setup lang="ts">
import { assets } from '../content/assets';
import AssetImage from '../shared/AssetImage.vue';
withDefaults(defineProps<{ kind?: 'osmanthus' | 'corner' | 'divider' | 'bookmark' }>(), { kind: 'osmanthus' });
</script>
<template><span class="ui-ornament" :class="'ui-ornament--' + kind" aria-hidden="true"><AssetImage :asset="assets['ui-' + kind]!" /></span></template>
