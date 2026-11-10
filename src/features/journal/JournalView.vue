<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ContentPack, GameState, MinigameDefinition, MinigameResult } from '../../core/contracts';
import { matches } from '../../core/conditions';
import { featureUnlocked } from '../../core/progression';
import AssetImage from '../../shared/AssetImage.vue';
import UiButton from '../../shared/UiButton.vue';
import UiOrnament from '../../presentation/UiOrnament.vue';
import HandwrittenText from './HandwrittenText.vue';
import { entryText } from '../../presentation/entry-text';
import { journalLifeEntries, lifePageForEntry } from '../../presentation/journal-life';

const loadBookmarks = () => import('../minigames/ItineraryGame.vue');
const ItineraryGame = defineAsyncComponent(loadBookmarks);
const props = defineProps<{content:ContentPack;state:GameState;reducedMotion:boolean;newEntryId?:string;developer?:boolean;activity?:MinigameDefinition;contextText?:string;initialBookmarks?:boolean}>();
const emit = defineEmits<{read:[];finish:[result:MinigameResult]}>();
const tab = ref<'recipes'|'life'|'bookmarks'>(props.initialBookmarks && props.activity ? 'bookmarks' : props.newEntryId && props.content.clues.some(c => c.id === props.newEntryId && c.category === 'life') ? 'life' : 'recipes');
const page = ref(0), reading = ref<HTMLElement>(), direction = ref(1), writingId = ref(props.newEntryId);
const viewport = window.matchMedia('(max-width:720px)');
const compact = ref(viewport.matches);
const canLife = computed(() => featureUnlocked(props.state, props.content, 'lifeNotes', {developer:props.developer}));
const spreads = computed(() => tab.value === 'life'
  ? journalLifeEntries(props.content,props.state,props.developer).map(c => ({id:c.id,title:c.title,subtitle:'人间百味',asset:c.asset,note:undefined as string|undefined,ingredients:undefined as string[]|undefined,steps:undefined as string[]|undefined,text:entryText(c,props.state)}))
  : (props.content.recipes ?? []).filter(r => props.developer || matches(props.state,r.condition)).map(r => ({id:r.id,title:r.title,subtitle:r.subtitle,asset:r.asset,note:r.note,ingredients:r.ingredients,steps:r.steps,text:''})));
const perPage = computed(() => tab.value === 'life' && !compact.value ? 2 : 1);
const pageCount = computed(() => Math.ceil(spreads.value.length / perPage.value));
const spread = computed(() => spreads.value[page.value] ?? spreads.value[0]);
const lifeLeaves = computed(() => spreads.value.slice(page.value * perPage.value,(page.value + 1) * perPage.value).map((entry,index) => ({...entry,number:page.value * perPage.value + index + 1})));
const animateInk = computed(() => spread.value?.id === writingId.value && !props.reducedMotion);
const pageLabel = computed(() => tab.value === 'life' && lifeLeaves.value.length > 1
  ? lifeLeaves.value[0]!.number + '–' + lifeLeaves.value.at(-1)!.number + ' / ' + spreads.value.length
  : spreads.value.length ? (tab.value === 'life' ? lifeLeaves.value[0]?.number : page.value+1) + ' / ' + spreads.value.length : '');
