<script setup lang="ts">
import { ref } from 'vue';
import type { Asset, Exhibit } from '../../core/contracts';
import AssetImage from '../../shared/AssetImage.vue';
const props = defineProps<{ kind: 'book' | 'flip' | 'unfold' | 'phone'; asset?: Asset; exhibit?: Exhibit }>();
const emit = defineEmits<{ examined: [] }>();
const opened = ref(false), examined = ref(false);
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
  <figure class="physical-object" :class="['physical-object--' + kind, { opened, 'physical-object--message': !!exhibit?.phone }]">
    <button type="button" class="physical-object__surface" :aria-label="kind === 'phone' ? '点亮或熄灭手机屏幕' : kind === 'book' ? '翻开或合上旧书' : kind === 'unfold' ? '展开或折起信纸' : '翻看物件正反面'" :aria-pressed="opened" @click="toggle" @pointerdown="downX = $event.clientX" @pointerup="pointerEnd">
      <template v-if="kind === 'phone'">
        <span class="physical-phone"><span class="phone-camera"></span><span v-if="opened" class="phone-screen"><small>{{ exhibit?.phone?.heading ?? '备忘录 · 草稿' }}</small><strong>{{ exhibit?.title }}</strong><span v-for="line in exhibit?.lines" :key="line">{{ line }}</span><small>{{ exhibit?.phone?.footer ?? '最近编辑：昨晚' }}</small></span><span v-else class="phone-asleep"><span>{{ exhibit?.phone?.time ?? '07:12' }}</span><small>长明巷 · 秋</small></span><span class="phone-home"></span></span>
      </template>
      <template v-else-if="kind === 'book'">
        <span class="physical-book__pages"><small>{{ exhibit?.kicker }}</small><strong>{{ exhibit?.lines[0] }}</strong><span v-for="line in exhibit?.lines.slice(1)" :key="line">{{ line }}</span></span>
        <span class="physical-book__cover"><span class="physical-book__title">{{ exhibit?.title ?? '百味录' }}</span><small>{{ exhibit?.kicker ?? '长明巷食录' }}</small></span>
      </template>
      <template v-else-if="kind === 'unfold'">
        <span class="physical-letter__sheet"><strong>{{ exhibit?.title }}</strong><span v-for="line in exhibit?.lines" :key="line">{{ line }}</span></span><span class="physical-letter__flap"></span><span class="physical-letter__front"></span>
      </template>
      <span v-else class="physical-card"><span class="physical-card__front"><AssetImage v-if="asset" :asset="asset" /></span><span class="physical-card__back"><small>{{ exhibit?.kicker }}</small><strong>{{ exhibit?.title }}</strong><span v-for="line in exhibit?.lines" :key="line">{{ line }}</span></span></span>
    </button>
    <figcaption>{{ kind === 'phone' ? (opened ? '再碰一下屏幕，把它放下。' : '碰一下，看看屏幕。') : kind === 'book' ? (opened ? '旧方子就在这一页。' : '碰一下封面，翻开看看。') : kind === 'unfold' ? (opened ? '信纸已经展开了。' : '碰一下信封，把信纸展开。') : (opened ? '背面的字也能看清了。' : '轻点或向一侧拖动，翻到背面。') }}</figcaption>
  </figure>
</template>
