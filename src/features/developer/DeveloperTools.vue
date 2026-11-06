<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContentPack, GameState, Hotspot } from '../../core/contracts';
import { scenesOf } from '../../core/scenes';
import UiButton from '../../shared/UiButton.vue';

const props = defineProps<{ content: ContentPack; state: GameState }>();
const emit = defineEmits<{
  jump: [chapterId: string, sceneId: string];
  dialogue: [dialogueId: string, nodeId: string];
  game: [gameId: string];
  hotspot: [chapterId: string, sceneId: string, hotspot: Hotspot];
  panel: [kind: 'journal' | 'inventory' | 'collection' | 'revisit' | 'achievements' | 'saves' | 'settings'];
  reset: []; exit: [];
}>();
const section = ref('places'), search = ref('');
const sections = [{ id: 'places', label: '章节与场景' }, { id: 'objects', label: '人物与物件' }, { id: 'dialogues', label: '全部对白' }, { id: 'games', label: '小游戏' }, { id: 'systems', label: '功能面板' }];
const includes = (...values: string[]) => values.join(' ').toLowerCase().includes(search.value.trim().toLowerCase());
const places = computed(() => props.content.chapters.map(chapter => ({ chapter, scenes: scenesOf(chapter).filter(scene => includes(chapter.title, chapter.id, scene.title, scene.id)) })).filter(place => place.scenes.length));
const dialogues = computed(() => props.content.dialogues.flatMap(dialogue => dialogue.nodes.map(node => ({ dialogue, node }))).filter(({ dialogue, node }) => includes(dialogue.id, node.id, node.speaker, node.text)));
const games = computed(() => props.content.minigames.filter(game => includes(game.title, game.id, game.module)));
const objects = computed(() => props.content.chapters.flatMap(chapter => scenesOf(chapter).flatMap(scene => scene.hotspots.map(hotspot => ({ chapter, scene, hotspot })))).filter(({ chapter, scene, hotspot }) => includes(chapter.title, scene.title, hotspot.label, hotspot.id)));
const panels = [
  { id: 'journal', label: '百味录 · 全部食谱与人物页' }, { id: 'inventory', label: '随身物 · 全部道具' },
  { id: 'collection', label: '物件收藏 · 全部物件' }, { id: 'revisit', label: '回访老街' },
  { id: 'achievements', label: '拾零 · 全部条目' }, { id: 'saves', label: '测试存读档' }, { id: 'settings', label: '游玩设置' },
] as const;
</script>

<template>
  <section class="developer-tools" aria-label="开发者测试工具">
    <p class="developer-description">剧情前置、功能解锁和互斥选择已放开。可以直接跳到任意场景或对白节点；物件操作可以重复，数值奖励仍只发一次。</p>
    <p class="developer-location">当前位置：{{ content.chapters.find(c => c.id === state.chapterId)?.title }} / {{ state.sceneId }} <span>独立测试存档</span></p>
    <nav class="developer-tabs" aria-label="测试工具分类"><UiButton v-for="item in sections" :key="item.id" :tone="section === item.id ? 'jade' : 'paper'" :aria-pressed="section === item.id" @click="section = item.id">{{ item.label }}</UiButton></nav>
    <label v-if="section !== 'systems'" class="developer-search">筛选内容<input v-model="search" type="search" placeholder="搜索名称、对白或 ID" /></label>
    <div v-if="section === 'places'" class="developer-results">
      <article v-for="{ chapter, scenes } in places" :key="chapter.id" class="developer-card"><h3>第{{ chapter.number }}章 · {{ chapter.title }}</h3><div class="button-row"><UiButton v-for="scene in scenes" :key="scene.id" @click="emit('jump', chapter.id, scene.id)">{{ chapter.next ? scene.title : '查看结局' }}</UiButton></div><small>{{ chapter.id }}</small></article>
      <p v-if="!places.length" class="muted">没有匹配的场景。</p>
    </div>
    <div v-else-if="section === 'objects'" class="developer-results">
      <article v-for="{ chapter, scene, hotspot } in objects" :key="`${scene.id}/${hotspot.id}`" class="developer-card developer-node"><div><h3>{{ hotspot.label }}</h3><p>{{ chapter.title }} · {{ scene.title }}</p><small>{{ hotspot.id }}</small></div><UiButton :aria-label="`测试物件 ${scene.id}/${hotspot.id}`" @click="emit('hotspot', chapter.id, scene.id, hotspot)">测试交互</UiButton></article>
      <p v-if="!objects.length" class="muted">没有匹配的人物或物件。</p>
    </div>
    <div v-else-if="section === 'dialogues'" class="developer-results">
      <article v-for="{ dialogue, node } in dialogues" :key="`${dialogue.id}/${node.id}`" class="developer-card developer-node"><div><h3>{{ node.speaker }}</h3><p>{{ node.text.slice(0, 72) }}{{ node.text.length > 72 ? '…' : '' }}</p><small>{{ dialogue.id }} / {{ node.id }}</small></div><UiButton :aria-label="`测试对白 ${dialogue.id}/${node.id}`" @click="emit('dialogue', dialogue.id, node.id)">测试这段</UiButton></article>
      <p v-if="!dialogues.length" class="muted">没有匹配的对白。</p>
    </div>
    <div v-else-if="section === 'games'" class="developer-results">
      <article v-for="game in games" :key="game.id" class="developer-card developer-node"><div><h3>{{ game.title }}</h3><p>{{ game.description }}</p><small>{{ game.id }} / {{ game.module }}</small></div><UiButton @click="emit('game', game.id)">测试{{ game.title }}</UiButton></article>
      <p v-if="!games.length" class="muted">没有匹配的小游戏。</p>
    </div>
    <div v-else class="developer-panel-list"><UiButton v-for="item in panels" :key="item.id" @click="emit('panel', item.id)">{{ item.label }}</UiButton></div>
    <footer class="developer-actions"><UiButton @click="emit('reset')">清空测试进度并重测此处</UiButton><UiButton tone="jade" @click="emit('exit')">退出测试，恢复正常进度</UiButton></footer>
  </section>
</template>
