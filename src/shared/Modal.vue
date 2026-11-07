<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import WoodFrame from '../presentation/WoodFrame.vue';
import Icon from './Icon.vue';
import UiButton from './UiButton.vue';
import UiOrnament from '../presentation/UiOrnament.vue';
defineProps<{ title: string; variant?: 'conversation' | 'wide' | 'book' | 'default' }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement>();
let previous: HTMLElement | null = null;
onMounted(() => { previous = document.activeElement as HTMLElement; dialog.value?.showModal(); });
onBeforeUnmount(() => { dialog.value?.close(); previous?.focus(); });
</script>
<template>
  <dialog ref="dialog" class="modal" :class="variant ? 'modal--' + variant : ''" aria-labelledby="modal-title" @cancel.prevent="emit('close')">
    <WoodFrame v-if="variant !== 'book'" :kind="variant === 'conversation' ? 'ui-frame' : 'ui-menu'" />
    <UiOrnament v-if="variant !== 'conversation'" class="modal-corner-flower" kind="osmanthus" />
    <header class="modal-header"><h2 id="modal-title">{{ title }}</h2><div class="modal-header-actions"><slot name="actions" /><UiButton tone="icon" aria-label="关闭面板" @click="emit('close')"><Icon name="close" /></UiButton></div></header>
    <div class="modal-body"><slot /></div>
  </dialog>
</template>
