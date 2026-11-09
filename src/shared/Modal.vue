<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import WoodFrame from '../presentation/WoodFrame.vue';
import Icon from './Icon.vue';
import UiButton from './UiButton.vue';
import UiOrnament from '../presentation/UiOrnament.vue';
const props=defineProps<{ title: string; variant?: 'conversation' | 'wide' | 'book' | 'default'; advanceReading?: boolean }>();
const emit = defineEmits<{ close: []; advance: [] }>();
const dialog = ref<HTMLDialogElement>();
let previous: HTMLElement | null = null;
let pointerStart: {x:number;y:number} | undefined;
const interactive='button,a,input,select,textarea,label,summary,[role="button"],[contenteditable="true"],[data-reading-control],.physical-object';
function advance(event: MouseEvent) {
  if(!props.advanceReading || event.defaultPrevented || !(event.target instanceof Element))return;
  if(event.target.closest(interactive)||window.getSelection()?.toString())return;
  if(pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>8)return;
  // Native dialogs also receive backdrop clicks; only the painted window advances.
  const box=dialog.value?.getBoundingClientRect();
  if(!box||event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)return;
  emit('advance');
}
function readKey(event: KeyboardEvent){
  if(!props.advanceReading||event.repeat||event.altKey||event.ctrlKey||event.metaKey||![' ','Enter'].includes(event.key))return;
  if(!(event.target instanceof Element)||event.target.closest(interactive))return;
  event.preventDefault();emit('advance');
}
onMounted(() => { previous = document.activeElement as HTMLElement; dialog.value?.showModal(); });
onBeforeUnmount(() => { dialog.value?.close(); previous?.focus(); });
</script>
<template>
  <dialog ref="dialog" class="modal" :class="[variant ? 'modal--' + variant : '',{'modal--reading':advanceReading}]" aria-labelledby="modal-title" @cancel.prevent="emit('close')" @pointerdown="pointerStart={x:$event.clientX,y:$event.clientY}" @click="advance" @keydown="readKey">
    <WoodFrame v-if="variant !== 'book'" :kind="variant === 'conversation' ? 'ui-frame' : 'ui-menu'" />
    <UiOrnament v-if="variant !== 'conversation'" class="modal-corner-flower" kind="osmanthus" />
    <header class="modal-header"><h2 id="modal-title">{{ title }}</h2><div class="modal-header-actions"><slot name="actions" /><UiButton tone="icon" aria-label="关闭面板" @click="emit('close')"><Icon name="close" /></UiButton></div></header>
    <div class="modal-body"><slot /></div>
  </dialog>
</template>
