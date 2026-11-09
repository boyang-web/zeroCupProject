<script setup lang="ts">
import WoodFrame from'../../presentation/WoodFrame.vue';import Icon from'../../shared/Icon.vue';
interface DockTool{id:string;label:string;icon:string;control?:string;active?:boolean;attention?:boolean;count?:number}
defineProps<{tools:DockTool[];blocked?:boolean}>();const emit=defineEmits<{activate:[id:string]}>();
</script>
<template><TransitionGroup name="dock-reveal" tag="nav" class="game-dock" aria-label="常用功能"><button v-for="(tool,index) in tools" :key="tool.id" type="button" class="game-dock__tool" :class="{'is-active':tool.active,'has-new':tool.attention}" :style="{'--dock-delay':Math.min(index,4)*.05+'s'}" :disabled="blocked" :aria-label="tool.label" :aria-pressed="tool.active" :data-dock-tool="tool.id" :data-tutorial-control="tool.control" @click="emit('activate',tool.id)"><WoodFrame :kind="tool.active?'ui-selected':'ui-button'"/><Icon :name="tool.icon"/><span>{{tool.label}}</span><i v-if="tool.attention" class="game-dock__new" aria-label="有新内容"></i></button></TransitionGroup></template>
