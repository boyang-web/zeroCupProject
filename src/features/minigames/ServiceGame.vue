<script setup lang="ts">
import { computed,ref,useId } from 'vue';
import type { MinigameProps,MinigameResult } from './contracts.ts';
import { placeTicket,serviceResult,suggestService } from './service.ts';
import UiButton from '../../shared/UiButton.vue';
import WoodFrame from '../../presentation/WoodFrame.vue';
import Icon from '../../shared/Icon.vue';
const props=defineProps<MinigameProps>();const emit=defineEmits<{finish:[result:MinigameResult]}>();
const plan=computed(()=>props.definition.service!);const selected=ref('');
const queues=ref<string[][]>(Array.from({length:props.definition.service!.pots},()=>[]));
const half=ref(false),noScallion=ref(false),assisted=ref(false),feedback=ref('');
const result=computed(()=>serviceResult(plan.value,queues.value,half.value,noScallion.value));
const selectedLabel = computed(() => plan.value.tickets.find(t => t.id === selected.value)?.person);
const potId = useId().replace(/:/g,'') + '-pot';
function drag(event: DragEvent, id: string) { selected.value=id; event.dataTransfer?.setData('text/plain',id); if(event.dataTransfer)event.dataTransfer.effectAllowed='move'; }
function place(pot:number){if(!selected.value){feedback.value='先选一张单。';return;}queues.value=placeTicket(plan.value,queues.value,selected.value,pot);selected.value='';feedback.value='';}
function finish(){if(!result.value.complete){feedback.value=result.value.errors.join(' ');return;}emit('finish',{status:'completed',score:assisted.value?80:100,assisted:assisted.value});}
function help(){queues.value=suggestService(plan.value);half.value=true;noScallion.value=true;assisted.value=true;feedback.value='琴姐把赶时间的夹在前头，外送放另一口锅。';}
</script>
<template>
  <div class="service-game">
    <aside class="service-instruction"><WoodFrame kind="ui-toast" /><Icon name="look" /><p>点一张单，再排进一口锅的队列；也可以把单拖过去。同一口锅按顺序累加时间。<small>读字和看物件不会扣时间，排好以后再下锅。</small></p></aside>
    <div class="service-tickets" aria-label="等着的三张单">
      <button v-for="t in plan.tickets" :key="t.id" :data-ticket="t.id" :aria-pressed="selected===t.id" :class="{ selected: selected===t.id, placed: queues.some(q=>q.includes(t.id)) }" draggable="true" @dragstart="drag($event,t.id)" @click="selected=t.id">
        <WoodFrame kind="ui-paper" /><small class="service-ticket-kind">{{t.id==='tian' ? '窗边 · 堂食' : t.id==='delivery' ? '门口 · 外送' : '后来 · 堂食'}}</small><strong>{{t.person}}</strong><span>{{t.note}}</span><small>下锅 {{t.cook}} 分钟 · {{t.deadline}} 分钟内端出</small><i v-if="queues.some(q=>q.includes(t.id))">已夹进队列</i>
      </button>
    </div>
    <p class="service-selection" role="status">{{ selectedLabel ? '选中了' + selectedLabel + '，放到下面一口锅。' : '先选一张单，看看谁还剩多少时间。' }}<Icon name="arrow" /></p>
    <div class="pot-queues">
      <section v-for="(queue,i) in queues" :key="i" :data-pot="i" class="service-pot" @dragover.prevent @drop.prevent="place(i)">
        <WoodFrame kind="ui-paper" /><header><h3>第{{i+1}}口锅</h3><small>{{ queue.length ? '排到第 ' + result.finishTimes[queue.at(-1)!] + ' 分钟出碗' : '这口锅还空着' }}</small></header>
        <svg class="service-pot-drawing" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient :id="potId+i" x2="0" y2="1"><stop stop-color="#e3ddc9"/><stop offset="1" stop-color="#9b9e89"/></linearGradient></defs><path d="M25 43H12V57H29M135 43H148V57H131" fill="none" stroke="#837e65" stroke-width="3"/><path d="M29 38V67C29 83 131 83 131 67V38" :fill="`url(#${potId+i})`" stroke="#7c7c61" stroke-width="2"/><ellipse cx="80" cy="38" rx="51" ry="11" fill="#b2b5a0" stroke="#7c7c61" stroke-width="2"/><ellipse cx="80" cy="38" rx="45" ry="7" fill="#e7e3ce"/><path d="M62 24C53 15 71 15 63 5M81 23C73 13 88 13 81 3M100 24C92 15 109 15 101 5" fill="none" stroke="#a5a48b" stroke-width="2" opacity=".65"/></svg>
        <UiButton class="pot-target" tone="paper" :aria-label="'放入第'+(i+1)+'口锅'" @click="place(i)">{{ selectedLabel ? '排进这口锅' : '先选一张单' }}<Icon name="arrow" /></UiButton>
        <ol class="service-queue"><li v-for="id in queue" :key="id" :class="{ late: result.finishTimes[id] > plan.tickets.find(t=>t.id===id)!.deadline }"><span>{{plan.tickets.find(t=>t.id===id)?.person}}</span><small>{{result.finishTimes[id]}} 分钟出碗</small><UiButton tone="quiet" aria-label="移出这张单" @click="queues[i]=queue.filter(t=>t!==id)">移出</UiButton></li></ol>
      </section>
    </div>
    <div class="service-notes"><span>出锅前再看田姨那份</span><label><input v-model="half" type="checkbox" />半份</label><label><input v-model="noScallion" type="checkbox" />不放葱</label></div>
    <p class="activity-feedback" role="status">{{feedback}}</p>
    <div class="button-row"><UiButton tone="jade" @click="finish">照这个顺序下锅</UiButton><UiButton tone="quiet" @click="help">请琴姐指点一下</UiButton></div>
  </div>
</template>
