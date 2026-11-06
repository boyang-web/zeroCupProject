<script setup lang="ts">
import type { GuideStep } from '../../core/contracts';
import WoodFrame from '../../presentation/WoodFrame.vue';
import Icon from '../../shared/Icon.vue';
defineProps<{ guide: GuideStep }>();
</script>
<template><aside class="guide-hint" :key="guide.id" aria-live="polite"><WoodFrame kind="ui-toast" /><Icon name="look" /><div><strong>{{ guide.title }}</strong><p>{{ guide.text }}</p></div></aside></template>
