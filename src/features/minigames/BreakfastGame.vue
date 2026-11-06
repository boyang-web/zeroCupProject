<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import { addBun, ordersReady, steamReady, type Serving } from './breakfast.ts';
import AssetImage from '../../shared/AssetImage.vue';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const plan = computed(() => props.definition.breakfast!);
const selected = ref(''); const servings = ref<Record<string, Serving>>({});
const step = ref<'pack' | 'steam'>('pack'); const feedback = ref('');
const heat = ref(0); const running = ref(false); const steamed = ref(false); const assisted = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
const steamText = computed(() => heat.value < 35 ? '盖沿只有一点细气。' : heat.value < 60 ? '白气渐渐连成一股。' : heat.value <= 85 ? '盖沿冒着稳稳的白气。' : '蒸汽急了，先关火。');
function place(id: string) {
  if (!selected.value) { feedback.value = '先选一种馅。'; return; }
  servings.value = addBun(plan.value, servings.value, id, selected.value); feedback.value = '';
}
function check() {
  if (!ordersReady(plan.value, servings.value)) { feedback.value = '再核对一下：周叔两只菜的，阿宁一只豆沙，陈伯一只肉的。'; return; }
  step.value = 'steam'; feedback.value = '陈伯指了指笼盖：“白气稳了就揭盖，别光等着。”';
}
function stop() { clearInterval(timer); timer = undefined; running.value = false; }
function start() {
  if (running.value || steamed.value) return;
  heat.value = 0; running.value = true; feedback.value = '';
  timer = setInterval(() => { heat.value += 2; if (heat.value >= 100) { stop(); feedback.value = '火急了。关掉歇一会儿，可以重新来。'; } }, 180);
}
function lift() {
  stop();
  if (steamReady(heat.value)) { steamed.value = true; feedback.value = '笼盖一揭，阿宁已经把碗递了过来。'; }
  else feedback.value = heat.value < 60 ? '气还没上来。重新合盖，再看一会儿。' : '这一回火急了些。再试一笼吧，不扣进度。';
}
function help() {
  stop(); assisted.value = true; step.value = 'steam'; heat.value = 75; steamed.value = true;
  servings.value = Object.fromEntries(plan.value.orders.map(o => [o.id, { filling: o.filling, count: o.count }]));
  feedback.value = '陈伯扶住笼盖：“看，跟这个气差不多就行。”';
}
function finish() { if (steamed.value) emit('finish', { status: 'completed', score: assisted.value ? 80 : 100 - Math.abs(heat.value - 75), assisted: assisted.value }); }
function pauseHidden() { if (document.hidden && running.value) { stop(); feedback.value = '先歇了火，回来再开。'; } }
document.addEventListener('visibilitychange', pauseHidden);
onBeforeUnmount(() => { stop(); document.removeEventListener('visibilitychange', pauseHidden); });
</script>
<template>
  <div class="breakfast-game">
    <template v-if="step === 'pack'"><div class="filling-tray"><button v-for="filling in plan.fillings" :key="filling" :aria-pressed="selected === filling" :class="{ selected: selected === filling }" @click="selected = filling"><AssetImage :asset="assets['prop-buns']!" /><strong>{{ filling }}</strong></button></div>
      <div class="breakfast-orders"><article v-for="order in plan.orders" :key="order.id"><h3>{{ order.person }}</h3><p>{{ order.hint }}</p><button class="order-bowl" :aria-label="`给${order.person}放一个${selected || '包子'}`" @click="place(order.id)"><AssetImage v-if="servings[order.id]" :asset="assets['prop-buns']!" /><span>{{ servings[order.id] ? `${servings[order.id].filling} × ${servings[order.id].count}` : '把包子放在这里' }}</span></button><button v-if="servings[order.id]" class="quiet" @click="delete servings[order.id]">重新装</button></article></div>
      <button class="primary" @click="check">配齐了，合上笼盖</button>
    </template>
    <template v-else><div class="steamer-stage" :class="{ heating: running, ready: heat >= 60 && heat <= 85 }"><AssetImage :asset="assets[steamed ? 'prop-open-steamer' : 'prop-steamer']!" /><div v-if="running" class="steam-clouds" aria-hidden="true"><i></i><i></i><i></i></div></div><p class="steam-caption" role="status">{{ steamed ? '出笼了。' : steamText }}</p><progress :value="heat" max="100" aria-label="蒸汽" class="steam-gauge"></progress><div class="button-row"><button v-if="!steamed && !running" class="primary" @click="start">合盖，上火</button><button v-if="running" class="primary" @click="lift">揭盖看一眼</button><button v-if="steamed" class="primary" @click="finish">出笼，端去后院</button></div></template>
    <p class="activity-feedback" role="status">{{ feedback }}</p><button class="quiet" @click="help">让陈伯带着做一遍</button>
  </div>
</template>
