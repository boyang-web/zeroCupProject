<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContentPack } from '../../core/contracts.ts';
import type { GameRuntime } from '../../runtime/useGame.ts';
import { decodeSave, slots, type SlotId } from '../../infrastructure/saves.ts';
import UiButton from '../../shared/UiButton.vue';
const props = defineProps<{ game: GameRuntime; content: ContentPack }>();
const emit = defineEmits<{ loaded: [] }>();
const revision = ref(0); const feedback = ref('');
const pending = ref<{ kind: 'load' | 'save'; slot: SlotId }>();
const labels: Record<SlotId, string> = { auto: '自动存档', checkpoint: '关键选择之前', 'manual-1': '手动存档 一', 'manual-2': '手动存档 二', 'manual-3': '手动存档 三' };
const rows = computed(() => { void revision.value; void props.game.saveRevision.value; return slots.map(slot => ({ slot, result: props.game.saves.read(slot) })); });
function confirmAction() {
  if (!pending.value) return;
  const { kind, slot } = pending.value; pending.value = undefined;
  if (kind === 'save') { props.game.save(slot); feedback.value = props.game.message.value; revision.value++; }
  else if (props.game.load(slot)) emit('loaded'); else feedback.value = props.game.message.value;
}
function exportSave() {
  const envelope = { format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: props.game.state.value };
  const url = URL.createObjectURL(new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `baiwei-${props.game.developer.value ? 'test-' : ''}${Date.now()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const imported = ref<ReturnType<typeof decodeSave>>();
async function importSave(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file) return;
  if (file.size > 1_000_000) { feedback.value = '存档文件过大。'; return; }
  try {
    const result = decodeSave(await file.text(), props.content);
    if (!result.ok) feedback.value = result.error; else imported.value = result;
  } catch { feedback.value = '文件无法读取，当前进度没有改变。'; }
}
function confirmImport() {
  if (imported.value?.ok) { props.game.restore(imported.value.value.state); emit('loaded'); }
}
</script>
<template>
  <p v-if="game.developer.value" class="annotation">这里读写独立测试档位。退出测试模式后恢复正常进度与档位。</p>
  <p class="muted">进度保存在当前浏览器。清除网站数据会移除存档，可以导出文件备份。物件操作中途退出，会从本轮开始处重试。</p>
  <div v-for="row in rows" :key="row.slot" class="save-row">
    <div><h3>{{ labels[row.slot] }}</h3><small v-if="!row.result.ok">{{ row.result.error }}</small><small v-else-if="row.result.value">{{ content.chapters.find(c => c.id === (row.result.ok && row.result.value?.state.chapterId))?.title }} · {{ new Date(row.result.value.savedAt).toLocaleString('zh-CN') }}</small><small v-else>尚无记录</small></div>
    <div class="button-row"><UiButton v-if="row.slot.startsWith('manual')" @click="pending = { kind: 'save', slot: row.slot }">保存</UiButton><UiButton :disabled="!game.developer.value && (!row.result.ok || !row.result.value)" @click="pending = { kind: 'load', slot: row.slot }">读取</UiButton></div>
  </div>
  <aside v-if="pending" class="annotation"><p>{{ pending.kind === 'load' ? '读取后将回到保存的时刻，当前未保存的进度会失去。' : '将使用当前进度覆盖这个手动档位。' }}</p><div class="button-row"><UiButton tone="jade" @click="confirmAction">确认{{ pending.kind === 'load' ? '读取' : '保存' }}</UiButton><UiButton @click="pending = undefined">取消</UiButton></div></aside>
  <aside v-if="imported?.ok" class="annotation"><p>已验证导入文件。载入会替换当前游玩进度，已有档位保持原样。</p><div class="button-row"><UiButton tone="jade" @click="confirmImport">载入导入文件</UiButton><UiButton @click="imported = undefined">取消</UiButton></div></aside>
  <div class="button-row backup-actions"><UiButton @click="exportSave">导出当前进度</UiButton><label class="file-button">导入存档<input type="file" accept=".json,application/json" @change="importSave" /></label></div>
  <p role="status">{{ feedback }}</p>
</template>
