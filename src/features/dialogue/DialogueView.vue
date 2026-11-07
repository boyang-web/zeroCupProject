<script setup lang="ts">
import type { DialogueNode, GameState, ContentPack } from '../../core/contracts.ts';
import { matches } from '../../core/engine.ts';
import Icon from '../../shared/Icon.vue';
import AssetImage from '../../shared/AssetImage.vue';
import { computed } from 'vue';
const props = defineProps<{ node: DialogueNode; state: GameState; content: ContentPack; developer?: boolean }>();
const portraitAsset = computed(() => {
  const asset=props.node.portrait?props.content.assets[props.node.portrait]:undefined;
  return asset;
});
const emit = defineEmits<{ choose: [id: string] }>();
const decisionAhead = computed(() => props.node.choices.some(c => c.decision && !props.state.decisions[c.decision]));
function conflict(state: GameState, decision: string | undefined, id: string) {
  return !!decision && !!state.decisions[decision] && state.decisions[decision] !== id;
}
</script>
<template>
  <div class="dialogue-layout" :class="{ 'has-portrait': portraitAsset }">
  <div v-if="portraitAsset" class="dialogue-portrait"><AssetImage :asset="portraitAsset" :alt="node.speaker" /></div>
  <div class="conversation" :class="{ 'with-portrait': node.portrait }" :key="node.id">
  <div class="speaker-row"><h3>{{ node.speaker }}</h3><span></span><small>巷里的话</small></div>
  <p v-if="node.direction" class="stage-direction">{{ node.direction }}</p>
  <div class="dialogue-text"><p v-for="(paragraph, index) in node.text.split('\n\n')" :key="index">{{ paragraph }}</p></div>
  <div class="choice-list conversation-choices">
    <div v-for="choice in node.choices" :key="choice.id">
      <button class="choice" :disabled="!developer && (!matches(state, choice.condition) || conflict(state, choice.decision, choice.id))" @click="emit('choose', choice.id)"><Icon name="arrow" /><span>{{ choice.label }}</span><span v-if="choice.decision" class="choice-mark">决定</span></button>
      <small v-if="!developer && conflict(state, choice.decision, choice.id)">这项决定已经发生；可读取之前的存档尝试其他选择。</small>
      <small v-else-if="!developer && !matches(state, choice.condition)">{{ choice.unavailable }}</small>
    </div>
  </div>
  <p v-if="decisionAhead && !developer" class="decision-guidance">选定后，这句话会留下记录。选择前的进度会单独保存，可以从菜单里读取。</p>
  </div>
  </div>
</template>
