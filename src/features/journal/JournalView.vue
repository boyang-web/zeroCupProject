<script setup lang="ts">
import{computed,defineAsyncComponent,nextTick,onMounted,ref,watch}from'vue';
import type{ContentPack,GameState,MinigameDefinition,MinigameResult}from'../../core/contracts';
import{matches}from'../../core/conditions';import{featureUnlocked}from'../../core/progression';import AssetImage from'../../shared/AssetImage.vue';import UiButton from'../../shared/UiButton.vue';import UiOrnament from'../../presentation/UiOrnament.vue';import HandwrittenText from'./HandwrittenText.vue';import{entryText}from'../../presentation/entry-text';
const loadBookmarks=()=>import('../minigames/ItineraryGame.vue');
const ItineraryGame=defineAsyncComponent(loadBookmarks);
const props=defineProps<{content:ContentPack;state:GameState;reducedMotion:boolean;newEntryId?:string;developer?:boolean;activity?:MinigameDefinition;contextText?:string;initialBookmarks?:boolean}>();
const emit=defineEmits<{read:[];finish:[result:MinigameResult]}>();
const tab=ref<'recipes'|'life'|'bookmarks'>(props.initialBookmarks&&props.activity?'bookmarks':props.newEntryId&&props.content.clues.some(c=>c.id===props.newEntryId&&c.category==='life')?'life':'recipes');
const page=ref(0),reading=ref<HTMLElement>(),direction=ref(1);
const writingId=ref(props.newEntryId);
const canLife=computed(()=>featureUnlocked(props.state,props.content,'lifeNotes',{developer:props.developer}));
const spreads=computed(()=>tab.value==='life'?props.content.clues.filter(c=>c.category==='life'&&(props.developer||props.state.clues.includes(c.id))).map(c=>({id:c.id,title:c.title,subtitle:'人间百味',asset:c.asset,note:undefined as string|undefined,ingredients:undefined as string[]|undefined,steps:undefined as string[]|undefined,text:entryText(c,props.state)})):(props.content.recipes??[]).filter(r=>props.developer||matches(props.state,r.condition)).map(r=>({id:r.id,title:r.title,subtitle:r.subtitle,asset:r.asset,note:r.note,ingredients:r.ingredients,steps:r.steps,text:''})));
const spread=computed(()=>spreads.value[page.value]??spreads.value[0]);
const animateInk=computed(()=>spread.value?.id===writingId.value&&!props.reducedMotion);
onMounted(async()=>{if(props.activity)void loadBookmarks();const index=spreads.value.findIndex(s=>s.id===props.newEntryId);if(index>=0)page.value=index;await nextTick();emit('read');});
function changeTab(value:typeof tab.value){if(value==='life'&&!canLife.value||value==='bookmarks'&&!props.activity)return;if(tab.value!==value)writingId.value=undefined;tab.value=value;page.value=0;}
function changePage(by:number){const target=props.developer&&spreads.value.length?(page.value+by+spreads.value.length)%spreads.value.length:page.value+by;if(target<0||target>=spreads.value.length)return;if(target!==page.value)writingId.value=undefined;direction.value=by;page.value=target;}
watch([tab,page],async()=>{await nextTick();reading.value?.querySelectorAll<HTMLElement>('.book-copy').forEach(e=>e.scrollTo({top:0}));});
</script>
<template>
 <div class="journal-book journal-book--ready" :class="{'journal-book--still':reducedMotion,'journal-book--bookmarks':tab==='bookmarks'}" @keydown.left.prevent="tab!=='bookmarks'&&changePage(-1)" @keydown.right.prevent="tab!=='bookmarks'&&changePage(1)">
  <nav class="book-ribbons" aria-label="百味录内容"><button :aria-pressed="tab==='recipes'" @click="changeTab('recipes')"><UiOrnament kind="bookmark"/><span>食谱</span></button><button v-if="activity" :aria-pressed="tab==='bookmarks'" @click="changeTab('bookmarks')"><UiOrnament kind="bookmark"/><span>书签</span></button><button v-if="canLife" :aria-pressed="tab==='life'" @click="changeTab('life')"><UiOrnament kind="bookmark"/><span>人间百味</span></button></nav>
  <div v-if="tab==='bookmarks'&&activity" class="book-bookmarks"><ItineraryGame :definition="activity" :state="state" :assets="content.assets" :reduced-motion="reducedMotion" @finish="emit('finish',$event)"/></div>
  <div v-else ref="reading" class="book-spread" :class="{'book-spread--back':direction<0}" :key="`${tab}-${spread?.id}`"><div class="book-binding" aria-hidden="true"><i></i><i></i><i></i></div>
   <template v-if="spread">
    <section class="book-page book-page--left"><small class="book-page-kicker">{{spread.subtitle}}</small><h2>{{spread.title}}</h2><div v-if="spread.asset" class="recipe-illustration" :class="{'recipe-illustration--drawing':animateInk}"><AssetImage :asset="content.assets[spread.asset]!"/></div><UiOrnament kind="divider"/>
     <div class="book-copy book-copy--left text-scroll" tabindex="0" aria-label="食谱备料与扉页文字"><div v-if="spread.ingredients" class="recipe-ingredients"><small>备料</small><p v-for="(ingredient,i) in spread.ingredients" :key="ingredient"><HandwrittenText :text="ingredient" :animate="animateInk" :reduced-motion="reducedMotion" :delay="i*.06"/></p></div><p v-if="contextText&&tab==='recipes'&&page===0" class="book-context">{{contextText}}</p></div>
     <UiOrnament kind="osmanthus" class="book-flower"/><span class="book-page-number">{{String(page*2+1).padStart(2,'0')}}</span>
    </section>
    <section class="book-page book-page--right"><small class="book-page-kicker">{{tab==='recipes'?'做法':'这一次听到的事'}}</small><div class="book-copy text-scroll" tabindex="0" aria-label="百味录正文"><ol v-if="spread.steps" class="recipe-method"><li v-for="(step,i) in spread.steps" :key="step"><small>{{['一','二','三','四','五'][i]}}</small><HandwrittenText :text="step" :animate="animateInk" :reduced-motion="reducedMotion" :delay="i*.08"/></li></ol><p v-else class="life-manuscript"><HandwrittenText :text="spread.text" :animate="animateInk" :reduced-motion="reducedMotion"/></p><aside v-if="spread.note" class="recipe-margin-note"><small>页边小字</small><p><HandwrittenText :text="spread.note" :animate="animateInk" :reduced-motion="reducedMotion" :delay=".2"/></p></aside></div><span class="book-page-number">{{String(page*2+2).padStart(2,'0')}}</span></section>
   </template>
   <div v-else class="book-empty"><h2>还没有记下这一页</h2></div>
  </div>
  <footer v-if="tab!=='bookmarks'" class="book-pagination"><UiButton tone="quiet" :disabled="(!developer&&page===0)||!spreads.length" aria-label="上一页" @click="changePage(-1)">←</UiButton><small>{{spreads.length?`${page+1} / ${spreads.length}`:''}}</small><UiButton tone="quiet" :disabled="(!developer&&page>=spreads.length-1)||!spreads.length" aria-label="下一页" @click="changePage(1)">→</UiButton></footer>
 </div>
</template>
