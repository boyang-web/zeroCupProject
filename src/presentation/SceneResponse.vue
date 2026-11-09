<script setup lang="ts">
import{onBeforeUnmount,ref,watch}from'vue';import WoodFrame from'./WoodFrame.vue';import Icon from'../shared/Icon.vue';import ProgressiveText from'../shared/ProgressiveText.vue';import{useReadingSequence}from'./useReadingSequence';
const props=defineProps<{title:string;text:string;reducedMotion?:boolean}>();const emit=defineEmits<{close:[]}>();const held=ref(false);let timer:ReturnType<typeof setTimeout>|undefined;
const{visibleCounts,textDone,finishText}=useReadingSequence({texts:()=>[props.text],reduced:()=>props.reducedMotion});
function schedule(){clearTimeout(timer);if(textDone.value&&!held.value)timer=setTimeout(()=>emit('close'),12000);}
watch([textDone,held],schedule,{immediate:true});onBeforeUnmount(()=>clearTimeout(timer));
</script>
<template><aside class="scene-response" role="status" @pointerenter="held=true" @pointerleave="held=false" @focusin="held=true" @focusout="held=false"><WoodFrame kind="ui-toast"/><header><small>{{title}}</small><button class="quiet" type="button" aria-label="收起回应" @click="emit('close')"><Icon name="close"/></button></header><div class="scene-response__copy text-scroll" tabindex="0" @click="finishText"><ProgressiveText :text="text" :revealed="visibleCounts[0]"/></div></aside></template>
