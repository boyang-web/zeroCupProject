<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { content } from './content';
import type { Hotspot, MinigameResult } from './core/contracts';
import { matches } from './core/engine';
import { useGame } from './runtime/useGame';
import { useSettings } from './features/settings/useSettings';
import { createAmbience } from './infrastructure/audio';
import Modal from './shared/Modal.vue';
import SceneView from './features/exploration/SceneView.vue';
import InspectionView from './features/exploration/InspectionView.vue';
import Icon from './shared/Icon.vue';
import DialogueView from './features/dialogue/DialogueView.vue';
import MinigameHost from './features/minigames/MinigameHost.vue';
import JournalView from './features/journal/JournalView.vue';
import SaveManager from './features/saves/SaveManager.vue';
import WoodFrame from './presentation/WoodFrame.vue';
import { woodVariables } from './presentation/wood-theme';

// Browser APIs stay behind ports; domain modules can run in Node tests.
const storage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  removeItem: (key: string) => window.localStorage.removeItem(key),
};
const game = useGame(content, storage);
const { state, chapter, scene, node, ending, canTravel, message } = game;
const { hints, reducedMotion, volume } = useSettings(storage);
const ambience = createAmbience(content.assets.ambience!.url);
const audioMessage = ref('');
const themeStyle = woodVariables(content.assets);
const objectivesOpen = ref(false);
const fullscreen = ref(false);
function syncFullscreen() { fullscreen.value = !!document.fullscreenElement; }
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { message.value = '浏览器没有打开全屏；也可以按 F11。'; }
}
onMounted(() => { syncFullscreen(); document.addEventListener('fullscreenchange', syncFullscreen); });
watch(volume, async value => { audioMessage.value = await ambience.setVolume(value) ? '' : '请再次调整音量，浏览器需要一次操作来启用声音。'; });
type Panel = { kind: 'inspect'; hotspot: Hotspot } | { kind: 'minigame'; gameId: string }
  | { kind: 'journal' | 'saves' | 'settings' | 'restart' }
  | { kind: 'notice'; title: string; text: string };
const panel = ref<Panel | null>(null);
const title = computed(() => {
  if (node.value) return '巷中对话';
  const p = panel.value;
  if (!p) return '';
  if (p.kind === 'inspect') return p.hotspot.label;
  if (p.kind === 'minigame') return content.minigames.find(g => g.id === p.gameId)?.title ?? '物件操作';
  if (p.kind === 'notice') return p.title;
  return { journal: '百味录', saves: '存档与归途', settings: '游玩设置', restart: '重新启程' }[p.kind];
});
const inspect = computed(() => panel.value?.kind === 'inspect' && panel.value.hotspot.interaction.kind === 'inspect' ? panel.value.hotspot.interaction : undefined);
const minigame = computed(() => { const p = panel.value; return p?.kind === 'minigame' ? content.minigames.find(g => g.id === p.gameId) : undefined; });
const inspectActivity = computed(() => content.minigames.find(g => g.id === inspect.value?.activityId));
const inspectAsset = computed(() => {const p=panel.value;if(p?.kind!=='inspect'||!p.hotspot.sprite)return undefined;const variant=p.hotspot.variants?.find(v=>matches(state.value,v.condition));return content.assets[variant?.asset??p.hotspot.sprite.asset];});
const modalVariant = computed(() => node.value ? 'conversation' as const : panel.value?.kind === 'inspect' || panel.value?.kind === 'minigame' ? 'wide' as const : panel.value?.kind === 'journal' ? 'book' as const : 'default' as const);
const hasAuto = computed(() => { void game.saveRevision.value; const result = game.saves.read('auto'); return result.ok && !!result.value; });
function interact(hotspot: Hotspot) {
  const action = hotspot.interaction;
  if (action.kind === 'dialogue') game.dispatch({ type: 'talk', hotspotId: hotspot.id });
  if (action.kind === 'inspect') { panel.value = { kind: 'inspect', hotspot }; if (action.action && matches(state.value, action.action.condition)) game.dispatch({ type: 'inspect', hotspotId: hotspot.id }); }
  if (action.kind === 'minigame') {
    const definition = content.minigames.find(g => g.id === action.gameId)!;
    panel.value = matches(state.value, definition.condition) ? { kind: 'minigame', gameId: action.gameId } : { kind: 'notice', title: hotspot.label, text: definition.unavailable ?? '先把眼下的事说清楚。' };
  }
}
function useOption(actionId: string) {
  if (panel.value?.kind === 'inspect') game.dispatch({ type: 'interact', hotspotId: panel.value.hotspot.id, actionId });
}
function closeModal() {
  if (node.value) game.dispatch({ type: 'close-dialogue' });
  panel.value = null;
}
function finish(result: MinigameResult) {
  if (panel.value?.kind !== 'minigame') return;
  const definition = minigame.value;
  const changed = game.dispatch({ type: 'finish-minigame', gameId: panel.value.gameId, result });
  panel.value = result.status === 'completed' && changed ? { kind: 'notice', title: definition?.reward.label ?? '忙完了', text: definition?.reward.feedback ?? '这边已经收拾好了。' } : null;
}
function restart() { panel.value = null; game.newGame(); }
function requestStart() { if (hasAuto.value) panel.value = { kind: 'restart' }; else restart(); }
const region = ref<HTMLElement>(); let tween: gsap.core.Tween | undefined;
const discovery = ref<{ title: string; text: string }>(); let discoveryTimer: ReturnType<typeof setTimeout> | undefined;
watch(state, (next, previous) => {
  const achievement = content.achievements.find(a => next.achievements.includes(a.id) && !previous.achievements.includes(a.id));
  const clue = content.clues.find(c => next.clues.includes(c.id) && !previous.clues.includes(c.id));
  if (next.phase === 'title' || !achievement && !clue) return;
  discovery.value = achievement ? { title: achievement.title, text: '拾零' } : { title: clue!.title, text: '页边新记' };
  clearTimeout(discoveryTimer); discoveryTimer = setTimeout(() => { discovery.value = undefined; }, 4500);
});
watch([() => state.value.phase, () => state.value.chapterId, () => state.value.sceneId], async () => {
  await nextTick(); tween?.kill();
  if (region.value) tween = gsap.fromTo(region.value, { opacity: reducedMotion.value ? 1 : 0, y: reducedMotion.value ? 0 : 8 }, { opacity: 1, y: 0, duration: reducedMotion.value ? 0 : .45 });
});
onBeforeUnmount(() => { tween?.kill(); clearTimeout(discoveryTimer); ambience.dispose(); document.removeEventListener('fullscreenchange', syncFullscreen); });
</script>

