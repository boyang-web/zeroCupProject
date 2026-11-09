<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import { addBun, ordersReady, packagingReady, steamReady, type Serving } from './breakfast.ts';
import AssetImage from '../../shared/AssetImage.vue';
import UiButton from '../../shared/UiButton.vue';
import WoodFrame from '../../presentation/WoodFrame.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import { useReadingSequence } from '../../presentation/useReadingSequence';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const plan = computed(() => props.definition.breakfast!);
const selected = ref(''), servings = ref<Record<string, Serving>>({});
const step = ref<'fill' | 'steam' | 'serve'>('fill');
const feedback = ref(''), packages = ref<Record<string,string>>({});
const voice = ref<HTMLElement>();
const bunFill = useId().replace(/:/g, '') + '-bun';
const heat = ref(0), running = ref(false), steamed = ref(false), assisted = ref(false);
const total = computed(() => plan.value.orders.reduce((count, order) => count + order.count, 0));
const words = computed(() => feedback.value || plan.value.copy?.intro || props.definition.description);
const { visibleCounts, finishText } = useReadingSequence({ texts: () => [words.value], reduced: () => props.reducedMotion });
watch(step, async () => { await nextTick(); voice.value?.closest('.modal-body')?.scrollTo({ top: 0 }); });
let timer: ReturnType<typeof setInterval> | undefined;
const steamText = computed(() => heat.value < 35 ? '盖沿只有一点细气。' : heat.value < 60 ? '白气渐渐连成一股。' : heat.value <= 85 ? '盖沿冒着稳稳的白气。' : '蒸汽急了，先关火。');
function selectFilling(filling: string) {
  selected.value = filling; feedback.value = plan.value.copy?.fillings[filling] ?? '';
}
function place(id: string) {
  if (!selected.value) { feedback.value = '先认一种馅，再放进要留的那份。'; return; }
  servings.value = addBun(plan.value, servings.value, id, selected.value);
  feedback.value = plan.value.copy?.fillings[selected.value] ?? '';
}
function check() {
  if (!ordersReady(plan.value, servings.value)) {
    const wrong = plan.value.orders.find(order => servings.value[order.id] && servings.value[order.id]!.filling !== order.filling);
    feedback.value = wrong && plan.value.copy?.wrongFillings?.[wrong.id] || plan.value.copy?.checkOrders || '再看看每个人要的馅和数量。';
    void nextTick(() => voice.value?.scrollIntoView({ block: 'nearest' }));
    return;
  }
  step.value = 'steam'; feedback.value = plan.value.copy?.beforeSteam ?? '合上笼盖，留意盖沿的白气。';
}
function stop() { clearInterval(timer); timer = undefined; running.value = false; }
function start() {
  if (running.value || steamed.value) return;
  heat.value = 0; running.value = true; feedback.value = plan.value.copy?.beforeSteam ?? '';
  timer = setInterval(() => {
    heat.value += 2;
    if (heat.value >= 100) { stop(); feedback.value = plan.value.copy?.late ?? '先关火，再试一次。'; }
  }, 180);
}
function lift() {
  stop();
  if (steamReady(heat.value)) {
    steamed.value = true; step.value = 'serve';
    feedback.value = plan.value.copy?.steamed ?? '出笼了，先拿夹子，再分早饭。';
  } else feedback.value = heat.value < 60 ? plan.value.copy?.early ?? '还没上气，重新合盖。' : plan.value.copy?.late ?? '火急了，关掉再来。';
}
function help() {
  stop(); assisted.value = true; step.value = 'serve'; heat.value = 75; steamed.value = true;
  servings.value = Object.fromEntries(plan.value.orders.map(order => [order.id, { filling: order.filling, count: order.count }]));
  feedback.value = plan.value.copy?.helped ?? '店主帮你出笼，分装再自己看一眼。';
}
function choosePackage(orderId: string, choiceId: string) {
  packages.value = { ...packages.value, [orderId]: choiceId }; feedback.value = '';
}
function checkPackages() {
  const wrong = plan.value.packaging?.find(task => packages.value[task.orderId] !== task.expected);
  if (wrong) { feedback.value = packages.value[wrong.orderId] ? wrong.wrong : '先把这两份要怎么放选好。'; void nextTick(() => voice.value?.scrollIntoView({ block: 'nearest' })); return; }
  finish();
}
function finish() {
  if (steamed.value && packagingReady(plan.value, packages.value)) emit('finish', { status: 'completed', score: assisted.value ? 80 : 100 - Math.abs(heat.value - 75), assisted: assisted.value });
}
function pauseHidden() {
  if (document.hidden && running.value) { stop(); feedback.value = '先歇了火，回来再开。'; }
}
onMounted(() => document.addEventListener('visibilitychange', pauseHidden));
onBeforeUnmount(() => { stop(); document.removeEventListener('visibilitychange', pauseHidden); });
</script>
<template>
  <div class="breakfast-game">
    <nav class="breakfast-steps" aria-label="下一笼的步骤"><span :aria-current="step === 'fill' ? 'step' : undefined">一 · 认馅</span><span :aria-current="step === 'steam' ? 'step' : undefined">二 · 看火</span><span :aria-current="step === 'serve' ? 'step' : undefined">三 · 分早饭</span><small>这一笼留 {{ total }} 只</small></nav>
    <div ref="voice" class="breakfast-voice"><WoodFrame kind="ui-toast" /><p class="text-scroll" tabindex="0" @click="finishText" @keydown.space.prevent="finishText" @keydown.enter.prevent="finishText"><ProgressiveText :text="words" :revealed="visibleCounts[0]" /></p></div>
    <template v-if="step === 'fill'">
      <div class="filling-tray"><UiButton v-for="filling in plan.fillings" :key="filling" :aria-pressed="selected === filling" :tone="selected === filling ? 'jade' : 'paper'" @click="selectFilling(filling)"><AssetImage :asset="assets['prop-buns']!" /><strong>{{ filling }}</strong></UiButton></div>
      <div class="breakfast-orders"><article v-for="order in plan.orders" :key="order.id"><h3>{{ order.person }}</h3><p>{{ order.hint }}</p><button class="order-bowl" :data-breakfast-order="order.id" :aria-label="`给${order.person}放一个${selected || '包子'}`" @click="place(order.id)"><WoodFrame kind="ui-paper" /><AssetImage v-if="servings[order.id]" :asset="assets['prop-buns']!" /><span>{{ servings[order.id] ? `${servings[order.id].filling} × ${servings[order.id].count}` : '把包子放在这里' }}</span></button><UiButton v-if="servings[order.id]" tone="quiet" @click="delete servings[order.id]">重新装</UiButton></article></div>
      <UiButton tone="jade" @click="check">{{ total }} 只认齐了，去看火</UiButton>
    </template>
    <template v-else-if="step === 'steam'">
      <div class="steamer-stage" :class="{ heating: running, ready: heat >= 60 && heat <= 85 }"><AssetImage :asset="assets[steamed ? 'prop-open-steamer' : 'prop-steamer']!" /><div v-if="running" class="steam-clouds" aria-hidden="true"><i></i><i></i><i></i></div></div>
      <p class="steam-caption" role="status">{{ steamText }}</p><progress :value="heat" max="100" aria-label="蒸汽" class="steam-gauge"></progress>
      <div class="button-row"><UiButton v-if="!running" tone="jade" @click="start">合盖，上火</UiButton><UiButton v-else tone="jade" @click="lift">揭盖看一眼</UiButton></div>
    </template>
    <template v-else>
      <div class="breakfast-served"><svg class="breakfast-bun-count" :viewBox="`0 0 ${total * 44 + 18} 82`" role="img" :aria-label="`这一笼的 ${total} 只包子`"><defs><radialGradient :id="bunFill" cx=".4" cy=".3" r=".8"><stop stop-color="#fff6d7" /><stop offset=".7" stop-color="#e2c998" /><stop offset="1" stop-color="#b99b6d" /></radialGradient></defs><g v-for="number in total" :key="number" :transform="`translate(${number * 44 - 18}, ${number % 2 ? 36 : 46})`"><ellipse cy="17" rx="20" ry="7" fill="#8f755c" opacity=".15" /><path d="M-20 10C-23-2-13-17 0-18C13-17 23-2 20 10C16 23-17 23-20 10Z" :fill="`url(#${bunFill})`" stroke="#b59d77" stroke-width=".7" /><path d="M0-16Q-11-7-11 6M0-16Q-3-5-3 7M0-16Q5-5 6 7M0-16Q14-5 14 5" fill="none" stroke="#bfa780" stroke-width="1.2" opacity=".65" /></g></svg><p>阿宁和你那份留在碗里。再分清这两份，就能端早饭了。</p></div>
      <div class="breakfast-packages"><section v-for="task in plan.packaging" :key="task.orderId"><WoodFrame kind="ui-paper" /><h3>{{ task.title }}</h3><div class="button-row"><UiButton v-for="choice in task.choices" :key="choice.id" :data-breakfast-package="task.orderId + ':' + choice.id" :tone="packages[task.orderId] === choice.id ? 'jade' : 'paper'" :aria-pressed="packages[task.orderId] === choice.id" @click="choosePackage(task.orderId, choice.id)">{{ choice.label }}</UiButton></div></section></div>
      <UiButton tone="jade" @click="checkPackages">端着早饭，去后院</UiButton>
    </template>
    <UiButton v-if="step!=='serve'" class="breakfast-help" tone="quiet" @click="help">让陈伯带着出一笼</UiButton>
  </div>
