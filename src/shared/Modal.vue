<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import WoodFrame from '../presentation/WoodFrame.vue';
import Icon from './Icon.vue';
defineProps<{ title: string; variant?: 'conversation' | 'wide' | 'book' | 'default' }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement>();
let previous: HTMLElement | null = null;
onMounted(() => { previous = document.activeElement as HTMLElement; dialog.value?.showModal(); });
onBeforeUnmount(() => { dialog.value?.close(); previous?.focus(); });
</script>
<template>
  <dialog ref="dialog" class="modal" :class="variant ? 'modal--' + variant : ''" aria-labelledby="modal-title" @cancel.prevent="emit('close')">
    <WoodFrame :kind="variant === 'conversation' ? 'ui-frame' : variant === 'book' ? 'ui-book' : 'ui-menu'" />
    <header class="modal-header"><h2 id="modal-title">{{ title }}</h2><button class="quiet" aria-label="关闭面板" @click="emit('close')"><Icon name="close" /></button></header>
    <div class="modal-body"><slot /></div>
  </dialog>
</template>
