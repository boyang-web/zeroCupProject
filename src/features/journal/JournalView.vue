<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import type { ContentPack, GameState } from '../../core/contracts';
import { matches } from '../../core/conditions';
import { featureUnlocked } from '../../core/progression';
import AssetImage from '../../shared/AssetImage.vue';
import UiButton from '../../shared/UiButton.vue';
import UiOrnament from '../../presentation/UiOrnament.vue';
import HandwrittenText from './HandwrittenText.vue';
import { entryText } from '../../presentation/entry-text';
const props = defineProps<{ content: ContentPack; state: GameState; reducedMotion: boolean; newEntryId?: string; developer?: boolean }>();
const emit = defineEmits<{ read: [] }>();
const tab = ref<'recipes' | 'life'>(props.newEntryId && props.content.clues.some(c => c.id === props.newEntryId && c.category === 'life') ? 'life' : 'recipes');
const page = ref(0), turning = ref(false), ready = ref(false), skipWriting = ref(false);
const writingId = ref(props.newEntryId);
const book = ref<HTMLElement>(), cover = ref<HTMLElement>(), leaf = ref<HTMLElement>();
let opening: gsap.core.Timeline | undefined, turn: gsap.core.Timeline | undefined;
const canLife = computed(() => featureUnlocked(props.state, props.content, 'lifeNotes', { developer: props.developer }));
const spreads = computed(() => tab.value === 'recipes'
  ? (props.content.recipes ?? []).filter(r => props.developer || matches(props.state, r.condition)).map(r => ({ id: r.id, title: r.title, subtitle: r.subtitle, note: r.note, asset: r.asset as string | undefined, ingredients: r.ingredients as string[] | undefined, steps: r.steps as string[] | undefined, text: '' }))
  : props.content.clues.filter(c => c.category === 'life' && (props.developer || props.state.clues.includes(c.id))).map(c => ({ id: c.id, title: c.title, subtitle: '人间百味 · 问过之后写下', note: undefined as string | undefined, asset: c.asset, ingredients: undefined as string[] | undefined, steps: undefined as string[] | undefined, text: entryText(c, props.state) })));
