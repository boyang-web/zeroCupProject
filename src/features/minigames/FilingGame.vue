<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import UiButton from '../../shared/UiButton.vue';
import WoodFrame from '../../presentation/WoodFrame.vue';
import { isItineraryComplete, placeBookmark } from './itinerary.ts';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const plan = computed(() => {
  const base = props.definition.itinerary!;
  const detail = props.state.flags.includes('night-legacy') ? '这只信封是空的。上回没有记下私话，别往里面添，先收回原处。' : props.state.flags.includes('night-pickup') ? '小梁另外叮嘱，今晚替同事顶班的事别写，省得同事下回见他又问。取餐办法另记，这张收回信封。' : '许叔说女儿也等他一句到家，随后叫你别把这句往店里的菜谱上写。这张另折着，店记只留关门时间。';
  return { ...base, slips: base.slips.map(s => s.id === 'confidence' ? { ...s, detail } : s) };
});
const selected = ref(''), placed = ref<Record<string, string>>({}), feedback = ref(''), assisted = ref(false);
function place(slot: string) {
  if (!selected.value) { feedback.value = '先选一张札，再选放在哪里。'; return; }
  placed.value = placeBookmark(plan.value, placed.value, selected.value, slot); selected.value = ''; feedback.value = '放好了。仍可重新选札、换个位置。';
}
function check() {
  const wrong = plan.value.slips.find(s => placed.value[s.slot] !== s.id);
  if (wrong) { feedback.value = wrong.id === 'confidence' ? props.state.flags.includes('night-legacy') ? '奶奶摸摸信封：“这只还是空的，先收回去。”' : '奶奶轻点札背：“这句说了别往菜谱上写，收回信封吧。”' : wrong.id === 'sunday' ? '奶奶问：“几点呀？我还没跟你约呢。”' : '奶奶把“半份”描大一点：“今天问过的，下回照这行说。”'; return; }
  if (isItineraryComplete(plan.value, placed.value)) emit('finish', { status: 'completed', score: 100, assisted: assisted.value });
}
function help() { assisted.value = true; feedback.value = props.state.flags.includes('night-legacy') ? '奶奶逐张读：“吃法今天问过，写书里。电话还带问号，先夹着。这只空信封收回去，别添。”' : '奶奶逐张读：“吃法今天问过，写书里。电话还带问号，先夹着。这张叫你别往外写，就收回信封。”'; }
</script>
<template>
  <div class="itinerary-game">
    <div class="slip-tray"><button v-for="slip in plan.slips" :key="slip.id" class="route-slip" :class="{ selected: selected === slip.id, filed: Object.values(placed).includes(slip.id) }" :aria-pressed="selected === slip.id" @click="selected = slip.id"><WoodFrame kind="ui-paper" /><strong>{{ slip.title }}</strong><small>{{ slip.detail }}</small><span class="slip-action">{{ selected === slip.id ? '已选中 · 请选择去处' : '选这张札 · 可重新放置' }}</span></button></div>
    <div class="route-slots"><button v-for="slot in plan.slots" :key="slot.id" class="route-slot" :class="{ filled: placed[slot.id], accepting: selected }" @click="place(slot.id)"><small>{{ slot.time }}</small><strong>{{ slot.label }}</strong><span>{{ plan.slips.find(s => s.id === placed[slot.id])?.title ?? '尚未放入' }}</span></button></div>
    <p class="activity-feedback" role="status">{{ feedback || '书页、纸夹、信封，各有一个去处。' }}</p>
    <div class="button-row"><UiButton tone="jade" @click="check">请奶奶核对，收好短札</UiButton><UiButton tone="quiet" @click="help">请奶奶一起读札</UiButton></div>
  </div>
</template>
