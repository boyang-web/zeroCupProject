<script setup lang="ts">
import type { GuideStep } from '../../core/contracts';
import WoodFrame from '../../presentation/WoodFrame.vue';
import Icon from '../../shared/Icon.vue';
import UiButton from '../../shared/UiButton.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { placeGuide, type GuideRect } from '../../presentation/guide-layout';

const props = defineProps<{ guide: GuideStep; active: boolean; minimized: boolean; step: number; total: number; reducedMotion?: boolean }>();
const emit = defineEmits<{ minimize: [value: boolean] }>();
const card = ref<HTMLElement>();
const box = ref<GuideRect>(), placement = ref({ x: 24, y: 220, path: '' });
const id = useId().replace(/:/g, '') + '-guide';
const expanded = computed(() => props.active && !props.minimized);
let frame = 0, resize: ResizeObserver | undefined, movement: MutationObserver | undefined;
function measure() {
  frame = 0;
  if (!card.value || !expanded.value) return;
  let element = props.guide.control
    ? document.querySelector<HTMLButtonElement>(`[data-tutorial-control="${props.guide.control}"]`)
    : document.querySelector<HTMLButtonElement>(`.scene-world [data-guide-object="${CSS.escape(props.guide.target ?? '')}"]`);
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
  const rect = element?.getBoundingClientRect();
  box.value = rect && rect.width && rect.height ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : undefined;
  if (box.value) placement.value = placeGuide(box.value, { width: card.value.offsetWidth, height: card.value.offsetHeight }, { width: innerWidth, height: innerHeight });
}
function requestMeasure() { if (!frame) frame = requestAnimationFrame(measure); }
watch(expanded, async expanded => {
  if (!expanded) return;
  await nextTick(); requestMeasure();
});
onMounted(() => {
  resize = new ResizeObserver(requestMeasure); if (card.value) resize.observe(card.value);
  const world = document.querySelector('.scene-world');
  if (world) { resize.observe(world); movement = new MutationObserver(requestMeasure); movement.observe(world, { attributes: true, subtree: true, attributeFilter: ['style'] }); }
  window.addEventListener('resize', requestMeasure); window.addEventListener('scroll', requestMeasure, true); requestMeasure();
});
onBeforeUnmount(() => { cancelAnimationFrame(frame); resize?.disconnect(); movement?.disconnect(); window.removeEventListener('resize', requestMeasure); window.removeEventListener('scroll', requestMeasure, true); });
</script>
<template>
  <Transition name="tutorial-veil">
    <svg v-if="box && expanded" class="tutorial-pointer" aria-hidden="true">
      <defs>
        <radialGradient :id="id + '-feather'"><stop offset="0" stop-color="black" /><stop offset=".6" stop-color="black" /><stop offset="1" stop-color="white" /></radialGradient>
        <mask :id="id + '-light'"><rect width="100%" height="100%" fill="white" /><ellipse :cx="box.left + box.width / 2" :cy="box.top + box.height / 2" :rx="Math.max(box.width * .78, 70)" :ry="Math.max(box.height * .72, 60)" :fill="`url(#${id}-feather)`" /></mask>
        <marker :id="id + '-arrow'" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 1 1 L 7 5 L 1 9" fill="none" stroke="#f5ead3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></marker>
      </defs>
      <rect class="tutorial-shade" width="100%" height="100%" fill="#251d16" :opacity="guide.focus ? .42 : .2" :mask="`url(#${id}-light)`" />
      <path class="tutorial-thread" :d="placement.path" pathLength="1" fill="none" stroke="#f5ead3" stroke-width="1.35" stroke-linecap="round" :marker-end="`url(#${id}-arrow)`" />
    </svg>
  </Transition>
  <Transition name="tutorial-card">
    <aside v-show="expanded" ref="card" class="tutorial-window" :class="{ 'is-positioned': !!box }" :style="{ left: placement.x + 'px', top: placement.y + 'px' }" :inert="!expanded" :aria-hidden="!expanded" :aria-label="'操作教学：' + guide.title" :aria-describedby="guide.text ? id + '-text' : undefined" role="region">
      <WoodFrame kind="ui-menu" />
      <header><UiButton tone="quiet" aria-label="收起教学" title="收起后可以自由看看" @click="emit('minimize', true)">收起 <span aria-hidden="true">−</span></UiButton></header>
      <h3>{{ guide.title }}</h3>
      <p v-if="guide.text" :id="id + '-text'">{{ guide.text }}</p>
    </aside>
  </Transition>
  <Transition name="hud-reveal"><UiButton v-if="active && minimized" class="tutorial-restore" tone="paper" @click="emit('minimize', false)"><Icon name="leaf" />继续教学 <Icon name="arrow" /></UiButton></Transition>
</template>