const spread = computed(() => spreads.value[page.value] ?? spreads.value[0]);
const animateInk = computed(() => ready.value && !skipWriting.value && spread.value?.id === writingId.value);
onMounted(async () => {
  const index = spreads.value.findIndex(s => s.id === props.newEntryId); if (index >= 0) page.value = index;
  await nextTick();
  if (!book.value) return;
  if (props.reducedMotion) { ready.value = true; emit('read'); return; }
  opening = gsap.timeline({ onComplete: () => { ready.value = true; emit('read'); } });
  opening.fromTo(book.value!, { opacity: .2, y: 18, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .4, ease: 'power2.out' });
  opening.fromTo(cover.value!, { rotationY: 0, opacity: 1 }, { rotationY: -170, opacity: 0, duration: .8, ease: 'power2.inOut' }, .16);
});
function changeTab(value: 'recipes' | 'life') { if (turning.value || value === 'life' && !canLife.value) return; tab.value = value; page.value = 0; skipWriting.value = false; }
function changePage(direction: number) {
  const target = props.developer && spreads.value.length ? (page.value + direction + spreads.value.length) % spreads.value.length : page.value + direction;
  if (turning.value || target < 0 || target >= spreads.value.length) return;
  if (props.reducedMotion) { page.value = target; return; }
  turning.value = true;
  turn = gsap.timeline({ onComplete: () => { turning.value = false; } });
  turn.set(leaf.value!, { opacity: 1, rotationY: direction > 0 ? 0 : -180 })
    .to(leaf.value!, { rotationY: direction > 0 ? -180 : 0, duration: .65, ease: 'power2.inOut' })
    .call(() => { page.value = target; skipWriting.value = false; }, [], .3)
    .set(leaf.value!, { opacity: 0 });
}
onBeforeUnmount(() => { opening?.kill(); turn?.kill(); });
</script>
<template>
  <div ref="book" class="journal-book" :class="{ 'journal-book--ready': ready, 'journal-book--still': reducedMotion }">
    <nav class="book-ribbons" aria-label="百味录内容"><button :aria-pressed="tab === 'recipes'" @click="changeTab('recipes')"><UiOrnament kind="bookmark" /><span>食谱</span></button><button v-if="canLife" :aria-pressed="tab === 'life'" @click="changeTab('life')"><UiOrnament kind="bookmark" /><span>人间百味</span></button></nav>
    <div class="book-spread" :key="`${tab}-${spread?.id}`"><div class="book-binding" aria-hidden="true"><i></i><i></i><i></i></div>
      <template v-if="spread">
        <section class="book-page book-page--left"><small class="book-page-kicker">{{ spread.subtitle }}</small><h2>{{ spread.title }}</h2><div v-if="spread.asset" class="recipe-illustration" :class="{ 'recipe-illustration--drawing': animateInk }"><AssetImage :asset="content.assets[spread.asset]!" /></div><p v-else class="book-quiet-note">把听到的话，<br />慢慢写在这里。</p><UiOrnament kind="divider" /><div v-if="spread.ingredients" class="recipe-ingredients"><small>备料</small><p v-for="(ingredient, i) in spread.ingredients" :key="ingredient"><HandwrittenText :text="ingredient" :animate="animateInk" :reduced-motion="reducedMotion" :delay=".12 + i * .16" /></p></div><UiOrnament kind="osmanthus" class="book-flower" /><span class="book-page-number">{{ String(page * 2 + 1).padStart(2, '0') }}</span></section>
        <section class="book-page book-page--right"><small class="book-page-kicker">{{ tab === 'recipes' ? '做法' : '这一次听到的事' }}</small><ol v-if="spread.steps" class="recipe-method"><li v-for="(step, i) in spread.steps" :key="step"><small>{{ ['一', '二', '三', '四', '五'][i] }}</small><HandwrittenText :text="step" :animate="animateInk" :reduced-motion="reducedMotion" :delay=".2 + i * .3" /></li></ol><p v-else class="life-manuscript"><HandwrittenText :text="spread.text" :animate="animateInk" :reduced-motion="reducedMotion" /></p><aside v-if="spread.note" class="recipe-margin-note"><small>页边小字</small><p><HandwrittenText :text="spread.note" :animate="animateInk" :reduced-motion="reducedMotion" :delay="1.1" /></p></aside><p v-if="animateInk && !reducedMotion" class="writing-skip"><button @click="skipWriting = true">直接看完</button></p><span class="book-page-number">{{ String(page * 2 + 2).padStart(2, '0') }}</span></section>
      </template>
      <div v-else class="book-empty"><h2>{{ tab === 'recipes' ? '先记下一味' : '留一页给遇见的人' }}</h2><p>{{ tab === 'recipes' ? '翻开奶奶的旧本子，看看第一页。' : '回到熟悉的地方，再和人聊聊。有些事，问过才能写。' }}</p></div>
    </div>
    <div ref="cover" v-show="!ready && !reducedMotion" class="book-opening-cover" aria-hidden="true"><span>百味录</span><small>长明巷食录</small></div>
    <div ref="leaf" class="book-turning-leaf" aria-hidden="true"></div>
    <footer class="book-pagination"><UiButton tone="quiet" :disabled="(!developer && page === 0) || !spreads.length || turning" aria-label="上一页" @click="changePage(-1)">←</UiButton><small>{{ spreads.length ? `${page + 1} / ${spreads.length}` : '尚未落笔' }}</small><UiButton tone="quiet" :disabled="(!developer && page >= spreads.length - 1) || !spreads.length || turning" aria-label="下一页" @click="changePage(1)">→</UiButton></footer>
  </div>
</template>