<template>
  <div class="game-shell immersive" :class="{ 'reduced-motion': reducedMotion }" :style="themeStyle">
    <svg class="skin-filters" aria-hidden="true"><defs><filter id="wood-ui-alpha" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.1494" intercept="-0.1494" /></feComponentTransfer></filter></defs></svg>
    <header class="topbar">
      <a href="#" class="brand" @click.prevent="panel = { kind: 'journal' }"><span class="brand-seal">味</span><span>百味录<small>长明巷食录</small></span></a>
      <span class="build-note">秋日 · 长明巷</span>
      <nav class="toolbar" aria-label="游戏菜单"><button @click="panel = { kind: 'journal' }"><Icon name="book" /><span class="toolbar-label">随身手记</span><span v-if="state.clues.length" class="entry-count">{{ state.clues.length }}</span></button><button @click="panel = { kind: 'saves' }" aria-label="存读档"><Icon name="save" /><span class="toolbar-label">存读档</span></button><button @click="panel = { kind: 'settings' }" aria-label="游玩设置"><Icon name="settings" /><span class="toolbar-label">设置</span></button><button @click="toggleFullscreen" :aria-label="fullscreen ? '退出全屏' : '全屏'" :aria-pressed="fullscreen"><Icon name="fullscreen" /></button></nav>
    </header>

    <main ref="region">
      <section v-if="state.phase === 'title'" class="title-screen">
        <img class="title-background" :src="content.assets.courtyard!.url" alt="晨光落进祖母的桂花小院" fetchpriority="high" />
        <div class="title-copy"><p class="eyebrow"><span></span> 长明巷 · 秋</p><h1>归巷<span>桂花开了。<br />回来吃饭。</span></h1><p>信是十天前寄出的。<br />昨晚到家时，院门还虚掩着。<br />桌上那本书，你小时候就见过。</p><div class="button-row"><button class="primary" @click="requestStart">推开院门 <Icon name="arrow" /></button><button v-if="hasAuto" class="quiet" @click="game.load('auto')">接着读</button></div><small>清晨，七点过一点。</small></div>
        <span class="title-corner">人回来就行。<small>—— 祖母的信</small></span>
      </section>

      <template v-else>
        <nav class="chapter-track" aria-label="五章旅程"><span v-for="c in content.chapters" :key="c.id" :class="{ current: c.id === chapter.id, visited: state.visited.includes(c.id) }" :aria-current="c.id === chapter.id ? 'step' : undefined"><b>{{ String(c.number).padStart(2, '0') }}</b>{{ c.title }}</span></nav>
        <div v-if="state.phase === 'playing'" class="play-layout">
          <SceneView :chapter="chapter" :content="content" :state="state" :hints="hints" @interact="interact" @move="id => game.dispatch({ type: 'move', sceneId: id })" />
          <aside class="chapter-sidebar" :class="{ 'without-beats': !chapter.beats, expanded: objectivesOpen, ready: canTravel }"><WoodFrame kind="ui-toast" /><div class="objective"><button class="objective-toggle quiet" :aria-expanded="objectivesOpen" @click="objectivesOpen = !objectivesOpen"><Icon name="leaf" />手头的事 {{ objectivesOpen ? '−' : '+' }}</button><h1>{{ chapter.objective }}</h1><p v-if="objectivesOpen" class="chapter-intro">{{ scene.description }}</p></div>
            <ol v-if="chapter.beats && objectivesOpen" class="chapter-beats"><li v-for="(beat, i) in chapter.beats" :key="beat.label" :class="{ done: matches(state, beat.condition) }"><span><Icon v-if="matches(state, beat.condition)" name="check" /><template v-else>{{ i + 1 }}</template></span>{{ beat.label }}</li></ol>
            <div class="sidebar-bottom"><button class="primary travel-button" :disabled="!canTravel" @click="game.dispatch({ type: 'travel' })">{{ chapter.exitLabel ?? '往前走' }}<Icon name="arrow" /></button><small v-if="!canTravel">{{ chapter.exitHint }}</small><small v-else>可以走了，也可以再待一会儿。</small></div>
          </aside>
          <div class="scene-controls"><span><Icon name="pin" />{{ scene.title }}</span><span>停一会儿，看一看</span><button class="quiet" :aria-pressed="hints" @click="hints = !hints"><Icon name="look" />{{ hints ? '收起提示' : '显示提示' }}</button></div>
        </div>
        <section v-else class="ending-screen" :style="{ backgroundImage: `linear-gradient(90deg, #152a29ed, #152a29cc), url('${content.assets.street!.url}')` }"><p class="eyebrow">第五章 · {{ chapter.title }}</p><h1>{{ ending.title }}</h1><p class="ending-copy">{{ ending.text }}</p><div class="outcomes"><article v-for="c in content.chapters.filter(c => c.number > 1 && c.number < content.chapters.length)" :key="c.id"><small>{{ c.title }}</small><p>{{ state.quests[c.questId] === 'completed' ? '这一页写下了。' : '还有几行空着。' }}</p></article></div><div class="button-row"><button class="primary" @click="panel = { kind: 'journal' }">翻翻百味录</button><button @click="panel = { kind: 'saves' }">读档</button><button @click="panel = { kind: 'restart' }">再读一遍</button></div></section>
      </template>
    </main>
    <footer class="status-bar"><span>长明巷 · 百味录</span><p role="status" aria-live="polite">{{ message }}</p><span>{{ state.phase === 'title' ? '秋日' : `第 ${chapter.number} 章 / 共 ${content.chapters.length} 章` }}</span></footer>
    <Transition name="discovery"><div v-if="discovery && !node" class="discovery-toast" role="status"><WoodFrame kind="ui-toast" /><Icon name="leaf" /><div><small>{{ discovery.text }}</small><strong>{{ discovery.title }}</strong></div><button class="quiet" aria-label="收起发现提示" @click="discovery = undefined"><Icon name="close" /></button></div></Transition>

    <Modal v-if="node || panel" :title="title" :variant="modalVariant" @close="closeModal">
      <DialogueView v-if="node" :node="node" :state="state" :content="content" @choose="id => game.dispatch({ type: 'choose', choiceId: id })" />
      <InspectionView v-else-if="panel?.kind === 'inspect' && inspect" :inspection="inspect" :state="state" :activity="inspectActivity" :prop-asset="inspectAsset" @option="useOption" @activity="panel = { kind: 'minigame', gameId: inspectActivity!.id }" />
      <MinigameHost v-else-if="panel?.kind === 'minigame' && minigame" :definition="minigame" :state="state" :reduced-motion="reducedMotion" :assets="content.assets" @finish="finish" />
      <JournalView v-else-if="panel?.kind === 'journal'" :content="content" :state="state" />
      <SaveManager v-else-if="panel?.kind === 'saves'" :game="game" :content="content" @loaded="panel = null" />
      <template v-else-if="panel?.kind === 'settings'"><div class="settings-list"><label><span>显示物件名称</span><input v-model="hints" type="checkbox" /></label><label><span>减少动画</span><input v-model="reducedMotion" type="checkbox" /></label><label for="volume">环境声 <span>{{ Math.round(volume * 100) }}%</span></label><input id="volume" v-model.number="volume" type="range" min="0" max="1" step="0.05" /><button @click="ambience.setVolume(volume)">试听当前音量</button><p v-if="audioMessage" role="status">{{ audioMessage }}</p><p class="muted">操作：点击或触碰场景物件；Tab 切换目标，Enter 确认；Esc 关闭面板。小游戏可重试或请求协助。</p><button @click="panel = { kind: 'restart' }">重新开始旅程</button></div></template>
      <template v-else-if="panel?.kind === 'restart'"><p>重新开始会替换自动存档。已有手动档位和导出的文件保持原样。</p><div class="button-row"><button class="primary" @click="restart">确认重新开始</button><button @click="panel = null">取消</button></div></template>
      <template v-else-if="panel?.kind === 'notice'"><p>{{ panel.text }}</p><button class="primary" @click="panel = null">回去</button></template>
    </Modal>
  </div>
</template>
