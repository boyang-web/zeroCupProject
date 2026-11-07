<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { content } from './content';
import type { FeatureId, Hotspot, MinigameResult } from './core/contracts';
import { matches } from './core/conditions';
import { currentGuide, featureUnlocked, isRevisiting } from './core/progression';
import { useGame } from './runtime/useGame';
import { useSettings } from './features/settings/useSettings';
import { createAmbience } from './infrastructure/audio';
import Modal from './shared/Modal.vue';
import UiButton from './shared/UiButton.vue';
import Icon from './shared/Icon.vue';
import SceneView from './features/exploration/SceneView.vue';
import InspectionView from './features/exploration/InspectionView.vue';
import GuideHint from './features/exploration/GuideHint.vue';
import RevisitView from './features/exploration/RevisitView.vue';
import TitleScreen from './features/title/TitleScreen.vue';
import DialogueView from './features/dialogue/DialogueView.vue';
import MinigameHost from './features/minigames/MinigameHost.vue';
import JournalView from './features/journal/JournalView.vue';
import CollectionView from './features/collection/CollectionView.vue';
import SaveManager from './features/saves/SaveManager.vue';
import WoodFrame from './presentation/WoodFrame.vue';
import { woodVariables } from './presentation/wood-theme';
import DeveloperTools from './features/developer/DeveloperTools.vue';
import { scenesOf } from './core/scenes';

const storage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  removeItem: (key: string) => window.localStorage.removeItem(key),
};
const game = useGame(content, storage);
const { state, chapter, scene, node, ending, canTravel, message, developer } = game;
const { hints, reducedMotion, volume } = useSettings(storage);
const ambience = createAmbience(content.assets.ambience!.url);
const themeStyle = { ...woodVariables(content.assets), '--journal-paper': `url("${content.assets['journal-paper']!.url}")` };
const audioMessage = ref(''), objectivesOpen = ref(false), fullscreen = ref(false), viewHome = ref(false), closeView = ref(false);
const showingHome = computed(() => state.value.phase === 'title' || viewHome.value);
const returning = computed(() => isRevisiting(state.value));
const returnSceneTitle = computed(() => { const anchor = content.chapters.find(c => c.id === state.value.journey.chapterId); return anchor && scenesOf(anchor).find(s => s.id === state.value.journey.sceneId)?.title; });
const unlocked = (id: FeatureId) => featureUnlocked(state.value, content, id, { developer: developer.value });
const homeAvailable = computed(() => unlocked('revisit') && state.value.phase === 'playing' && state.value.journey.chapterId !== 'arrival');
const allowed = (condition?: import('./core/contracts').Condition) => developer.value || matches(state.value, condition);
const guide = computed(() => developer.value ? undefined : currentGuide(state.value, content));
const recipeCount = computed(() => (content.recipes ?? []).filter(r => allowed(r.condition)).length);
const pendingEntry = ref<string>();
type Panel = { kind: 'inspect'; hotspot: Hotspot } | { kind: 'minigame'; gameId: string }
  | { kind: 'journal' | 'saves' | 'settings' | 'restart' | 'menu' | 'inventory' | 'collection' | 'revisit' | 'achievements' | 'developer' }
  | { kind: 'notice'; title: string; text: string };
