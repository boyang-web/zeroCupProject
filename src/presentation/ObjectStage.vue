<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = defineProps<{ kind: string; value: number; reduced: boolean; modelUrl?: string }>();
const host = ref<HTMLElement>(); const error = ref(false); let cancelled = false;
let stage: ReturnType<typeof import('./object-stage')['createObjectStage']> | undefined;
onMounted(async () => {
  try {
    const { createObjectStage } = await import('./object-stage');
    if (cancelled || !host.value) return;
    stage = createObjectStage(host.value, props.kind, props.reduced, props.modelUrl); stage.update(props.value);
  } catch { if (!cancelled) error.value = true; }
});
watch(() => props.value, v => stage?.update(v));
onBeforeUnmount(() => { cancelled = true; stage?.dispose(); });
</script>
<template><div ref="host" class="object-stage" role="img" aria-label="物件操作示意"><div v-if="error" class="object-fallback">{{ kind === 'steamer' ? '◉ 笼屉' : '▰ 擀面杖' }}<small>画面暂用简图，操作仍然有效</small></div></div></template>
