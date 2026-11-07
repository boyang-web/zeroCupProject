<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Asset, Exhibit } from '../../core/contracts';
import AssetImage from '../../shared/AssetImage.vue';
import ProgressiveText from '../../shared/ProgressiveText.vue';
import WoodFrame from '../../presentation/WoodFrame.vue';
import Icon from '../../shared/Icon.vue';
import { useReadingSequence } from '../../presentation/useReadingSequence';
const props = defineProps<{ kind: 'book' | 'flip' | 'unfold' | 'phone'; asset?: Asset; exhibit?: Exhibit; reducedMotion?: boolean }>();
const emit = defineEmits<{ examined: [] }>();
const opened = ref(false), examined = ref(false);
const { visibleCounts, textDone, finishText } = useReadingSequence({ texts: () => opened.value ? props.exhibit?.lines ?? [] : [], reduced: () => props.reducedMotion, lead: 420 });
const instruction = computed(() => props.kind === 'phone' ? '点一下屏幕，看看里面的字。' : props.kind === 'book' ? '点一下封面，把旧书翻开。' : props.kind === 'unfold' ? '点一下信封，把信纸展开。' : '点一下物件，或向一侧拖动，翻到背面。');
let downX = 0, dragged = false;
function toggle() {
  if (dragged) { dragged = false; return; }
  opened.value = !opened.value;
  if (opened.value && !examined.value) { examined.value = true; emit('examined'); }
}
function pointerEnd(event: PointerEvent) {
  if (Math.abs(event.clientX-downX) > 35) { toggle(); dragged = true; }
}
</script>
<template>
  <figure class="physical-object" :class="['physical-object--' + kind, { opened }]">
    <button type="button" class="physical-object__surface" :aria-label="kind === 'phone' ? '点亮或熄灭手机屏幕' : kind === 'book' ? '翻开或合上旧书' : kind === 'unfold' ? '展开或折起信纸' : '翻看物件正反面'" :aria-pressed="opened" @click="toggle" @pointerdown="downX = $event.clientX" @pointerup="pointerEnd">
      <template v-if="kind === 'phone'">
        <span class="physical-phone"><span class="phone-camera"></span><span v-if="opened" class="phone-screen"><small>{{ exhibit?.kicker ?? '备忘录 · 草稿' }}</small><strong>{{ exhibit?.title }}</strong><span v-for="(line, i) in exhibit?.lines" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i] ?? 0" /></span><small>{{ exhibit?.footer ?? '最近编辑：昨晚' }}</small></span><span v-else class="phone-asleep"><span>轻触点亮</span><small>长明巷 · 秋</small></span><span class="phone-home"></span></span>
      </template>
      <template v-else-if="kind === 'book'">
        <span class="physical-book__pages" :aria-hidden="!opened"><small>{{ exhibit?.kicker }}</small><strong v-if="exhibit?.lines[0]"><ProgressiveText :text="exhibit.lines[0]" :revealed="visibleCounts[0] ?? 0" /></strong><span v-for="(line, i) in exhibit?.lines.slice(1)" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i + 1] ?? 0" /></span></span>
        <span class="physical-book__cover"><span class="physical-book__title">{{ exhibit?.title ?? '百味录' }}</span><small>{{ exhibit?.kicker ?? '长明巷食录' }}</small></span>
      </template>
      <template v-else-if="kind === 'unfold'">
        <span class="physical-letter__sheet" :aria-hidden="!opened"><strong>{{ exhibit?.title }}</strong><span v-for="(line, i) in exhibit?.lines" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i] ?? 0" /></span></span><span class="physical-letter__flap"></span><span class="physical-letter__front"></span>
      </template>
      <span v-else class="physical-card"><span class="physical-card__front" :aria-hidden="opened"><AssetImage v-if="asset" :asset="asset" /></span><span class="physical-card__back" :aria-hidden="!opened"><small>{{ exhibit?.kicker }}</small><strong>{{ exhibit?.title }}</strong><span v-for="(line, i) in exhibit?.lines" :key="line"><ProgressiveText :text="line" :revealed="visibleCounts[i] ?? 0" /></span></span></span>
    </button>
    <figcaption v-if="!examined" class="physical-lesson"><WoodFrame kind="ui-toast" /><Icon name="arrow" />{{ instruction }}</figcaption>
    <figcaption v-else-if="opened && !textDone"><button type="button" class="quiet physical-read-all" @click="finishText">显示物件上的全文 ›</button></figcaption>
    <figcaption v-else>{{ opened ? '再点一下，可以合上。' : instruction }}</figcaption>
  </figure>
</template>