const panel = ref<Panel | null>(null);
const title = computed(() => {
  if (node.value) return node.value.beats?.length ? '交谈' : node.value.speaker;
  const p = panel.value; if (!p) return '';
  if (p.kind === 'inspect') return p.hotspot.label;
  if (p.kind === 'minigame') return content.minigames.find(g => g.id === p.gameId)?.title ?? '动动手';
  if (p.kind === 'notice') return p.title;
  return { journal: '百味录', saves: developer.value ? '测试存读档' : '存读档', settings: '游玩设置', restart: '新的归途', menu: '歇一会儿', inventory: '随身物', collection: '物件收藏', revisit: '回访老街', achievements: '拾零', developer: '开发者测试工具' }[p.kind];
});
const inspect = computed(() => panel.value?.kind === 'inspect' && panel.value.hotspot.interaction.kind === 'inspect' ? panel.value.hotspot.interaction : undefined);
const minigame = computed(() => panel.value?.kind === 'minigame' ? content.minigames.find(g => g.id === (panel.value as { gameId: string }).gameId) : undefined);
const inspectActivity = computed(() => content.minigames.find(g => g.id === inspect.value?.activityId));
const inspectAsset = computed(() => { const p = panel.value; if (p?.kind !== 'inspect' || !p.hotspot.sprite) return undefined; const variant = p.hotspot.variants?.find(v => matches(state.value, v.condition)); return content.assets[variant?.asset ?? p.hotspot.sprite.asset]; });
const modalVariant = computed(() => node.value ? 'conversation' as const : panel.value?.kind === 'journal' ? 'book' as const : ['inspect', 'minigame', 'collection', 'developer'].includes(panel.value?.kind ?? '') ? 'wide' as const : 'default' as const);
const hasAuto = computed(() => { void game.saveRevision.value; const result = game.saves.read('auto'); return result.ok && !!result.value; });
const hasProgress = computed(() => hasAuto.value || state.value.phase !== 'title');
function openPanel(kind: 'journal' | 'inventory' | 'collection' | 'revisit' | 'menu' | 'saves' | 'settings' | 'achievements') {
  const required: Partial<Record<typeof kind, FeatureId>> = { journal: 'journal', inventory: 'inventory', collection: 'collection', revisit: 'revisit' };
  if (required[kind] && !unlocked(required[kind]!)) return;
  panel.value = { kind };
}
let homeBeforeTesting = false;
function developerTools() {
  if (!developer.value) {
    homeBeforeTesting = viewHome.value;
    game.setDeveloper(true);
  }
  if (node.value) game.dispatch({ type: 'close-dialogue' });
  viewHome.value = false; discovery.value = undefined; pendingEntry.value = undefined;
  panel.value = { kind: 'developer' };
}
function exitDeveloper() {
  panel.value = null; discovery.value = undefined; pendingEntry.value = undefined;
  game.setDeveloper(false); viewHome.value = homeBeforeTesting;
}
function debugJump(chapterId: string, sceneId?: string) {
  game.dispatch({ type: 'dev-jump', chapterId, sceneId });
  panel.value = null; viewHome.value = false; objectivesOpen.value = false;
}
function debugDialogue(dialogueId: string, nodeId: string) {
  game.dispatch({ type: 'dev-dialogue', dialogueId, nodeId }); panel.value = null;
}
function debugObject(chapterId: string, sceneId: string, hotspot: Hotspot) {
  debugJump(chapterId, sceneId); interact(hotspot);
}
function debugGame(gameId: string) {
  const definition = content.minigames.find(g => g.id === gameId);
  const target = content.chapters.find(c => c.id === definition?.chapterId);
  const location = target && scenesOf(target).find(s => s.hotspots.some(h => h.interaction.kind === 'minigame' ? h.interaction.gameId === gameId : h.interaction.kind === 'inspect' && h.interaction.activityId === gameId));
  if (!target || !location) return;
  debugJump(target.id, location.id); panel.value = { kind: 'minigame', gameId };
}
function resetTest() {
  const { chapterId, sceneId } = state.value;
  game.newGame(); debugJump(chapterId, sceneId);
}
function developerShortcut(event: KeyboardEvent) {
  if (event.key === 'F8') { event.preventDefault(); developerTools(); }
}
function interact(hotspot: Hotspot) {
  const action = hotspot.interaction;
  if (action.kind === 'dialogue') game.dispatch({ type: 'talk', hotspotId: hotspot.id });
  if (action.kind === 'inspect') {
    panel.value = { kind: 'inspect', hotspot };
    if (!action.manipulation && action.action && allowed(action.action.condition)) game.dispatch({ type: 'inspect', hotspotId: hotspot.id });
  }
  if (action.kind === 'minigame') {
    const definition = content.minigames.find(g => g.id === action.gameId)!;
    panel.value = allowed(definition.condition) ? { kind: 'minigame', gameId: action.gameId } : { kind: 'notice', title: hotspot.label, text: definition.unavailable ?? '先把眼下的事说清楚。' };
  }
}
function examined() { if (panel.value?.kind === 'inspect') game.dispatch({ type: 'inspect', hotspotId: panel.value.hotspot.id }); }
function useOption(actionId: string) { if (panel.value?.kind === 'inspect') game.dispatch({ type: 'interact', hotspotId: panel.value.hotspot.id, actionId }); }
function closeModal() { if (node.value) game.dispatch({ type: 'close-dialogue' }); panel.value = null; }
function finish(result: MinigameResult) {
  if (panel.value?.kind !== 'minigame') return;
  const definition = minigame.value;
  const changed = game.dispatch({ type: 'finish-minigame', gameId: panel.value.gameId, result });
  panel.value = result.status === 'completed' && changed ? { kind: 'notice', title: definition?.reward.label ?? '忙完了', text: definition?.reward.feedback ?? '这边收拾好了。' } : null;
}
function restart() { panel.value = null; viewHome.value = false; objectivesOpen.value = false; pendingEntry.value = undefined; game.newGame(); }
function requestStart() { if (hasProgress.value) panel.value = { kind: 'restart' }; else restart(); }
function continueStory() { if (state.value.phase !== 'title') viewHome.value = false; else if (game.load('auto')) viewHome.value = false; }
function travel() { panel.value = null; game.dispatch({ type: returning.value ? 'resume-journey' : 'travel' }); }
function revisit(id: string) { if (game.dispatch({ type: 'revisit', chapterId: id }) || developer.value) panel.value = null; }
function syncFullscreen() { fullscreen.value = !!document.fullscreenElement; }
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { message.value = '浏览器没有打开全屏，也可以继续在窗口里玩。'; }
}
onMounted(() => {
  syncFullscreen(); document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('keydown', developerShortcut);
  if (new URLSearchParams(window.location.search).get('dev') === '1') developerTools();
});
watch(volume, async value => { audioMessage.value = await ambience.setVolume(value) ? '' : '请再次调整音量，浏览器需要一次操作来启用声音。'; });
const region = ref<HTMLElement>(); let tween: gsap.core.Tween | undefined;
const discovery = ref<{ title: string; text: string; book?: boolean }>(); let discoveryTimer: ReturnType<typeof setTimeout> | undefined;
watch([state, developer], ([next, testing], [previous, wasTesting]) => {
  if (testing || testing !== wasTesting) return;
  const recipe = content.recipes?.find(r => matches(next, r.condition) && !matches(previous, r.condition));
  const life = content.clues.find(c => c.category === 'life' && next.clues.includes(c.id) && !previous.clues.includes(c.id));
  let notice: typeof discovery.value;
  if (recipe || life && featureUnlocked(next, content, 'lifeNotes')) {
    pendingEntry.value = recipe?.id ?? life!.id;
    notice = { title: recipe?.title ?? life!.title, text: recipe ? '食谱添了一页' : '人间百味有了新记', book: true };
  } else if (featureUnlocked(next, content, 'lifeNotes') && !featureUnlocked(previous, content, 'lifeNotes')) {
    notice = { title: '可以记下人的故事了', text: '百味录多了「人间百味」。也可以从菜单回访奶奶。', book: true };
  } else if (featureUnlocked(next, content, 'collection') && !featureUnlocked(previous, content, 'collection')) {
    notice = { title: '物件收藏已开放', text: '从菜单细看以前互动过的物件，找找没留意的地方。' };
  }
  if (next.phase === 'title' || !notice) return;
  discovery.value = notice; clearTimeout(discoveryTimer);
});
watch([panel, node, discovery], () => { clearTimeout(discoveryTimer); if (discovery.value && !panel.value && !node.value) discoveryTimer = setTimeout(() => { discovery.value = undefined; }, 7000); });
watch([showingHome, () => state.value.chapterId, () => state.value.sceneId], async () => {
  await nextTick(); tween?.kill();
  if (region.value && !showingHome.value) tween = gsap.fromTo(region.value, { opacity: reducedMotion.value ? 1 : 0 }, { opacity: 1, duration: reducedMotion.value ? 0 : .45 });
});
onBeforeUnmount(() => { tween?.kill(); clearTimeout(discoveryTimer); ambience.dispose(); document.removeEventListener('fullscreenchange', syncFullscreen); document.removeEventListener('keydown', developerShortcut); });
</script>

