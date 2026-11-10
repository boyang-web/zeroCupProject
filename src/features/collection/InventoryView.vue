<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContentPack, GameState, Item } from '../../core/contracts';
import { objectModels } from '../../content/object-models';
import ObjectViewer from './ObjectViewer.vue';
const props=defineProps<{content:ContentPack;state:GameState;developer?:boolean;reducedMotion?:boolean}>();
const owned=computed(()=>props.content.items.filter(i=>props.developer||(props.state.inventory[i.id]??0)>0));
const selected=ref<{item:Item;source:HTMLElement}>();
const viewer=ref<InstanceType<typeof ObjectViewer>>();
defineExpose({closeObject:()=>{if(!selected.value)return false;void viewer.value?.close();return true;}});
</script>
<template><div class="object-browser inventory-browser">
  <div class="inventory-grid" :inert="!!selected"><button v-for="item in owned" :key="item.id" class="inventory-card" :aria-label="'拿起'+item.title+'，进入3D查看'" @click="selected={item,source:$event.currentTarget as HTMLElement}"><span class="inventory-symbol">{{ item.icon }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p><small>点按栏目 · 拿起细看</small></button><p v-if="!owned.length" class="muted">随身还没有收下的物件。</p></div>
  <ObjectViewer ref="viewer" v-if="selected&&objectModels[selected.item.id]" :title="selected.item.title" :description="selected.item.text" :kind="objectModels[selected.item.id]!" :source="selected.source" :reduced-motion="reducedMotion" @close="selected=undefined" />
</div></template>
