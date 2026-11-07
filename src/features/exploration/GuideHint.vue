<script setup lang="ts">
import type { GuideStep } from '../../core/contracts';
import WoodFrame from '../../presentation/WoodFrame.vue';
import Icon from '../../shared/Icon.vue';
import UiButton from '../../shared/UiButton.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { placeGuide, type GuideRect } from '../../presentation/guide-layout';
import { useReadingSequence } from '../../presentation/useReadingSequence';
const props = defineProps<{ guide: GuideStep; reducedMotion?: boolean }>();
const card = ref<HTMLElement>(), minimized = ref(false), target = ref<HTMLButtonElement>();
const box = ref<GuideRect>(), placement = ref({ x: 24, y: 220, path: '' });
const id = useId().replace(/:/g, '') + '-guide';
const { visibleCounts, visibleActions, textDone, finishText } = useReadingSequence({ texts: () => [props.guide.text], actions: () => 1, reduced: () => props.reducedMotion });
let frame = 0, resize: ResizeObserver | undefined, movement: MutationObserver | undefined;
function measure() {
  frame = 0; if (!card.value || minimized.value) return;
  let element = props.guide.control ? document.querySelector<HTMLButtonElement>(`[data-tutorial-control="${props.guide.control}"]`) : document.querySelector<HTMLButtonElement>(`.scene-world [data-guide-object="${CSS.escape(props.guide.target ?? '')}"]`);
  const world = element?.getBoundingClientRect();
  if (props.guide.target && (!world || world.left < 8 || world.right > innerWidth - 8 || world.top < 70 || world.bottom > innerHeight - 28)) {
    const shortcut = document.querySelector<HTMLButtonElement>(`[data-guide-shortcut="${CSS.escape(props.guide.target)}"]`);
    if (shortcut && shortcut.getBoundingClientRect().height) {
      const nav = shortcut.parentElement!;
      const rect = shortcut.getBoundingClientRect(), bounds = nav.getBoundingClientRect();
      if (rect.left < bounds.left || rect.right > bounds.right) nav.scrollLeft = shortcut.offsetLeft - (nav.clientWidth - shortcut.offsetWidth) / 2;
      element = shortcut;
    }
  }
  target.value = element ?? undefined;
  const rect = element?.getBoundingClientRect();
  box.value = rect && rect.width && rect.height ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : undefined;
  if (box.value) placement.value = placeGuide(box.value, { width: card.value.offsetWidth, height: card.value.offsetHeight }, { width: innerWidth, height: innerHeight });
}
function requestMeasure() { if (!frame) frame = requestAnimationFrame(measure); }
function activate() { if (visibleActions.value) { target.value?.focus({ preventScroll: true }); target.value?.click(); } }
async function reopen() { minimized.value = false; await nextTick(); requestMeasure(); }
onMounted(() => {
  resize = new ResizeObserver(requestMeasure); if (card.value) resize.observe(card.value);
  const world = document.querySelector('.scene-world');
  if (world) { resize.observe(world); movement = new MutationObserver(requestMeasure); movement.observe(world, { attributes: true, subtree: true, attributeFilter: ['style'] }); }
  window.addEventListener('resize', requestMeasure); window.addEventListener('scroll', requestMeasure, true); requestMeasure();
});
onBeforeUnmount(() => { cancelAnimationFrame(frame); resize?.disconnect(); movement?.disconnect(); window.removeEventListener('resize', requestMeasure); window.removeEventListener('scroll', requestMeasure, true); });
</script>
<template>
  <svg v-if="box && !minimized" class="tutorial-pointer" aria-hidden="true">
    <defs><mask :id="id + '-cutout'"><rect width="100%" height="100%" fill="white" /><rect :x="box.left - 9" :y="box.top - 9" :width="box.width + 18" :height="box.height + 18" rx="4" fill="black" /></mask><marker :id="id + '-arrow'" markerWidth="14" markerHeight="14" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M 1 1 L 11 6 L 1 11 L 4 6 Z" fill="#93642f" stroke="#fff1ce" stroke-width="1.5" /></marker></defs>
    <rect width="100%" height="100%" fill="#302319" opacity=".25" :mask="`url(#${id}-cutout)`" />
    <rect :x="box.left - 7" :y="box.top - 7" :width="box.width + 14" :height="box.height + 14" rx="3" fill="none" stroke="#f2da97" stroke-width="1.5" />
    <path :d="placement.path" fill="none" stroke="#fff1ce" stroke-width="7" /><path :d="placement.path" fill="none" stroke="#93642f" stroke-width="2.5" :marker-end="`url(#${id}-arrow)`" />
  </svg>
  <aside v-show="!minimized" ref="card" class="tutorial-window" :style="{ left: placement.x + 'px', top: placement.y + 'px' }" :aria-label="'操作教学：' + guide.title" role="region">
    <WoodFrame kind="ui-menu" /><header><span><Icon name="look" />操作教学</span><UiButton tone="quiet" aria-label="收起教学" @click="minimized = true">稍后再看</UiButton></header>
    <h3>{{ guide.title }}</h3><p @click="finishText"><ProgressiveText :text="guide.text" :revealed="visibleCounts[0]" /></p>
    <div class="tutorial-actions"><UiButton v-if="!textDone" tone="quiet" aria-label="显示教学全文" @click="finishText">显示全文 ›</UiButton><UiButton v-else-if="target" class="reading-action" :class="{ 'is-ready': visibleActions > 0 }" tone="jade" @click="activate">现在试试 <Icon name="arrow" /></UiButton><small v-if="textDone && target">也可以直接点箭头指向的位置</small></div>
  </aside>
  <UiButton v-if="minimized" class="tutorial-restore" tone="paper" @click="reopen"><Icon name="look" />展开教学</UiButton>
</template>
