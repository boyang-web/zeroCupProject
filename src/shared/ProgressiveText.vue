<script setup lang="ts">
import { computed } from 'vue';
import { useReadingSequence } from '../presentation/useReadingSequence';
const props = withDefaults(defineProps<{ text: string; revealed?: number; reducedMotion?: boolean; active?: boolean;reserveSpace?:boolean }>(), { active: true,reserveSpace:true });
const { visibleCounts, finishText } = useReadingSequence({ texts: () => props.active && props.revealed === undefined ? [props.text] : [], reduced: () => props.reducedMotion });
const characters = computed(() => Array.from(props.text));
const count = computed(() => props.active ? props.revealed ?? visibleCounts.value[0] ?? 0 : 0);
</script>
<template>
  <span class="progressive-text" :data-reading-complete="count >= characters.length" @click="finishText">
    <span class="sr-only">{{ text }}</span><span aria-hidden="true"><span class="reading-ink">{{ characters.slice(0, count).join('') }}</span><span v-if="reserveSpace" class="reading-unseen">{{ characters.slice(count).join('') }}</span></span>
  </span>
</template>
