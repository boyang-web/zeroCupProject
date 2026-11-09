<script setup lang="ts">
import type { DialogueNode, GameState, ContentPack } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import { useReadingSequence } from '../../presentation/useReadingSequence';
import { computed, nextTick, onMounted, ref } from 'vue';
import { dialogueReadings } from '../../presentation/dialogue-readings';
import { sceneOf } from '../../core/scenes';
import { dialogueChoices } from '../../presentation/dialogue-choices';
const props = defineProps<{ node: DialogueNode; state: GameState; content: ContentPack; developer?: boolean; reducedMotion?: boolean }>();
const readingPage = ref(0), conversation = ref<HTMLElement>(),copy=ref<HTMLElement>();
const pages = computed(() => dialogueReadings(props.node, props.state));
const current = computed(() => pages.value[readingPage.value] ?? pages.value[0]!);
const location = computed(() => sceneOf(props.state,props.content).title);
const lastPage = computed(() => readingPage.value === pages.value.length - 1);
const choices = computed(() => dialogueChoices(props.node,props.state,props.developer));
const direction = computed(() => current.value.direction ?? '');
const { visibleCounts, visibleActions, textDone, finishText, revealActions } = useReadingSequence({
  texts: () => [direction.value, current.value.text], actions: () => lastPage.value ? choices.value.length : 0,
  reduced: () => props.reducedMotion, identity: () => `${props.node.id}:${readingPage.value}`,
});
async function continueReading() { if (!textDone.value||lastPage.value) return; readingPage.value++; await nextTick(); copy.value?.scrollTo({ top: 0 }); }
function advanceReading(){
  if(!textDone.value){finishText();return;}
  if(!lastPage.value){void continueReading();return;}
  revealActions();
}
defineExpose({advanceReading});
onMounted(async()=>{await nextTick();conversation.value?.focus({preventScroll:true});});
const portraitAsset = computed(() => {
  const asset=current.value.kind==='speech' && current.value.portrait ? props.content.assets[current.value.portrait] : undefined;
  if(!asset?.region)return asset;
  return {...asset,region:{...asset.region,height:Math.min(asset.region.height,asset.region.width*1.55)}};
});
const emit = defineEmits<{ choose: [id: string] }>();
const decisionAhead = computed(() => choices.value.some(c => c.decision && !props.state.decisions[c.decision]));
function conflict(state: GameState, decision: string | undefined, id: string) {
  return !!decision && !!state.decisions[decision] && state.decisions[decision] !== id;
}
</script>
<template>
  <div v-if="portraitAsset" class="dialogue-portrait"><AssetImage :asset="portraitAsset" :alt="current.speaker" /></div>
  <div ref="conversation" class="conversation" :class="{ 'with-portrait': portraitAsset, 'conversation--narration': current.kind==='narration' }" :data-reading-kind="current.kind" :data-speaker="current.speaker" :key="node.id" tabindex="-1" role="group" aria-label="交谈正文，点击或按空格、回车继续；回答需要明确选择">
  <div v-if="current.kind==='speech'" class="speaker-row"><h3>{{ current.speaker }}</h3><span></span></div><p v-else class="conversation-location">{{ location }}</p>
  <div ref="copy" class="conversation-copy text-scroll" tabindex="0" aria-label="交谈文字">
  <p v-if="direction" class="stage-direction"><ProgressiveText :text="direction" :revealed="visibleCounts[0]" /></p>
  <div class="dialogue-text"><ProgressiveText :text="current.text" :revealed="visibleCounts[1]" /></div>
  </div>
  <span v-if="textDone&&!lastPage" class="reading-cue" aria-hidden="true">⌄</span>
  <div v-if="lastPage" class="conversation-actions text-scroll" aria-label="选择回答">
  <div class="choice-list conversation-choices">
    <div v-for="(choice, i) in choices" :key="choice.id" class="reading-action" :class="{ 'is-ready': i < visibleActions }" :inert="i >= visibleActions" :aria-hidden="i >= visibleActions">
      <button class="choice" :data-choice-id="choice.id" :disabled="i >= visibleActions || !developer && (!matches(state, choice.condition) || conflict(state, choice.decision, choice.id))" @click="emit('choose', choice.id)"><Icon name="arrow" /><span>{{ choice.label }}</span><span v-if="choice.decision" class="choice-mark">决定</span></button>
      <small v-if="!developer && conflict(state, choice.decision, choice.id)">这项决定已经发生；可读取之前的存档尝试其他选择。</small>
      <small v-else-if="!developer && !matches(state, choice.condition)">{{ choice.unavailable }}</small>
    </div>
  </div>
  <p v-if="lastPage && decisionAhead && !developer" class="decision-guidance reading-action" :class="{ 'is-ready': visibleActions === choices.length }">选定后，这句话会留下记录。选择前的进度会单独保存，可以从菜单里读取。</p>
  </div>
  </div>
</template>
