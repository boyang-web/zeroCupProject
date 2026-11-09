<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
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
let completion:ReturnType<typeof setTimeout>|undefined;
const completing=ref(false);
watch(correct,value=>{clearTimeout(completion);if(value){completing.value=true;completion=setTimeout(finish,160);}});
onBeforeUnmount(()=>clearTimeout(completion));
function place(slot: string) {
  if(completing.value)return;
  if (!selected.value) { feedback.value = '先选一张书签，再选要夹进的时段。'; return; }
  placed.value = placeBookmark(plan.value!, placed.value, selected.value, slot); selected.value = ''; feedback.value = '';
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
    <p v-if="feedback" class="activity-feedback" role="status">{{feedback}}</p>
    <UiButton v-if="!completing" tone="quiet" @click="help">按奶奶的标注整理</UiButton>
  </div>
  <p v-else>书签还没准备好，可以先回到小院。</p>
</template>
