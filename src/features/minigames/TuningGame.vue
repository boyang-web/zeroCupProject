<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MinigameProps, MinigameResult } from './contracts.ts';
import ObjectStage from '../../presentation/ObjectStage.vue';
const props = defineProps<MinigameProps>();
const emit = defineEmits<{ finish: [result: MinigameResult] }>();
const value = ref(25); const feedback = ref(''); const assisted = ref(false);
const lower = computed(() => props.definition.target - 10); const upper = computed(() => props.definition.target + 10);
function submit() {
  if (value.value < lower.value || value.value > upper.value) { feedback.value = '还差一点，调整后可以再试。'; return; }
  emit('finish', { status: 'completed', score: 100 - Math.abs(value.value - props.definition.target), assisted: assisted.value });
}
function help() { assisted.value = true; value.value = props.definition.target; feedback.value = '店主搭了把手，现在可以完成了。'; }
</script>
<template>
  <ObjectStage :kind="definition.module" :value="value" :reduced="reducedMotion" />
  <label class="range-label" for="tuning">{{ definition.module === 'steamer' ? '火候' : '擀制力度' }} <strong>{{ value }}</strong></label>
  <input id="tuning" v-model.number="value" type="range" min="0" max="100" />
  <p class="muted">目标范围 {{ lower }}–{{ upper }}。方向键也可以微调。</p>
  <p class="feedback" role="status">{{ feedback }}</p>
  <div class="button-row"><button class="primary" @click="submit">完成这次操作</button><button @click="help">请店主搭把手</button></div>
</template>