function resize(event:MediaQueryListEvent) {
  const anchor = page.value * perPage.value;
  compact.value = event.matches;
  page.value = Math.floor(anchor / perPage.value);
}
onMounted(async () => {
  viewport.addEventListener('change',resize);
  if (props.activity) void loadBookmarks();
  const index = spreads.value.findIndex(s => s.id === props.newEntryId);
  if (index >= 0) page.value = tab.value==='life' ? lifePageForEntry(spreads.value.map(s=>s.id),props.newEntryId,perPage.value) : index;
  await nextTick(); emit('read');
});
onBeforeUnmount(() => viewport.removeEventListener('change',resize));
function changeTab(value:typeof tab.value) {
  if (value === 'life' && !canLife.value || value === 'bookmarks' && !props.activity) return;
  if (tab.value !== value) writingId.value = undefined;
  tab.value = value; page.value = 0;
}
function changePage(by:number) {
  const count = pageCount.value;
  const target = props.developer && count ? (page.value+by+count)%count : page.value+by;
  if (target < 0 || target >= count) return;
  if (target !== page.value) writingId.value = undefined;
  direction.value = by; page.value = target;
}
watch([tab,page,compact],async () => {
  await nextTick(); reading.value?.querySelectorAll<HTMLElement>('.book-copy').forEach(e => e.scrollTo({top:0}));
});
</script>
<template>
  <div class="journal-book journal-book--ready" :class="{'journal-book--still':reducedMotion,'journal-book--bookmarks':tab==='bookmarks'}" @keydown.left.prevent="tab!=='bookmarks'&&changePage(-1)" @keydown.right.prevent="tab!=='bookmarks'&&changePage(1)">
    <nav class="book-ribbons" aria-label="百味录内容">
      <button data-sound="paper" :aria-pressed="tab==='recipes'" @click="changeTab('recipes')"><UiOrnament kind="bookmark"/><span>食谱</span></button>
      <button v-if="activity" :aria-pressed="tab==='bookmarks'" @click="changeTab('bookmarks')"><UiOrnament kind="bookmark"/><span>书签</span></button>
      <button v-if="canLife" :aria-pressed="tab==='life'" @click="changeTab('life')"><UiOrnament kind="bookmark"/><span>人间百味</span></button>
    </nav>
    <div v-if="tab==='bookmarks'&&activity" class="book-bookmarks"><ItineraryGame :definition="activity" :state="state" :assets="content.assets" :reduced-motion="reducedMotion" @finish="emit('finish',$event)"/></div>
    <div v-else ref="reading" :key="tab+'-'+(tab==='life'?lifeLeaves[0]?.id:spread?.id)" class="book-spread" :class="{'book-spread--back':direction<0,'book-spread--life':tab==='life','book-spread--single-life':tab==='life'&&lifeLeaves.length===1}">
      <div v-if="tab!=='life'||lifeLeaves.length>1" class="book-binding" aria-hidden="true"><i></i><i></i><i></i></div>
      <template v-if="tab==='life'">
        <section v-for="(leaf,index) in lifeLeaves" :key="leaf.id" class="book-page book-page--life" :class="index===0?'book-page--left':'book-page--right'" :data-life-entry="leaf.id" :aria-label="leaf.title">
          <small class="book-page-kicker">人间百味</small>
          <h2>{{leaf.title}}</h2>
          <div v-if="leaf.asset" class="life-illustration"><AssetImage :asset="content.assets[leaf.asset]!"/></div>
          <UiOrnament kind="divider"/>
          <div class="book-copy text-scroll" tabindex="0" :aria-label="leaf.title+'正文'">
            <p class="life-manuscript"><HandwrittenText :text="leaf.text" :animate="leaf.id===writingId&&!reducedMotion" :reduced-motion="reducedMotion"/></p>
          </div>
          <UiOrnament kind="osmanthus" class="book-flower"/><span class="book-page-number">{{String(leaf.number).padStart(2,'0')}}</span>
        </section>
      </template>
      <template v-else-if="spread">
        <section class="book-page book-page--left">
          <small class="book-page-kicker">{{spread.subtitle}}</small><h2>{{spread.title}}</h2>
          <div v-if="spread.asset" class="recipe-illustration" :class="{'recipe-illustration--drawing':animateInk}"><AssetImage :asset="content.assets[spread.asset]!"/></div><UiOrnament kind="divider"/>
          <div class="book-copy book-copy--left text-scroll" tabindex="0" aria-label="食谱备料与扉页文字">
            <div v-if="spread.ingredients" class="recipe-ingredients"><small>备料</small><p v-for="(ingredient,i) in spread.ingredients" :key="ingredient"><HandwrittenText :text="ingredient" :animate="animateInk" :reduced-motion="reducedMotion" :delay="i*.06"/></p></div>
            <p v-if="contextText&&page===0" class="book-context">{{contextText}}</p>
          </div>
          <UiOrnament kind="osmanthus" class="book-flower"/><span class="book-page-number">{{String(page*2+1).padStart(2,'0')}}</span>
        </section>
        <section class="book-page book-page--right">
          <small class="book-page-kicker">做法</small>
          <div class="book-copy text-scroll" tabindex="0" aria-label="百味录正文">
            <ol v-if="spread.steps" class="recipe-method"><li v-for="(step,i) in spread.steps" :key="step"><small>{{['一','二','三','四','五'][i]}}</small><HandwrittenText :text="step" :animate="animateInk" :reduced-motion="reducedMotion" :delay="i*.08"/></li></ol>
            <aside v-if="spread.note" class="recipe-margin-note"><small>页边小字</small><p><HandwrittenText :text="spread.note" :animate="animateInk" :reduced-motion="reducedMotion" :delay=".2"/></p></aside>
          </div>
          <span class="book-page-number">{{String(page*2+2).padStart(2,'0')}}</span>
        </section>
      </template>
      <div v-else class="book-empty"><h2>还没有记下这一页</h2></div>
    </div>
    <footer v-if="tab!=='bookmarks'" class="book-pagination"><UiButton data-sound="paper" tone="quiet" :disabled="(!developer&&page===0)||!pageCount" aria-label="上一页" @click="changePage(-1)">←</UiButton><small>{{pageLabel}}</small><UiButton data-sound="paper" tone="quiet" :disabled="(!developer&&page>=pageCount-1)||!pageCount" aria-label="下一页" @click="changePage(1)">→</UiButton></footer>
  </div>
</template>
