<script setup lang="ts">
import { computed,ref } from 'vue';
import type { MinigameProps,MinigameResult } from './contracts.ts';
import { placeTicket,serviceResult,suggestService } from './service.ts';
import AssetImage from '../../shared/AssetImage.vue';
const props=defineProps<MinigameProps>();const emit=defineEmits<{finish:[result:MinigameResult]}>();
const plan=computed(()=>props.definition.service!);const selected=ref('');
const queues=ref<string[][]>(Array.from({length:props.definition.service!.pots},()=>[]));
const half=ref(false),noScallion=ref(false),assisted=ref(false),feedback=ref('');
const result=computed(()=>serviceResult(plan.value,queues.value,half.value,noScallion.value));
function place(pot:number){if(!selected.value){feedback.value='先选一张单。';return;}queues.value=placeTicket(plan.value,queues.value,selected.value,pot);selected.value='';feedback.value='';}
function finish(){if(!result.value.complete){feedback.value=result.value.errors.join(' ');return;}emit('finish',{status:'completed',score:assisted.value?80:100,assisted:assisted.value});}
function help(){queues.value=suggestService(plan.value);half.value=true;noScallion.value=true;assisted.value=true;feedback.value='琴姐把赶时间的夹在前头，外送放另一口锅。';}
</script>
<template><div class="service-game"><div class="service-tickets"><button v-for="t in plan.tickets" :key="t.id" :aria-pressed="selected===t.id" @click="selected=t.id"><strong>{{t.person}}</strong><small>下锅 {{t.cook}} 分钟 · {{t.deadline}} 分钟内端出</small><span>{{t.note}}</span></button></div><div class="pot-queues"><section v-for="(queue,i) in queues" :key="i"><h3>第{{i+1}}口锅</h3><AssetImage :asset="assets['noodle-bowl']!" /><button class="pot-target" @click="place(i)">把选中的单放进来</button><ol><li v-for="id in queue" :key="id"><span>{{plan.tickets.find(t=>t.id===id)?.person}}</span><small>{{result.finishTimes[id]}} 分钟出碗</small><button class="quiet" aria-label="移出这张单" @click="queues[i]=queue.filter(t=>t!==id)">移出</button></li></ol></section></div><div class="service-notes"><span>田姨那份</span><label><input v-model="half" type="checkbox" />半份</label><label><input v-model="noScallion" type="checkbox" />不放葱</label></div><p class="activity-feedback" role="status">{{feedback}}</p><div class="button-row"><button class="primary" @click="finish">照这个顺序下锅</button><button class="quiet" @click="help">请琴姐指点一下</button></div></div></template>