</template>
<style scoped>
.breakfast-steps{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin:0 0 15px;color:#968263;font:13px/1.7 var(--font-story)}.breakfast-steps [aria-current]{color:#526447;border-bottom:1px solid #8d9b71}.breakfast-steps small{margin-left:auto;font-size:11px}
.breakfast-voice{position:relative;isolation:isolate;margin:0 0 20px;padding:20px 25px;color:#5c4831;min-height:92px}.breakfast-voice p{font:17px/1.9 var(--font-story);white-space:pre-line;margin:0}.breakfast-voice .ui-button{margin-top:7px;font-size:12px}
.filling-tray{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px;padding:5px 0;background:#f5ecd9}.filling-tray .ui-button{min-height:72px}.filling-tray .asset-image{width:46px;height:36px}.filling-tray strong{font:17px var(--font-story)}
.breakfast-orders{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:20px}.breakfast-orders article{min-width:0}.breakfast-orders h3{font:19px/1.5 var(--font-story);margin:0 0 5px}.breakfast-orders p{min-height:24px;font:13px/1.7 var(--font-story);margin:0 0 8px;color:#8a7453}.order-bowl{position:relative;isolation:isolate;width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;gap:12px;padding:15px;border:0;background:none;color:#615034}.order-bowl>.asset-image{width:76px;height:55px}.order-bowl>span{font:15px var(--font-story)}
.breakfast-served{display:flex;gap:25px;align-items:center;margin:12px 0 20px}.breakfast-bun-count{width:220px;height:90px;flex-shrink:0}.breakfast-served p{font:16px/1.9 var(--font-story);max-width:300px}
.breakfast-packages{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px}.breakfast-packages section{position:relative;isolation:isolate;padding:24px 25px}.breakfast-packages h3{font:20px var(--font-story);margin:0 0 17px}.breakfast-packages .button-row{align-items:stretch;flex-direction:column;gap:8px}.breakfast-help{display:block;margin:12px 0 0}
@media(max-width:640px){.breakfast-orders,.breakfast-packages{grid-template-columns:1fr}.breakfast-steps{gap:10px}.breakfast-steps small{width:100%;margin-left:0}.breakfast-voice{padding:18px 21px}.breakfast-voice p{font-size:16px}.breakfast-served{gap:12px;flex-wrap:wrap}.breakfast-bun-count{width:190px;height:70px}.breakfast-served p{font-size:14px}}
</style>
