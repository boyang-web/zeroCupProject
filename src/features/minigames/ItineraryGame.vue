<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import Icon from '../../shared/Icon.vue';
import UiButton from '../../shared/UiButton.vue';
import WoodFrame from '../../presentation/WoodFrame.vue';
import { isItineraryComplete, placeBookmark } from './itinerary.ts';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const plan = computed(() => props.definition.itinerary);
const selected = ref(''); const placed = ref<Record<string, string>>({});
const feedback = ref(''); const assisted = ref(false);
const correct = computed(() => !!plan.value && isItineraryComplete(plan.value, placed.value));
function place(slot: string) {
  if (!selected.value) { feedback.value = '先选一张书签，再选要夹进的时段。'; return; }
  placed.value = placeBookmark(plan.value!, placed.value, selected.value, slot); selected.value = ''; feedback.value = '书签夹好了。也可以重新点选调整。';
}
function help() {
  assisted.value = true; placed.value = Object.fromEntries(plan.value!.slips.map(s => [s.slot, s.id]));
  feedback.value = '沿着祖母写的时间，三张书签各归其位。';
}
function finish() {
  if (!correct.value) { feedback.value = '再看看每张书签上的时间：第一笼、午间、夜班以后。'; return; }
  emit('finish', { status: 'completed', score: assisted.value ? 80 : 100, assisted: assisted.value });
}
</script>
<template>
  <div v-if="plan" class="itinerary-game">
    <div class="slip-tray"><button v-for="(slip, i) in plan.slips" :key="slip.id" class="route-slip" :class="{ selected: selected === slip.id, filed: Object.values(placed).includes(slip.id) }" :aria-pressed="selected === slip.id" @click="selected = slip.id; feedback = ''"><WoodFrame kind="ui-paper" /><span class="slip-number">{{ String(i + 1).padStart(2, '0') }}</span><strong>{{ slip.title }}</strong><small>{{ slip.detail }}</small><span class="slip-action">{{ selected === slip.id ? '已选中 · 点一个时段' : Object.values(placed).includes(slip.id) ? '已夹入 · 可重新放置' : '点选这张书签' }}</span></button></div>
    <div class="itinerary-line" aria-hidden="true"><span></span><Icon name="leaf" /><span></span></div>
    <div class="route-slots"><button v-for="slot in plan.slots" :key="slot.id" class="route-slot" :class="{ filled: placed[slot.id], accepting: selected }" :aria-label="`放入${slot.label}：${placed[slot.id] ? plan.slips.find(s => s.id === placed[slot.id])?.title : '空位'}`" @click="place(slot.id)"><small>{{ slot.label }} / {{ slot.time }}</small><strong>{{ plan.slips.find(s => s.id === placed[slot.id])?.title ?? '把书签夹在这里' }}</strong><span>{{ placed[slot.id] ? '重新选书签可替换' : '＋' }}</span></button></div>
    <p class="activity-feedback" role="status">{{ feedback || '书签上写着今天能见到他们的时间。' }}</p>
    <div class="button-row"><UiButton tone="jade" @click="finish"><Icon name="book" />收好书页，准备出门</UiButton><UiButton tone="quiet" @click="help">按奶奶的标注整理</UiButton></div>
  </div>
  <p v-else>书签还没准备好，可以先回到小院。</p>
</template>
