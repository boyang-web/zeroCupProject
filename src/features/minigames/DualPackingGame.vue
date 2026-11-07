<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import { packingErrors, type PackedOrder } from './dual-packing.ts';
import AssetImage from '../../shared/AssetImage.vue';
import UiButton from '../../shared/UiButton.vue';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const plan = props.definition.packing!;
const packed = reactive<Record<string, PackedOrder>>(Object.fromEntries(plan.orders.map(o => [o.id, { vessel: '', rice: false, tofu: false, sauce: '', utensils: '' }])));
const selected = ref(plan.orders[0]!.id), latched = ref(false), insulation = ref(''), assisted = ref(false), feedback = ref('');
const current = computed(() => packed[selected.value]!);
const hasBag = computed(() => (props.state.inventory[props.definition.assistedItem ?? ''] ?? 0) > 0);
function check() {
  const errors = packingErrors(plan, packed, latched.value, insulation.value, hasBag.value);
  if (errors.length) { feedback.value = errors.join(' '); return; }
  emit('finish', { status: 'completed', score: 100, assisted: assisted.value });
}
function help() {
  assisted.value = true;
  const o = plan.orders.find(o => o.id === selected.value)!;
  Object.assign(current.value, { vessel: o.vessel, rice: true, tofu: true, sauce: o.sauce, utensils: o.utensils });
  latched.value = true; insulation.value ||= 'sleeve';
  feedback.value = `许叔带你核对了${o.person}这一份。另一张单也要看清。`;
}
</script>
<template>
  <div class="dual-packing">
    <div class="packing-orders"><UiButton v-for="o in plan.orders" :key="o.id" :tone="selected === o.id ? 'jade' : 'paper'" :aria-pressed="selected === o.id" :data-packing-order="o.id" @click="selected=o.id; feedback='' "><strong>{{o.person}}</strong><small>{{o.hint}}</small></UiButton></div>
    <div class="packing-workbench"><AssetImage :asset="assets[current.vessel === 'bowl' ? 'night-bowl' : 'night-box']!" />
      <div class="packing-fields"><label>容器<select v-model="current.vessel"><option value="">先选容器</option><option value="bowl">堂食浅碗</option><option value="box">带扣饭盒</option></select></label>
      <div class="packing-ingredients"><label><input v-model="current.rice" type="checkbox" />米饭</label><label><input v-model="current.tofu" type="checkbox" />豆腐烧菜</label></div>
      <label>辣酱<select v-model="current.sauce"><option value="">放在哪里？</option><option value="rim">碗沿</option><option value="cup">单独小杯</option><option value="mixed">拌进饭里</option></select></label>
      <label>筷子<select v-model="current.utensils"><option value="">放在哪里？</option><option value="beside">碗边</option><option value="outside">盒外</option><option value="inside">饭盒里</option></select></label></div></div>
    <div class="packing-finish"><label><input v-model="latched" type="checkbox" />试扣盒盖，再把空盒留在托盘</label><label>保温<select v-model="insulation"><option value="">选一种</option><option value="sleeve">店里的保温套</option><option v-if="hasBag" value="bag">陈伯的保温袋（交接后取回）</option></select></label></div>
    <p class="muted">罗姐那碗先上桌；小梁那份只核对分装单，等回信再盛。没有倒计时。</p>
    <p class="activity-feedback" role="status">{{feedback}}</p><div class="button-row"><UiButton tone="jade" @click="check">核对两张单</UiButton><UiButton tone="paper" @click="help">请许叔带做这一份</UiButton></div>
  </div>
</template>
<style scoped>
.packing-orders{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.packing-orders button{width:100%;text-align:left}.packing-orders :deep(.ui-button__content){display:grid;gap:.4rem;text-align:left;width:100%}.packing-orders small{line-height:1.6}.packing-workbench{display:grid;grid-template-columns:30% 1fr;gap:1rem;align-items:center;margin:1rem 0}.packing-workbench>:first-child{width:100%;height:130px}.packing-fields,.packing-finish{display:grid;gap:.8rem}.packing-fields>label,.packing-finish>label{display:flex;align-items:center;justify-content:space-between;gap:.8rem}.packing-ingredients{display:flex;gap:1.5rem}select{max-width:100%;padding:.45rem;color:inherit;background:#f5e8cb;border:1px solid #9f805a;border-radius:3px}input{margin-right:.5rem}@media(max-width:600px){.packing-orders{grid-template-columns:1fr}.packing-workbench{grid-template-columns:1fr}.packing-workbench>:first-child{height:85px}.packing-fields>label,.packing-finish>label{flex-wrap:wrap}}
</style>
