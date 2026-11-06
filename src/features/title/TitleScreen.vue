<script setup lang="ts">
import type { ContentPack } from '../../core/contracts';
import UiButton from '../../shared/UiButton.vue';
import UiOrnament from '../../presentation/UiOrnament.vue';
import Icon from '../../shared/Icon.vue';
defineProps<{ content: ContentPack; hasSave: boolean; reducedMotion: boolean }>();
defineEmits<{ start: []; continue: []; saves: []; settings: [] }>();
</script>
<template>
  <section class="home-screen" :class="{ 'home-screen--still': reducedMotion }" aria-label="百味录首页">
    <img class="home-art" :src="content.assets['title-homecoming']!.url" alt="木门内放着旧食谱与茶，门外是桂花树下的长明巷" fetchpriority="high" decoding="async" />
    <div class="home-shade" aria-hidden="true"></div>
    <div class="home-content">
      <p class="home-place"><span></span> 长明巷 · 秋 <span></span></p>
      <h1 class="home-name" aria-label="百味录"><span v-for="(char, i) in ['百', '味', '录']" :key="char" aria-hidden="true" :style="{ '--letter-delay': `${.32 + i * .18}s` }">{{ char }}</span><small class="home-seal" aria-hidden="true">食<br />录</small></h1>
      <UiOrnament class="home-divider" kind="divider" />
      <nav class="home-menu" aria-label="开始游戏">
        <UiButton v-if="hasSave" tone="jade" @click="$emit('continue')">继续故事<Icon name="arrow" /></UiButton>
        <UiButton :tone="hasSave ? 'paper' : 'jade'" @click="$emit('start')">{{ hasSave ? '新的归途' : '开始故事' }}<Icon name="arrow" /></UiButton>
        <div class="home-secondary"><UiButton tone="quiet" @click="$emit('saves')">存读档</UiButton><UiButton tone="quiet" @click="$emit('settings')">设置</UiButton></div>
      </nav>
    </div>
    <UiOrnament class="home-sprig" kind="osmanthus" />
    <div class="home-grain" aria-hidden="true"></div>
    <small class="home-colophon">一卷食谱 · 长明巷人家</small>
  </section>
</template>
