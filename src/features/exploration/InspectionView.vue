<script setup lang="ts">
import type { Asset, GameState, Interaction, MinigameDefinition } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { computed, nextTick, ref, watch } from 'vue';
import PhysicalObject from './PhysicalObject.vue';
import UiButton from '../../shared/UiButton.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import { useReadingSequence } from '../../presentation/useReadingSequence';
import { narrativePages } from '../../presentation/narrative-pages';
const props=defineProps<{ inspection: Extract<Interaction, { kind: 'inspect' }>; state: GameState; activity?: MinigameDefinition; propAsset?: Asset; journalAvailable?: boolean; developer?: boolean; reducedMotion?: boolean }>();
const shownVersion = computed(() => props.inspection.versions?.find(v => matches(props.state, v.condition)));
const shownText = computed(() => shownVersion.value?.text ?? props.inspection.text);
const exhibit = computed(() => shownVersion.value?.exhibit ?? props.inspection.exhibit);
const extraLines = computed(() => !props.inspection.manipulation ? exhibit.value?.lines ?? [] : []);
const pages = computed(() => narrativePages(shownText.value));
const readingPage = ref(0), copyArea = ref<HTMLElement>();
const lastPage = computed(() => readingPage.value === pages.value.length - 1);
watch(shownText, () => { readingPage.value = 0; }, { flush: 'sync' });
const optionsCount = computed(() => props.inspection.options?.length ?? 0);
const hasJournal = computed(() => props.inspection.journalLink && props.journalAvailable);
const { visibleCounts, visibleActions, textDone, finishText } = useReadingSequence({
  texts: () => [pages.value[readingPage.value] ?? '', lastPage.value ? exhibit.value?.caption ?? '' : '', ...(lastPage.value ? extraLines.value : [])],
  actions: () => lastPage.value ? optionsCount.value + Number(!!props.activity) + Number(!!hasJournal.value) : 1, reduced: () => props.reducedMotion, identity: () => String(readingPage.value),
});
async function continueReading() { if (!visibleActions.value) return; readingPage.value++; await nextTick(); copyArea.value?.scrollIntoView({ block: 'nearest' }); }
const emit = defineEmits<{ option: [id: string]; activity: []; examined: []; journal: [] }>();
</script>
<template>
  <div class="inspection-layout" :class="{ 'has-artifact': exhibit || propAsset }">
    <PhysicalObject v-if="inspection.manipulation" :kind="inspection.manipulation" :asset="propAsset" :exhibit="exhibit" :reduced-motion="reducedMotion" @examined="emit('examined')" />
    <figure v-else-if="propAsset" class="object-inspection"><AssetImage :asset="propAsset" /><figcaption>{{ exhibit?.kicker }}</figcaption></figure>
    <figure v-else-if="exhibit" class="artifact" :class="'artifact--' + exhibit.kind">
      <template v-if="exhibit.kind === 'book'"><div class="book-spine"></div><span class="artifact-kicker">{{ exhibit.kicker }}</span><div class="book-cover-title">{{ exhibit.title }}</div><Icon name="leaf" /><small>一巷烟火 · 几页人间</small></template>
      <template v-else><span class="artifact-kicker">{{ exhibit.kicker }}</span><h3>{{ exhibit.title }}</h3><p v-for="line in exhibit.lines" :key="line"><ProgressiveText :text="line" :reduced-motion="reducedMotion" /></p><span class="artifact-flower" aria-hidden="true">✧</span></template>
    </figure>
    <div ref="copyArea" class="inspection-copy"><p class="eyebrow">仔细看看</p><p class="inspect-text" @click="finishText"><ProgressiveText :text="pages[readingPage]!" :revealed="visibleCounts[0]" /></p><p v-if="lastPage && exhibit?.caption" class="artifact-caption" @click="finishText"><ProgressiveText :text="exhibit.caption" :revealed="visibleCounts[1]" /></p>
      <ol v-if="lastPage && !inspection.manipulation && exhibit?.kind === 'book'" class="book-contents"><li v-for="(line, i) in extraLines" :key="line"><small>0{{ i + 1 }}</small><ProgressiveText :text="line" :revealed="visibleCounts[i + 2]" /></li></ol>
      <blockquote v-else-if="lastPage && extraLines.length" class="exhibit-quotation"><p v-for="(line, i) in extraLines" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i + 2]" /></p></blockquote>
      <div class="reading-controls"><UiButton v-if="!textDone" tone="quiet" aria-label="显示当前文字全文" @click="finishText">显示本段 <span aria-hidden="true">›</span></UiButton><small v-if="pages.length > 1" class="reading-page-count">{{ readingPage + 1 }} / {{ pages.length }}</small></div><div v-if="!lastPage" class="reading-action" :class="{ 'is-ready': visibleActions > 0 }" :inert="!visibleActions"><UiButton tone="paper" :disabled="!visibleActions" aria-label="继续观察这件物品" @click="continueReading">继续细看 <Icon name="arrow" /></UiButton></div>
      <div v-if="lastPage && inspection.options" class="choice-list"><div v-for="(option, i) in inspection.options" :key="option.id" class="reading-action" :class="{ 'is-ready': i < visibleActions }" :inert="i >= visibleActions" :aria-hidden="i >= visibleActions"><button class="choice" :data-action-id="option.id" :disabled="i >= visibleActions || !developer && (!matches(state, option.condition) || state.rewards.includes(option.onceKey ?? option.id))" @click="emit('option', option.id)"><Icon name="arrow" /><span>{{ !developer && state.rewards.includes(option.onceKey ?? option.id) ? '已经办了' : option.label }}</span></button><small v-if="!developer && !matches(state, option.condition)">{{ option.unavailable }}</small><p v-if="option.feedback && state.rewards.includes(option.onceKey ?? option.id)" class="object-response"><ProgressiveText :text="option.feedback" :active="textDone" :reduced-motion="reducedMotion" /></p></div></div>
      <div v-if="lastPage && activity" class="inspection-activity reading-action" :class="{ 'is-ready': visibleActions > optionsCount }" :inert="visibleActions <= optionsCount" :aria-hidden="visibleActions <= optionsCount"><UiButton tone="jade" :disabled="visibleActions <= optionsCount || !developer && !matches(state, activity.condition)" @click="emit('activity')"><Icon name="book" />{{ state.rewards.includes(activity.reward.onceKey ?? activity.reward.id) ? '再看看走访书签' : '整理走访书签' }}<Icon name="arrow" /></UiButton><small v-if="!developer && !matches(state, activity.condition)">{{ activity.unavailable }}</small></div>
      <span v-if="lastPage && textDone && inspection.action && state.rewards.includes(inspection.action.onceKey ?? inspection.action.id)" class="entry-recorded"> <Icon name="check" /> 已看过这处细节</span>
      <div v-if="lastPage && hasJournal" class="reading-action" :class="{ 'is-ready': visibleActions > optionsCount + Number(!!activity) }" :inert="visibleActions <= optionsCount + Number(!!activity)" :aria-hidden="visibleActions <= optionsCount + Number(!!activity)"><UiButton tone="quiet" :disabled="visibleActions <= optionsCount + Number(!!activity)" @click="emit('journal')">翻开誊清的食谱 →</UiButton></div>
    </div>
  </div>
</template>
