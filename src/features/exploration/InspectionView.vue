<script setup lang="ts">
import type { Asset, GameState, Interaction, MinigameDefinition } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { computed } from 'vue';
import PhysicalObject from './PhysicalObject.vue';
import UiButton from '../../shared/UiButton.vue';
const props=defineProps<{ inspection: Extract<Interaction, { kind: 'inspect' }>; state: GameState; activity?: MinigameDefinition; propAsset?: Asset; journalAvailable?: boolean; developer?: boolean }>();
const shownText=computed(()=>props.inspection.versions?.find(v=>matches(props.state,v.condition))?.text??props.inspection.text);
const emit = defineEmits<{ option: [id: string]; activity: []; examined: []; journal: [] }>();
</script>
<template>
  <div class="inspection-layout" :class="{ 'has-artifact': inspection.exhibit || propAsset }">
    <PhysicalObject v-if="inspection.manipulation" :kind="inspection.manipulation" :asset="propAsset" :exhibit="inspection.exhibit" @examined="emit('examined')" />
    <figure v-else-if="propAsset" class="object-inspection"><AssetImage :asset="propAsset" /><figcaption>{{ inspection.exhibit?.kicker }}</figcaption></figure>
    <figure v-else-if="inspection.exhibit" class="artifact" :class="'artifact--' + inspection.exhibit.kind">
      <template v-if="inspection.exhibit.kind === 'book'"><div class="book-spine"></div><span class="artifact-kicker">{{ inspection.exhibit.kicker }}</span><div class="book-cover-title">{{ inspection.exhibit.title }}</div><Icon name="leaf" /><small>一巷烟火 · 几页人间</small></template>
      <template v-else><span class="artifact-kicker">{{ inspection.exhibit.kicker }}</span><h3>{{ inspection.exhibit.title }}</h3><p v-for="line in inspection.exhibit.lines" :key="line">{{ line }}</p><span class="artifact-flower" aria-hidden="true">✧</span></template>
    </figure>
    <div class="inspection-copy"><p class="eyebrow">仔细看看</p><p class="inspect-text">{{ shownText }}</p><p v-if="inspection.exhibit?.caption" class="artifact-caption">{{ inspection.exhibit.caption }}</p>
      <ol v-if="inspection.exhibit?.kind === 'book'" class="book-contents"><li v-for="(line, i) in inspection.exhibit.lines" :key="line"><small>0{{ i + 1 }}</small>{{ line }}</li></ol>
      <blockquote v-if="propAsset && !inspection.manipulation && inspection.exhibit && inspection.exhibit.kind !== 'book'" class="exhibit-quotation"><p v-for="line in inspection.exhibit.lines" :key="line">{{ line }}</p></blockquote>
      <div v-if="inspection.options" class="choice-list"><div v-for="option in inspection.options" :key="option.id"><button class="choice" :disabled="!developer && (!matches(state, option.condition) || state.rewards.includes(option.onceKey ?? option.id))" @click="emit('option', option.id)"><Icon name="arrow" /><span>{{ !developer && state.rewards.includes(option.onceKey ?? option.id) ? '已经办了' : option.label }}</span></button><small v-if="!developer && !matches(state, option.condition)">{{ option.unavailable }}</small><p v-if="option.feedback && state.rewards.includes(option.onceKey ?? option.id)" class="object-response">{{ option.feedback }}</p></div></div>
      <div v-if="activity" class="inspection-activity"><UiButton tone="jade" :disabled="!developer && !matches(state, activity.condition)" @click="emit('activity')"><Icon name="book" />{{ state.rewards.includes(activity.reward.onceKey ?? activity.reward.id) ? '再看看走访书签' : '整理走访书签' }}<Icon name="arrow" /></UiButton><small v-if="!developer && !matches(state, activity.condition)">{{ activity.unavailable }}</small></div>
      <span v-if="inspection.action && state.rewards.includes(inspection.action.onceKey ?? inspection.action.id)" class="entry-recorded"><Icon name="check" /> 已看过这处细节</span>
      <UiButton v-if="inspection.manipulation === 'book' && journalAvailable" tone="quiet" @click="emit('journal')">翻开誊清的食谱 →</UiButton>
    </div>
  </div>
</template>
