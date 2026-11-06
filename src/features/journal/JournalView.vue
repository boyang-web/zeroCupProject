<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ContentPack, GameState } from '../../core/contracts.ts';
const props = defineProps<{ content: ContentPack; state: GameState }>();
const commitments = computed(() => props.content.dialogues.flatMap(d => d.nodes.flatMap(n => n.choices)).filter(c => c.decision && props.state.decisions[c.decision] === c.id));
const tab = ref('clues');
const tabs = [{ id: 'clues', label: '页记' }, { id: 'items', label: '随身物' }, { id: 'quests', label: '未完的事' }, { id: 'achievements', label: '拾零' }];
const statuses = { active: '未完', completed: '已记下', failed: '暂搁' };
</script>
<template>
  <nav class="tabs" aria-label="百味录分类"><button v-for="t in tabs" :key="t.id" :aria-pressed="tab === t.id" @click="tab = t.id">{{ t.label }}</button></nav>
  <section v-if="tab === 'clues'" class="entry-list">
    <p v-if="!state.clues.length" class="muted">这一页还空着。</p>
    <article v-for="entry in content.clues.filter(e => state.clues.includes(e.id))" :key="entry.id"><h3>{{ entry.title }}</h3><p>{{ entry.text }}</p></article>
    <aside v-for="a in content.achievements.filter(a => a.annotation && state.achievements.includes(a.id))" :key="a.id" class="annotation">{{ a.annotation }}</aside>
  </section>
  <section v-else-if="tab === 'items'" class="entry-list"><p v-if="!Object.values(state.inventory).some(n => n > 0)" class="muted">行囊里还没有可用物件。</p><article v-for="item in content.items.filter(i => (state.inventory[i.id] ?? 0) > 0)" :key="item.id"><h3>{{ item.icon }} · {{ item.title }} × {{ state.inventory[item.id] }}</h3><p>{{ item.text }}</p></article></section>
  <section v-else-if="tab === 'quests'" class="entry-list">
    <aside v-if="commitments.length" class="recorded-choices"><span class="eyebrow">说过的话</span><p v-for="choice in commitments" :key="choice.id">“{{ choice.label }}”</p></aside>
    <article v-for="quest in content.quests.filter(q => state.quests[q.id])" :key="quest.id"><h3>{{ quest.title }} <small>{{ statuses[state.quests[quest.id] ?? 'active'] }}</small></h3><p>{{ quest.text }}</p></article>
    <aside class="annotation"><p v-for="m in content.metrics.filter(m => (state.metrics[m.id] ?? 0) > 0)" :key="m.id">{{ m.title }} {{ state.metrics[m.id] }}</p></aside>
  </section>
  <section v-else class="entry-list"><p v-if="!state.achievements.length" class="muted">还没夹进什么。</p><article v-for="a in content.achievements.filter(a => state.achievements.includes(a.id))" :key="a.id"><h3>{{ a.title }}</h3><p>{{ a.text }}</p></article></section>
</template>
