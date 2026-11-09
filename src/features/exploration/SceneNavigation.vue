<script setup lang="ts">
import type{SceneRoute}from'../../presentation/scene-routes.ts';
import UiButton from'../../shared/UiButton.vue';import Icon from'../../shared/Icon.vue';
defineProps<{routes:SceneRoute[];blocked?:boolean}>();const emit=defineEmits<{go:[route:SceneRoute]}>();
</script>
<template><nav class="scene-navigation" aria-label="场景通路"><div v-for="side in (['left','right'] as const)" :key="side" class="scene-navigation__side" :class="'scene-navigation__side--'+side"><UiButton v-for="route in routes.filter(r=>r.side===side)" :key="route.id" tone="wood" :disabled="blocked||route.disabled" :title="route.disabled?route.hint:undefined" :data-route-id="route.id" :data-tutorial-control="route.control" @click="emit('go',route)"><Icon v-if="side==='left'" name="arrow" class="route-back"/><span>{{route.label}}</span><Icon v-if="side==='right'" name="arrow"/></UiButton></div></nav></template>
