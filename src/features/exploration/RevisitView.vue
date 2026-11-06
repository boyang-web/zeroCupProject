<script setup lang="ts">
import { computed } from 'vue';
import type { ContentPack, GameState } from '../../core/contracts';
import UiButton from '../../shared/UiButton.vue';
import Icon from '../../shared/Icon.vue';
const props = defineProps<{ content: ContentPack; state: GameState; developer?: boolean }>();
defineEmits<{ revisit: [id: string]; resume: [] }>();
const places = computed(() => props.content.chapters.filter(c => c.next && (props.developer || props.state.visited.includes(c.id))));
</script>
<template><p class="muted">去过的地方可以再回去。先前说过的话、动过的物件都还记着。</p><div class="revisit-places"><article v-for="place in places" :key="place.id"><small>{{ place.id === state.journey.chapterId ? '当前行程' : '去过的地方' }}</small><h3>{{ place.title }}</h3><p>{{ place.revisitDescription ?? place.subtitle }}</p><UiButton :disabled="!developer && place.id === state.chapterId" @click="$emit('revisit', place.id)">{{ place.id === state.chapterId ? '正在这里' : '回去看看' }}<Icon name="arrow" /></UiButton></article></div><UiButton v-if="state.chapterId !== state.journey.chapterId" tone="jade" @click="$emit('resume')">回到原来的行程<Icon name="arrow" /></UiButton></template>
