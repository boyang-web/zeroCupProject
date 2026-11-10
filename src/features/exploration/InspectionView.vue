<script setup lang="ts">
import type { Asset, GameState, Hotspot, Interaction, MinigameDefinition } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { computed, nextTick, onMounted, ref } from 'vue';
import PhysicalObject from './PhysicalObject.vue';
import UiButton from '../../shared/UiButton.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import { useReadingSequence } from '../../presentation/useReadingSequence';
const props=defineProps<{ contents?: Hotspot[]; inspection: Extract<Interaction, { kind: 'inspect' }>; state: GameState; activity?: MinigameDefinition; propAsset?: Asset; journalAvailable?: boolean; completeLabel?: string; developer?: boolean; reducedMotion?: boolean }>();
// A reveal may award a clue. Keep this reading stable as the object opens.
const initialVersion=props.inspection.versions?.find(v=>matches(props.state,v.condition));
const shownText=initialVersion?.text??props.inspection.text;
const exhibit=computed(()=>initialVersion?.exhibit??props.inspection.exhibit);
const extraLines=computed(()=>!props.inspection.manipulation?exhibit.value?.lines??[]:[]);
const copy=ref<HTMLElement>();
const options=computed(()=>props.inspection.options??[]);
const done=(id:string,onceKey?:string)=>props.state.rewards.includes(onceKey??id);
const completedAtOpen=new Set(props.state.rewards);
const newResponse=(id:string,onceKey?:string)=>done(id,onceKey)&&!completedAtOpen.has(onceKey??id);
const directAction=computed(()=>!props.inspection.manipulation&&props.propAsset&&!props.activity&&!props.inspection.journalLink&&options.value.length===1?options.value[0]:undefined);
const hasJournal=computed(()=>props.inspection.journalLink&&props.journalAvailable);
const { visibleCounts,visibleActions,textDone,finishText,revealActions }=useReadingSequence({texts:()=>[shownText,...extraLines.value],actions:()=>options.value.length+Number(!!props.activity)+Number(!!hasJournal.value)+Number(!!props.completeLabel)+(props.contents?.length??0),reduced:()=>props.reducedMotion});
const emit=defineEmits<{option:[id:string];activity:[];examined:[];journal:[];complete:[];object:[id:string]}>();
function advanceReading(){if(!textDone.value)finishText();else revealActions();}
defineExpose({advanceReading});
onMounted(async()=>{await nextTick();copy.value?.focus({preventScroll:true});});
</script>
<template>
  <div class="inspection-layout" :class="{ 'has-artifact': exhibit || propAsset,'inspection-layout--letter':inspection.manipulation==='unfold','inspection-layout--phone':inspection.manipulation==='phone' }">
    <PhysicalObject v-if="inspection.manipulation" :kind="inspection.manipulation" :asset="propAsset" :exhibit="exhibit" :reduced-motion="reducedMotion" @examined="emit('examined')" />
    <button v-else-if="directAction&&!done(directAction.id,directAction.onceKey)" class="object-inspection object-inspection--action" :aria-label="directAction.label" :disabled="!developer&&!matches(state,directAction.condition)" data-reading-control @click="emit('option',directAction.id)"><AssetImage :asset="propAsset!" /></button>
    <figure v-else-if="propAsset" class="object-inspection"><AssetImage :asset="propAsset" /></figure>
    <figure v-else-if="exhibit" class="artifact" :class="'artifact--'+exhibit.kind"><span class="artifact-kicker">{{exhibit.kicker}}</span><h3>{{exhibit.title}}</h3></figure>
    <div class="inspection-copy">
      <div ref="copy" class="inspection-reading text-scroll" tabindex="0" aria-label="物件叙述，点击或按空格、回车显示全文">
        <p class="inspect-text"><ProgressiveText :text="shownText" :revealed="visibleCounts[0]" :reserve-space="false" /></p>
        <blockquote v-if="extraLines.length" class="exhibit-quotation"><p v-for="(line,i) in extraLines" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i+1]" /></p></blockquote>
      </div>
      <div class="inspection-actions text-scroll">
        <div v-if="contents?.length" class="choice-list" aria-label="书里的三张店签">
          <UiButton v-for="(object,i) in contents" :key="object.id" :disabled="i>=visibleActions||!developer&&!matches(state,object.condition)" @click="emit('object',object.id)">{{object.label}}{{object.completed&&matches(state,object.completed)?' · 已读':''}}</UiButton>
        </div>
        <div v-if="options.length&&!directAction" class="choice-list"><template v-for="(option,i) in options" :key="option.id"><div v-if="!done(option.id,option.onceKey)||option.feedback&&newResponse(option.id,option.onceKey)" class="reading-action" :class="{ 'is-ready':i<visibleActions }" :inert="i>=visibleActions" :aria-hidden="i>=visibleActions">
          <button v-if="!done(option.id,option.onceKey)" class="choice" :data-action-id="option.id" :disabled="i>=visibleActions||!developer&&!matches(state,option.condition)" @click="emit('option',option.id)"><Icon name="arrow"/><span>{{option.label}}</span></button>
          <small v-if="!done(option.id,option.onceKey)&&!developer&&!matches(state,option.condition)">{{option.unavailable}}</small>
          <p v-if="option.feedback&&newResponse(option.id,option.onceKey)" class="object-response"><ProgressiveText :text="option.feedback" :active="textDone" :reduced-motion="reducedMotion"/></p>
        </div></template></div>
        <div v-if="activity" class="inspection-activity reading-action" :class="{ 'is-ready':visibleActions>options.length }" :inert="visibleActions<=options.length"><UiButton tone="jade" :disabled="visibleActions<=options.length||!developer&&!matches(state,activity.condition)" @click="emit('activity')">{{done(activity.reward.id,activity.reward.onceKey)?'再看看走访书签':'整理走访书签'}}</UiButton><small v-if="!developer&&!matches(state,activity.condition)">{{activity.unavailable}}</small></div>
        <div v-if="hasJournal" class="reading-action" :class="{ 'is-ready':visibleActions>options.length+Number(!!activity) }" :inert="visibleActions<=options.length+Number(!!activity)"><UiButton tone="quiet" @click="emit('journal')">食谱</UiButton></div>
      <div v-if="completeLabel" class="reading-action" :class="{'is-ready':visibleActions>options.length+Number(!!activity)+Number(!!hasJournal)}" :inert="visibleActions<=options.length+Number(!!activity)+Number(!!hasJournal)"><UiButton tone="jade" :disabled="visibleActions<=options.length+Number(!!activity)+Number(!!hasJournal)" @click="emit('complete')">{{completeLabel}}<Icon name="arrow"/></UiButton></div>
      </div>
    </div>
  </div>
</template>