<template>
  <div class="game-shell immersive" :class="{ 'reduced-motion': reducedMotion, 'at-home': showingHome, 'developer-active': developer }" :style="themeStyle">
    <aside v-if="developer" class="developer-bar" aria-label="测试模式"><strong>开发者测试</strong><span>前置限制已放开</span><button @click="developerTools">测试工具 · F8</button><button @click="exitDeveloper">退出测试</button></aside>
    <header v-if="!showingHome" class="topbar">
      <span class="brand"><span class="brand-seal">味</span><span>百味录<small>{{ returning ? '回访 · ' : '' }}长明巷</small></span></span>
      <nav class="toolbar" aria-label="游戏菜单"><UiButton v-if="unlocked('journal')" data-tutorial-control="journal" :tone="pendingEntry ? 'jade' : 'paper'" @click="openPanel('journal')"><Icon name="book" />百味录<span class="entry-count">{{ recipeCount }}</span></UiButton><UiButton tone="wood" data-tutorial-control="menu" @click="openPanel('menu')"><Icon name="menu" /><span>菜单</span></UiButton></nav>
    </header>
    <main ref="region">
      <TitleScreen v-if="showingHome" :content="content" :has-save="hasProgress" :reduced-motion="reducedMotion" @start="requestStart" @continue="continueStory" @saves="openPanel('saves')" @settings="openPanel('settings')" />
      <template v-else>
        <nav v-if="unlocked('chapterTrack')" class="chapter-track" aria-label="旅程进度"><span v-for="c in content.chapters" :key="c.id" :class="{ current: c.id === state.journey.chapterId, visited: state.visited.includes(c.id) }" :aria-current="c.id === state.journey.chapterId ? 'step' : undefined"><b>{{ String(c.number).padStart(2, '0') }}</b><span v-if="c.id === state.journey.chapterId">{{ c.title }}</span></span></nav>
        <div v-if="state.phase === 'playing'" class="play-layout">
          <SceneView :developer="developer" :chapter="chapter" :content="content" :state="state" :hints="hints && unlocked('objectHints')" :guide-target="!panel && !node && !closeView ? guide?.target : undefined" :blocked="!!panel || !!node" :reduced-motion="reducedMotion" @framing="closeView = $event" @interact="interact" @move="id => game.dispatch({ type: 'move', sceneId: id })" @option="(hotspot, actionId) => game.dispatch({ type: 'interact', hotspotId: hotspot.id, actionId })" />
          <GuideHint v-if="guide && !panel && !node && !closeView" :key="guide.id" :guide="guide" :reduced-motion="reducedMotion" />
          <aside v-if="unlocked('inventory') || canTravel || returning" class="chapter-sidebar" :class="{ expanded: objectivesOpen, ready: canTravel || returning }"><WoodFrame kind="ui-toast" /><div class="objective"><button class="objective-toggle quiet" :aria-expanded="objectivesOpen" @click="objectivesOpen = !objectivesOpen"><Icon name="leaf" />{{ returning ? '回到熟悉的地方' : '手头的事' }} {{ objectivesOpen ? '−' : '+' }}</button><h1 v-if="objectivesOpen">{{ returning ? scene.description : chapter.objective }}</h1></div><ol v-if="chapter.beats && objectivesOpen && !returning" class="chapter-beats"><li v-for="(beat, i) in chapter.beats" :key="beat.label" :class="{ done: matches(state, beat.condition) }"><span><Icon v-if="matches(state, beat.condition)" name="check" /><template v-else>{{ i + 1 }}</template></span>{{ beat.label }}</li></ol><div v-if="canTravel || returning" class="sidebar-bottom"><UiButton tone="jade" data-tutorial-control="departure" @click="travel">{{ returning ? '回到原来的行程' : chapter.exitLabel ?? '往前走' }}<Icon name="arrow" /></UiButton></div></aside>
          <div class="scene-controls"><span><Icon name="pin" />{{ scene.title }}</span><UiButton v-if="homeAvailable" class="home-revisit" data-tutorial-control="home" tone="wood" @click="returning ? travel() : revisit('arrival')"><Icon name="pin" />{{ returning ? '回到' + (returnSceneTitle ?? '原行程') : '回奶奶家' }}</UiButton><UiButton v-if="unlocked('objectHints')" tone="quiet" :aria-pressed="hints" @click="hints = !hints"><Icon name="look" />{{ hints ? '收起提示' : '物件提示' }}</UiButton></div>
        </div>
        <section v-else class="ending-screen" :style="{ backgroundImage: `linear-gradient(90deg, #152a29ed, #152a29cc), url('${content.assets['title-homecoming']!.url}')` }"><p class="eyebrow">第五章 · {{ chapter.title }}</p><h1>{{ ending.title }}</h1><p class="ending-copy">{{ ending.text }}</p><div class="outcomes"><article v-for="c in content.chapters.filter(c => c.number > 1 && c.number < 5)" :key="c.id"><small>{{ c.title }}</small><p>{{ state.quests[c.questId] === 'completed' ? '这一页写下了。' : '还有几行空着。' }}</p></article></div><div class="button-row"><UiButton tone="jade" @click="openPanel('journal')">翻翻百味录</UiButton><UiButton v-if="unlocked('revisit')" @click="openPanel('revisit')">回访老街</UiButton><UiButton @click="openPanel('saves')">读档</UiButton><UiButton @click="viewHome = true">回到首页</UiButton></div></section>
      </template>
    </main>
    <footer v-if="!showingHome" class="status-bar"><span>长明巷</span><p role="status" aria-live="polite">{{ message }}</p><span>{{ developer ? '测试进度独立保存' : '进度自动保存' }}</span></footer>
    <Transition name="discovery"><aside v-if="discovery && !node && !panel && !showingHome" class="discovery-toast" role="status"><WoodFrame kind="ui-toast" /><Icon name="book" /><div><small>{{ discovery.text }}</small><strong>{{ discovery.title }}</strong><button v-if="discovery.book" class="quiet" @click="openPanel('journal'); discovery = undefined">翻开看看 →</button></div><UiButton tone="icon" aria-label="收起发现提示" @click="discovery = undefined"><Icon name="close" /></UiButton></aside></Transition>
    <Modal v-if="node || panel" :title="title" :variant="modalVariant" @close="closeModal">
      <template #actions><UiButton v-if="developer && panel?.kind !== 'developer'" tone="quiet" @click="developerTools">测试工具</UiButton></template>
      <DeveloperTools v-if="panel?.kind === 'developer'" :content="content" :state="state" @jump="debugJump" @dialogue="debugDialogue" @game="debugGame" @hotspot="debugObject" @panel="openPanel" @reset="resetTest" @exit="exitDeveloper" />
      <DialogueView :developer="developer" v-else-if="node" :key="state.dialogue!.id + ':' + node.id" :node="node" :state="state" :content="content" :reduced-motion="reducedMotion" @choose="id => game.dispatch({ type: 'choose', choiceId: id })" />
      <InspectionView :developer="developer" v-else-if="panel?.kind === 'inspect' && inspect" :key="panel.hotspot.id" :inspection="inspect" :state="state" :activity="inspectActivity" :prop-asset="inspectAsset" :journal-available="unlocked('journal')" :reduced-motion="reducedMotion" @examined="examined" @option="useOption" @journal="openPanel('journal')" @activity="panel = { kind: 'minigame', gameId: inspectActivity!.id }" />
      <MinigameHost :developer="developer" v-else-if="panel?.kind === 'minigame' && minigame" :definition="minigame" :state="state" :reduced-motion="reducedMotion" :assets="content.assets" @finish="finish" />
      <JournalView :developer="developer" v-else-if="panel?.kind === 'journal'" :content="content" :state="state" :reduced-motion="reducedMotion" :new-entry-id="pendingEntry" @read="pendingEntry = undefined" />
      <CollectionView :developer="developer" v-else-if="panel?.kind === 'collection'" :content="content" :state="state" @study="entryId => game.dispatch({ type: 'study-collection', entryId })" />
      <RevisitView :developer="developer" v-else-if="panel?.kind === 'revisit'" :content="content" :state="state" @revisit="revisit" @resume="travel" />
      <SaveManager v-else-if="panel?.kind === 'saves'" :game="game" :content="content" @loaded="panel = null; viewHome = false" />
      <div v-else-if="panel?.kind === 'menu'" class="pause-menu"><UiButton v-if="unlocked('journal')" @click="openPanel('journal')"><Icon name="book" />百味录</UiButton><UiButton v-if="unlocked('inventory')" @click="openPanel('inventory')"><Icon name="bag" />随身物</UiButton><UiButton v-if="unlocked('revisit')" @click="openPanel('revisit')"><Icon name="pin" />回访老街</UiButton><UiButton v-if="unlocked('collection')" @click="openPanel('collection')"><Icon name="collection" />物件收藏</UiButton><UiButton v-if="unlocked('lifeNotes')" @click="panel = { kind: 'achievements' }"><Icon name="leaf" />拾零</UiButton><UiButton @click="openPanel('saves')"><Icon name="save" />存读档</UiButton><UiButton @click="openPanel('settings')"><Icon name="settings" />设置</UiButton><UiButton tone="quiet" @click="panel = null; viewHome = true">回到首页</UiButton></div>
      <section v-else-if="panel?.kind === 'achievements'" class="entry-list"><article v-for="entry in content.achievements.filter(a => developer || state.achievements.includes(a.id))" :key="entry.id"><h3>{{ entry.title }}</h3><p>{{ entry.text }}</p><aside v-if="entry.annotation" class="annotation">{{ entry.annotation }}</aside></article></section>
      <div v-else-if="panel?.kind === 'inventory'" class="inventory-grid"><article v-for="item in content.items.filter(i => developer || (state.inventory[i.id] ?? 0) > 0)" :key="item.id"><span class="inventory-symbol">{{ item.icon }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
      <template v-else-if="panel?.kind === 'settings'"><div class="settings-list"><UiButton @click="developerTools">{{ developer ? '打开开发者测试工具' : '开启开发者测试模式' }}</UiButton><label v-if="unlocked('objectHints')"><span>物件提示</span><input v-model="hints" type="checkbox" /></label><label><span>减少动画</span><input v-model="reducedMotion" type="checkbox" /></label><label for="volume">环境声 <span>{{ Math.round(volume * 100) }}%</span></label><input id="volume" v-model.number="volume" type="range" min="0" max="1" step="0.05" /><p v-if="audioMessage" role="status">{{ audioMessage }}</p><UiButton @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏游玩' }}<Icon name="fullscreen" /></UiButton><p class="muted">点选、翻看场景里的物件。可以用 Tab 选择目标，Enter 确认，Esc 放下物件或结束交谈。茶具可以拖动，也能点开后移动。</p><UiButton v-if="!showingHome" tone="quiet" @click="panel = { kind: 'restart' }">重新开始旅程</UiButton></div></template>
      <template v-else-if="panel?.kind === 'restart'"><p>新的归途会替换自动存档。手动档位和导出的文件会保留。</p><div class="button-row"><UiButton tone="jade" @click="restart">开始新的故事</UiButton><UiButton @click="panel = null">先不重来</UiButton></div></template>
      <template v-else-if="panel?.kind === 'notice'"><p>{{ panel.text }}</p><UiButton tone="jade" @click="panel = null">回去</UiButton></template>
    </Modal>
  </div>
</template>
