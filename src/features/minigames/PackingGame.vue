<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const packed = ref<string[]>([]); const warmth = ref(40); const feedback = ref(''); const assisted = ref(false);
const parts = ['主食', '热菜', '餐具'];
const hasBag = computed(() => !!props.definition.assistedItem && (props.state.inventory[props.definition.assistedItem] ?? 0) > 0);
const tolerance = computed(() => hasBag.value ? 20 : 10);
function toggle(part: string) { packed.value = packed.value.includes(part) ? packed.value.filter(p => p !== part) : [...packed.value, part]; }
function finish() {
  if (packed.value.length !== 3) { feedback.value = '还差一点，看看饭盒里缺了什么。'; return; }
  if (Math.abs(warmth.value - props.definition.target) > tolerance.value) { feedback.value = '调整一下保温程度，再确认交接。'; return; }
  emit('finish', { status: 'completed', score: 100 - Math.abs(warmth.value - props.definition.target), assisted: assisted.value || hasBag.value });
}
function help() { assisted.value = true; packed.value = [...parts]; warmth.value = props.definition.target; feedback.value = '一起核对过了，可以交接。'; }
</script>
<template>
  <div class="lunchbox"><button v-for="part in parts" :key="part" :class="{ packed: packed.includes(part) }" :aria-pressed="packed.includes(part)" @click="toggle(part)"><span>{{ packed.includes(part) ? '✓' : '+' }}</span>{{ part }}</button></div>
  <label class="range-label" for="warmth">保温程度 <strong>{{ warmth }}</strong></label><input id="warmth" v-model.number="warmth" type="range" min="0" max="100" />
  <p class="muted">目标 {{ definition.target - tolerance }}–{{ definition.target + tolerance }}。{{ hasBag ? '借来的保温袋派上了用场，范围更宽松。' : '可以逐项核对，不用着急。' }}</p>
  <p class="feedback" role="status">{{ feedback }}</p><div class="button-row"><button class="primary" @click="finish">确认交接</button><button @click="help">一起核对</button></div>
</template>
