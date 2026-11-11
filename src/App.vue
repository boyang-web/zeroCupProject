<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { content } from './content';
import { epilogueRecords } from './content/epilogue-records';
import type { FeatureId, Hotspot, MinigameResult } from './core/contracts';
import { matches } from './core/conditions';
import { currentGuide, featureUnlocked, isRevisiting } from './core/progression';
import { useGame } from './runtime/useGame';
import { useSettings } from './features/settings/useSettings';
import { createSoundscape, type SoundEffect } from './infrastructure/soundscape';
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
import InventoryView from './features/collection/InventoryView.vue';
import SaveManager from './features/saves/SaveManager.vue';
import WoodFrame from './presentation/WoodFrame.vue';
import { woodVariables } from './presentation/wood-theme';
import DeveloperTools from './features/developer/DeveloperTools.vue';
import { scenesOf } from './core/scenes';
import { useTutorialPresentation } from './presentation/useTutorialPresentation';
import GameDock from './features/exploration/GameDock.vue';
import SceneNavigation from './features/exploration/SceneNavigation.vue';
import SceneResponse from './presentation/SceneResponse.vue';
import {sceneRoutes,type SceneRoute} from './presentation/scene-routes';
import {directObjectAction} from './presentation/object-actions';
import {journalActivity as pendingJournalActivity} from './presentation/journal-activity';
import {sceneMusic,objectSound} from './presentation/sound-cues';
import { resetLocalSaves } from './infrastructure/local-save-reset';
import { dialogueChoicesOnly } from './presentation/dialogue-readings';
import { discoveryNotice } from './presentation/discovery-notice';

const storage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  removeItem: (key: string) => window.localStorage.removeItem(key),
};
let resetError = '';
try { resetLocalSaves(storage, content.id, window.location.hostname, import.meta.env.VITE_LOCAL_SAVE_RESET); }
catch { resetError = '旧存档清理失败，浏览器未允许修改本地存储。'; }
const game = useGame(content, storage);
if (resetError) game.message.value = resetError;
const { state, chapter, scene, node, ending, canTravel, message, developer } = game;
const { reducedMotion, musicVolume,effectsVolume,muted } = useSettings(storage);
const soundscape=createSoundscape({
  music:{home:content.assets['music-home']!.url,day:content.assets['music-day']!.url,night:content.assets['music-night']!.url},
  effects:{wood:content.assets['sfx-wood']!.url,paper:content.assets['sfx-paper']!.url,cup:content.assets['sfx-cup']!.url,door:content.assets['sfx-door']!.url},
});
const themeStyle = { ...woodVariables(content.assets, document.baseURI), '--journal-paper': `url("${new URL(content.assets['journal-paper']!.url, document.baseURI).href}")` };
const audioMessage = ref(''), objectivesOpen = ref(false), fullscreen = ref(false), viewHome = ref(false), closeView = ref(false);
const introActive = ref(false);
const showingHome = computed(() => state.value.phase === 'title' || viewHome.value);
const returning = computed(() => isRevisiting(state.value));
const unlocked = (id: FeatureId) => featureUnlocked(state.value, content, id, { developer: developer.value });
const homeAvailable = computed(() => unlocked('revisit') && state.value.phase === 'playing' && state.value.journey.chapterId !== 'arrival' && state.value.chapterId !== 'epilogue');
const allowed = (condition?: import('./core/contracts').Condition) => developer.value || matches(state.value, condition);
const guide = computed(() => developer.value ? undefined : currentGuide(state.value, content));
const pendingEntry = ref<string>();
type Panel = { kind: 'inspect'; hotspot: Hotspot } | { kind: 'minigame'; gameId: string }
  | { kind: 'journal' | 'saves' | 'settings' | 'restart' | 'replay-chapter' | 'menu' | 'inventory' | 'collection' | 'revisit' | 'achievements' | 'developer' }
  | { kind: 'notice'; title: string; text: string };
const panel = ref<Panel | null>(null);
const replayConfirmation = ref<HTMLElement>();
const sceneRevision = ref(0);
const dialogueReader=ref<InstanceType<typeof DialogueView>>();
const inspectionReader=ref<InstanceType<typeof InspectionView>>();
const collectionReader=ref<InstanceType<typeof CollectionView>>(),inventoryReader=ref<InstanceType<typeof InventoryView>>();
const journalSource=ref<Hotspot>(),journalBookmarks=ref(false);
const response=ref<{title:string;text:string;key:number}>();
const routes=computed(()=>sceneRoutes(state.value,content,{canTravel:canTravel.value,home:homeAvailable.value,developer:developer.value}));
const dockTools=computed(()=>{
  const tools:{id:string;label:string;icon:string;control?:string;active?:boolean;attention?:boolean}[]=[];
  if(!guideChrome.value&&(unlocked('inventory')||canTravel.value||returning.value))tools.push({id:'objectives',label:'手头的事',icon:'leaf',active:objectivesOpen.value});
  if(guideChrome.value!=='minimal'&&unlocked('journal'))tools.push({id:'journal',label:'百味录',icon:'book',control:'journal',attention:!!pendingEntry.value});
  if(!guideChrome.value&&unlocked('inventory'))tools.push({id:'inventory',label:'随身物品',icon:'bag'});
  if(!guideChrome.value&&unlocked('revisit'))tools.push({id:'revisit',label:'走访',icon:'pin'});
  tools.push({id:'menu',label:'菜单',icon:'menu',control:'menu'});return tools;
});
const journalActivity=computed(()=>pendingJournalActivity(state.value,content,developer.value));
const journalContext=computed(()=>{const i=journalSource.value?.interaction;if(i?.kind!=='inspect')return;return i.versions?.find(v=>matches(state.value,v.condition))?.text??i.text;});
function activateDock(id:string){response.value=undefined;if(id==='objectives'){objectivesOpen.value=!objectivesOpen.value;return;}if(['journal','inventory','revisit','menu'].includes(id))openPanel(id as 'journal'|'inventory'|'revisit'|'menu');}
function followRoute(route:SceneRoute){if(panel.value||node.value||guideFocused.value||closeView.value||route.disabled)return;response.value=undefined;objectivesOpen.value=false;if(route.kind==='move')moveScene(route.sceneId!);else if(route.kind==='home')revisit('arrival');else travel();}
function advanceReading(){if(node.value)dialogueReader.value?.advanceReading();else inspectionReader.value?.advanceReading();}
watch([panel,node],()=>{if(panel.value||node.value)response.value=undefined;});
const { presented: presentedGuide, minimized: guideMinimized, visible: guideVisible, focused: guideFocused, chrome: guideChrome, allowsObject } = useTutorialPresentation({
  guide: () => guide.value,
  suspended: () => !!panel.value || !!node.value || closeView.value,
  inactive: () => showingHome.value || developer.value || state.value.phase !== 'playing',
});
const guideSteps = computed(() => content.progression?.guides.filter(step => step.chapterId === presentedGuide.value?.chapterId) ?? []);
const guideIndex = computed(() => guideSteps.value.findIndex(step => step.id === presentedGuide.value?.id));
const title = computed(() => {
  if (node.value) return node.value.beats?.length ? '交谈' : node.value.speaker;
  const p = panel.value; if (!p) return '';
  if (p.kind === 'inspect') return p.hotspot.label;
  if (p.kind === 'minigame') return content.minigames.find(g => g.id === p.gameId)?.title ?? '动动手';
  if (p.kind === 'notice') return p.title;
  return { journal: '百味录', saves: developer.value ? '测试存读档' : '存读档', settings: '游玩设置', restart: '新的归途', 'replay-chapter': '重玩该章节', menu: '歇一会儿', inventory: '随身物', collection: '图鉴', revisit: '回访老街', achievements: '拾零', developer: '开发者测试工具' }[p.kind];
});
const inspect = computed(() => panel.value?.kind === 'inspect' && panel.value.hotspot.interaction.kind === 'inspect' ? panel.value.hotspot.interaction : undefined);
const minigame = computed(() => panel.value?.kind === 'minigame' ? content.minigames.find(g => g.id === (panel.value as { gameId: string }).gameId) : undefined);
const inspectContents = computed(() => scene.value.hotspots.filter(h => inspect.value?.contents?.includes(h.id)));
const containingBook = computed(() => panel.value?.kind === 'inspect' ? scene.value.hotspots.find(h => h.interaction.kind === 'inspect' && h.interaction.contents?.includes((panel.value as { hotspot: Hotspot }).hotspot.id)) : undefined);
function openContainedObject(id: string) {
  const h = inspectContents.value.find(h => h.id === id);
  if (h && allowed(h.condition)) panel.value = { kind: 'inspect', hotspot: h };
}
const inspectActivity = computed(() => content.minigames.find(g => g.id === inspect.value?.activityId));
const inspectAsset = computed(() => { const p = panel.value; if (p?.kind !== 'inspect' || !p.hotspot.sprite) return undefined; const variant = p.hotspot.variants?.find(v => matches(state.value, v.condition)); return content.assets[variant?.asset ?? p.hotspot.sprite.asset]; });
const modalVariant = computed(() => node.value ? 'conversation' as const : panel.value?.kind === 'journal' ? 'book' as const : ['inspect', 'minigame', 'collection', 'inventory', 'developer'].includes(panel.value?.kind ?? '') ? 'wide' as const : 'default' as const);
const hasAuto = computed(() => { void game.saveRevision.value; const result = game.saves.read('auto'); return result.ok && !!result.value; });
const hasProgress = computed(() => hasAuto.value || state.value.phase !== 'title');
function openPanel(kind: 'journal' | 'inventory' | 'collection' | 'revisit' | 'menu' | 'saves' | 'settings' | 'achievements') {
  const required: Partial<Record<typeof kind, FeatureId>> = { journal: 'journal', inventory: 'inventory', collection: 'collection', revisit: 'revisit' };
  if (required[kind] && !unlocked(required[kind]!)) return;
  response.value=undefined;objectivesOpen.value=false;
  if(kind==='journal'){journalSource.value=undefined;journalBookmarks.value=!!journalActivity.value;}
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
  if (!allowsObject(hotspot.id) || panel.value || node.value) return;
  response.value=undefined;objectivesOpen.value=false;
  const action = hotspot.interaction;
  const direct=directObjectAction(hotspot,state.value,developer.value);
  if(direct){if(game.dispatch({type:'interact',hotspotId:hotspot.id,actionId:direct.id})&&direct.feedback)response.value={title:hotspot.label,text:direct.feedback,key:Date.now()};return;}
  if (action.kind === 'dialogue') game.dispatch({ type: 'talk', hotspotId: hotspot.id });
  if (action.kind === 'inspect') {
    if(action.journalLink){
      const known=!!action.action&&state.value.rewards.includes(action.action.onceKey??action.action.id);
      journalSource.value=hotspot;journalBookmarks.value=known&&!state.value.flags.includes('arrival-packed');
      panel.value={kind:'journal'};game.dispatch({type:'inspect',hotspotId:hotspot.id});return;
    }
    panel.value = { kind: 'inspect', hotspot };
    if (hotspot.id !== 'epilogue-morning' && !action.manipulation && action.action && allowed(action.action.condition)) game.dispatch({ type: 'inspect', hotspotId: hotspot.id });
  }
  if (action.kind === 'minigame') {
    const definition = content.minigames.find(g => g.id === action.gameId)!;
    panel.value = allowed(definition.condition) ? { kind: 'minigame', gameId: action.gameId } : { kind: 'notice', title: hotspot.label, text: definition.unavailable ?? '先把眼下的事说清楚。' };
  }
}
function sceneOption(hotspot: Hotspot, actionId: string) {
  if(!allowsObject(hotspot.id)||panel.value||node.value)return;
  if(game.dispatch({type:'interact',hotspotId:hotspot.id,actionId})&&hotspot.interaction.kind==='inspect'){
    void soundscape.play(objectSound(hotspot));const action=hotspot.interaction.options?.find(a=>a.id===actionId);if(action?.feedback)response.value={title:hotspot.label,text:action.feedback,key:Date.now()};
  }
}
function moveScene(sceneId: string) { if (!guideFocused.value && !panel.value && !node.value) game.dispatch({ type: 'move', sceneId }); }
function examined() { if (panel.value?.kind === 'inspect') game.dispatch({ type: 'inspect', hotspotId: panel.value.hotspot.id }); }
function completeInspection() {
  if (panel.value?.kind !== 'inspect' || panel.value.hotspot.id !== 'epilogue-morning') return;
  game.dispatch({ type: 'inspect', hotspotId: panel.value.hotspot.id });
  if (canTravel.value) travel();
}
function useOption(actionId:string){
 if(panel.value?.kind!=='inspect')return;const h=panel.value.hotspot;if(h.interaction.kind!=='inspect')return;const i=h.interaction,action=i.options?.find(a=>a.id===actionId);
 if(!game.dispatch({type:'interact',hotspotId:h.id,actionId}))return;
 const remaining=i.options?.some(a=>!state.value.rewards.includes(a.onceKey??a.id)&&allowed(a.condition));
 if(!remaining&&!i.activityId&&!i.journalLink){panel.value=null;if(action?.feedback)response.value={title:h.label,text:action.feedback,key:Date.now()};}
}
function closeModal() { if(collectionReader.value?.closeObject()||inventoryReader.value?.closeObject())return; if (panel.value?.kind === 'replay-chapter') { panel.value = { kind: 'settings' }; return; } if (node.value) game.dispatch({ type: 'close-dialogue' }); panel.value = null; }
function choose(choiceId: string) {
  const activityId = node.value?.choices.find(choice => choice.id === choiceId)?.activityId;
  if (game.dispatch({ type: 'choose', choiceId }) && activityId) panel.value = { kind: 'minigame', gameId: activityId };
}
function settleActivity(gameId:string,result:MinigameResult){
 const definition=content.minigames.find(g=>g.id===gameId);const changed=game.dispatch({type:'finish-minigame',gameId,result});panel.value=null;
 if(result.status==='completed'&&changed&&definition?.reward.feedback)response.value={title:definition.reward.label,text:definition.reward.feedback,key:Date.now()};
}
function finish(result:MinigameResult){if(panel.value?.kind==='minigame')settleActivity(panel.value.gameId,result);}
function finishJournal(result:MinigameResult){if(journalActivity.value)settleActivity(journalActivity.value.id,result);}
function restart() { panel.value = null; viewHome.value = false; objectivesOpen.value = false; pendingEntry.value = undefined; game.newGame(); }
async function requestChapterReplay() {
  panel.value = { kind: 'replay-chapter' };
  await nextTick();
  replayConfirmation.value?.querySelector<HTMLButtonElement>('button')?.focus();
}
function replayChapter() {
  if (!game.dispatch({ type: 'replay-chapter' })) return;
  clearTimeout(discoveryTimer); discovery.value = undefined; pendingEntry.value = undefined;
  response.value = undefined; journalSource.value = undefined; journalBookmarks.value = false;
  objectivesOpen.value = false; guideMinimized.value = false; closeView.value = false;
  sceneRevision.value++; panel.value = null; viewHome.value = false;
}
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
  document.addEventListener('pointerdown',unlockSound,true);document.addEventListener('keydown',unlockSound,true);document.addEventListener('visibilitychange',soundVisibility);
  if (new URLSearchParams(window.location.search).get('dev') === '1') developerTools();
});
function unlockSound(event:Event){
  if(event instanceof KeyboardEvent&&!['Enter',' '].includes(event.key))return;
  void soundscape.unlock().then(ok=>{audioMessage.value=ok?'':'声音暂时没打开，再点一下音量试试。';});
}
function uiSound(event:MouseEvent){
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button'):null;
  if(!button||button.disabled||button.closest('[inert]'))return;
  const cue=button.dataset.sound??'wood';if(['wood','paper','cup','door'].includes(cue))void soundscape.play(cue as SoundEffect);
}
function soundVisibility(){soundscape.setActive(!document.hidden&&(!showingHome.value||introActive.value));}
watch([musicVolume,effectsVolume,muted,showingHome,introActive,()=>state.value.chapterId],()=>{
  soundscape.setLevels({music:musicVolume.value,effects:effectsVolume.value,muted:muted.value});
  soundscape.setTheme(introActive.value ? 'home' : sceneMusic(state.value.chapterId));soundVisibility();
},{immediate:true});
const region = ref<HTMLElement>(); let tween: gsap.core.Tween | undefined;
const discovery = ref<{ title: string; text: string;  }>(); let discoveryTimer: ReturnType<typeof setTimeout> | undefined;
watch([state, developer], ([next, testing], [previous, wasTesting]) => {
  if(next.phase==='ending'){discovery.value=undefined;response.value=undefined;return;}
  if (testing || testing !== wasTesting) return;
  const notice = discoveryNotice(previous, next, content);
  if (!notice) return;
  if (notice.entryId) pendingEntry.value = notice.entryId;
  discovery.value = notice; clearTimeout(discoveryTimer);
});
const showDiscovery = computed(() => state.value.phase==='playing' && !!discovery.value && !node.value && !panel.value && !closeView.value && !showingHome.value && !response.value && (!guideVisible.value || guideMinimized.value));
watch([showDiscovery, discovery], () => { clearTimeout(discoveryTimer); if (showDiscovery.value) discoveryTimer = setTimeout(() => { discovery.value = undefined; }, 7000); });
watch([showingHome, () => state.value.chapterId, () => state.value.sceneId], async () => {
  await nextTick(); tween?.kill();
  if (region.value && !showingHome.value) tween = gsap.fromTo(region.value, { opacity: reducedMotion.value ? 1 : 0 }, { opacity: 1, duration: reducedMotion.value ? 0 : .45 });
  if (!showingHome.value && state.value.phase === 'playing' && scene.value.id === 'epilogue-gate' && !state.value.flags.includes('epilogue-morning-seen') && !panel.value && !node.value) {
    const morning = scene.value.hotspots.find(h => h.id === 'epilogue-morning');
    if (morning) interact(morning);
  }
});
onBeforeUnmount(() => { tween?.kill(); clearTimeout(discoveryTimer); soundscape.dispose(); document.removeEventListener('fullscreenchange', syncFullscreen); document.removeEventListener('keydown', developerShortcut);document.removeEventListener('pointerdown',unlockSound,true);document.removeEventListener('keydown',unlockSound,true);document.removeEventListener('visibilitychange',soundVisibility); });
</script>

<template>
  <div class="game-shell immersive" :class="{ 'reduced-motion': reducedMotion, 'at-home': showingHome, 'developer-active': developer, 'tutorial-focused': guideFocused, 'tutorial-minimal': guideChrome === 'minimal' }" :data-tutorial-step="presentedGuide?.id" :style="themeStyle" @click.capture="uiSound">
    <aside v-if="developer" class="developer-bar" aria-label="测试模式"><strong>开发者测试</strong><span>前置限制已放开</span><button @click="developerTools">测试工具 · F8</button><button @click="exitDeveloper">退出测试</button></aside>
    <main ref="region">
      <TitleScreen v-if="showingHome" :content="content" :has-save="hasProgress" :reduced-motion="reducedMotion" @intro="introActive = $event" @start="requestStart" @continue="continueStory" @saves="openPanel('saves')" @settings="openPanel('settings')" />
      <template v-else>
        <div v-if="state.phase === 'playing'" class="play-layout">
          <SceneView :key="sceneRevision" :developer="developer" :chapter="chapter" :content="content" :state="state" :guide-target="!guideMinimized ? presentedGuide?.target : undefined" :focus-locked="guideFocused" :blocked="!!panel || !!node" :reduced-motion="reducedMotion" @framing="closeView = $event" @interact="interact" @option="sceneOption" />
          <GuideHint v-if="presentedGuide" :key="presentedGuide.id" :guide="presentedGuide" :active="guideVisible" :minimized="guideMinimized" :step="guideIndex + 1" :total="guideSteps.length" :reduced-motion="reducedMotion" @minimize="guideMinimized = $event" />
          <SceneNavigation :scene-id="scene.id" :routes="routes" :blocked="!!panel||!!node||closeView||guideFocused" @go="followRoute"/>
          <Transition name="hud-reveal"><aside v-if="objectivesOpen&&!guideChrome" class="objectives-panel"><WoodFrame kind="ui-toast"/><h2>{{returning?'这次回访':'手头的事'}}</h2><div class="text-scroll"><p>{{returning?scene.description:chapter.objective}}</p><ol v-if="chapter.beats&&!returning" class="objective-list"><li v-for="beat in chapter.beats" :key="beat.label" :class="{done:matches(state,beat.condition)}"><Icon :name="matches(state,beat.condition)?'check':'leaf'"/>{{beat.label}}</li></ol></div></aside></Transition>

        </div>
        <section v-else class="ending-screen" :style="{ backgroundImage: `linear-gradient(90deg, #24170fe8, #24170fb0), url('${content.assets[ending.asset ?? 'title-homecoming']!.url}')` }">
          <p class="eyebrow">第五章 · {{ chapter.title }}</p><h1>{{ ending.title }}</h1>
          <div class="ending-reading text-scroll" tabindex="0" aria-label="结尾正文与三家店记">
            <p class="ending-copy">{{ ending.text }}</p>
            <div class="outcomes"><article v-for="record in epilogueRecords(state)" :key="record.id"><small>{{ record.title }}</small><p>{{ record.text }}</p></article></div>
          </div>
          <div class="button-row"><UiButton tone="jade" @click="openPanel('journal')">翻翻百味录</UiButton><UiButton v-if="unlocked('revisit')" @click="openPanel('revisit')">回访老街</UiButton><UiButton @click="openPanel('saves')">读档</UiButton><UiButton @click="viewHome = true">回到首页</UiButton></div>
        </section>
      </template>
    </main>
    <GameDock v-if="!showingHome" :tools="dockTools" :blocked="!!panel||!!node" @activate="activateDock"/>
    <p v-if="!showingHome" class="sr-only" role="status" aria-live="polite">{{message}}</p>
    <Transition name="hud-reveal"><SceneResponse v-if="response&&!panel&&!node&&!closeView&&!showingHome" :key="response.key" :title="response.title" :text="response.text" :reduced-motion="reducedMotion" @close="response=undefined"/></Transition>

    <Transition name="discovery"><aside v-if="discovery && showDiscovery" class="discovery-toast" role="status"><WoodFrame kind="ui-toast" /><Icon name="book" /><div><small>{{ discovery.text }}</small><strong>{{ discovery.title }}</strong></div><UiButton tone="icon" aria-label="收起发现提示" @click="discovery = undefined"><Icon name="close" /></UiButton></aside></Transition>
    <Modal v-if="node || panel" :class="{'modal--confirm':panel?.kind==='replay-chapter','modal--choices':node&&dialogueChoicesOnly(node,state)}" :title="title" :variant="modalVariant" :advance-reading="(!!node||panel?.kind==='inspect') && panel?.kind !== 'developer'" @advance="advanceReading" @close="closeModal">
      <template #actions><UiButton v-if="containingBook" tone="quiet" @click="panel = { kind: 'inspect', hotspot: containingBook }">翻回书签</UiButton><UiButton v-if="developer && panel?.kind !== 'developer'" tone="quiet" @click="developerTools">测试工具</UiButton></template>
      <DeveloperTools v-if="panel?.kind === 'developer'" :content="content" :state="state" @jump="debugJump" @dialogue="debugDialogue" @game="debugGame" @hotspot="debugObject" @panel="openPanel" @reset="resetTest" @exit="exitDeveloper" />
      <DialogueView ref="dialogueReader" :developer="developer" v-else-if="node" :key="state.dialogue!.id + ':' + node.id" :node="node" :state="state" :content="content" :reduced-motion="reducedMotion" @choose="choose" />
      <InspectionView ref="inspectionReader" :developer="developer" v-else-if="panel?.kind === 'inspect' && inspect" :key="panel.hotspot.id" :inspection="inspect" :contents="inspectContents" @object="openContainedObject" :state="state" :activity="inspectActivity" :prop-asset="inspectAsset" :journal-available="unlocked('journal')" :complete-label="panel.hotspot.id === 'epilogue-morning' && allowed(inspect.action?.condition) ? '收好今天这一页' : undefined" :reduced-motion="reducedMotion" @complete="completeInspection" @examined="examined" @option="useOption" @journal="openPanel('journal')" @activity="panel = { kind: 'minigame', gameId: inspectActivity!.id }" />
      <MinigameHost :developer="developer" v-else-if="panel?.kind === 'minigame' && minigame" :definition="minigame" :state="state" :reduced-motion="reducedMotion" :assets="content.assets" @finish="finish" />
      <JournalView :developer="developer" v-else-if="panel?.kind === 'journal'" :content="content" :state="state" :reduced-motion="reducedMotion" :new-entry-id="pendingEntry" :activity="journalActivity" :context-text="journalContext" :initial-bookmarks="journalBookmarks" @finish="finishJournal" @read="pendingEntry = undefined" />
      <CollectionView ref="collectionReader" :developer="developer" v-else-if="panel?.kind === 'collection'" :content="content" :state="state" :reduced-motion="reducedMotion" @study="entryId => game.dispatch({ type: 'study-collection', entryId })" />
      <RevisitView :developer="developer" v-else-if="panel?.kind === 'revisit'" :content="content" :state="state" @revisit="revisit" @resume="travel" />
      <SaveManager v-else-if="panel?.kind === 'saves'" :game="game" :content="content" @loaded="panel = null; viewHome = false" />
      <div v-else-if="panel?.kind==='menu'" class="pause-menu"><UiButton v-if="unlocked('collection')" @click="openPanel('collection')"><Icon name="collection"/>图鉴</UiButton><UiButton v-if="unlocked('lifeNotes')" @click="panel={kind:'achievements'}"><Icon name="leaf"/>拾零</UiButton><UiButton @click="openPanel('saves')"><Icon name="save"/>存读档</UiButton><UiButton @click="openPanel('settings')"><Icon name="settings"/>设置</UiButton><UiButton tone="quiet" @click="panel=null;viewHome=true">回到首页</UiButton></div>
      <section v-else-if="panel?.kind === 'achievements'" class="entry-list"><article v-for="entry in content.achievements.filter(a => developer || state.achievements.includes(a.id))" :key="entry.id"><h3>{{ entry.title }}</h3><p>{{ entry.text }}</p><aside v-if="entry.annotation" class="annotation">{{ entry.annotation }}</aside></article></section>
      <InventoryView ref="inventoryReader" v-else-if="panel?.kind === 'inventory'" :content="content" :state="state" :developer="developer" :reduced-motion="reducedMotion" />
      <template v-else-if="panel?.kind === 'settings'"><div class="settings-list"><UiButton @click="developerTools">{{ developer ? '打开开发者测试工具' : '开启开发者测试模式' }}</UiButton><label><span>减少动画</span><input v-model="reducedMotion" type="checkbox" /></label><label><span>静音</span><input v-model="muted" type="checkbox" /></label><label for="music-volume">音乐 <span>{{ Math.round(musicVolume * 100) }}%</span></label><input id="music-volume" v-model.number="musicVolume" type="range" min="0" max="1" step="0.01" /><label for="effects-volume">交互音效 <span>{{ Math.round(effectsVolume * 100) }}%</span></label><input id="effects-volume" v-model.number="effectsVolume" type="range" min="0" max="1" step="0.01" /><p v-if="audioMessage" role="status">{{ audioMessage }}</p><UiButton @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏游玩' }}<Icon name="fullscreen" /></UiButton><p class="muted">点选、翻看场景里的物件。可以用 Tab 选择目标，Enter 确认，Esc 放下物件或结束交谈。对白窗口内点任意留白可补全当前句或接下一句，空格与回车也可以。茶具、凳子等可以拖动，也能直接点选。</p><UiButton v-if="!showingHome" tone="wood" @click="requestChapterReplay">重玩该章节</UiButton><UiButton v-if="!showingHome" tone="quiet" @click="panel = { kind: 'restart' }">重新开始旅程</UiButton></div></template>
      <section v-else-if="panel?.kind === 'replay-chapter'" ref="replayConfirmation" class="chapter-replay-confirm">
        <p class="eyebrow">第 {{ chapter.number }} 章 · {{ chapter.title }}</p>
        <p>要回到《{{ chapter.title }}》的开头吗？</p>
        <p>本章及后续章节的操作、选择和收集进度都会清空，自动存档与选择前检查点将更新为本章开头。此前章节的记录、手动存档和导出文件保留。</p>
        <p v-if="returning" class="muted">你正在回访旧章节，确认后也会清空之后的行程。</p>
        <div class="button-row"><UiButton @click="panel = { kind: 'settings' }">继续当前进度</UiButton><UiButton tone="wood" @click="replayChapter">确认重玩本章</UiButton></div>
      </section>
      <template v-else-if="panel?.kind === 'restart'"><p>新的归途会替换自动存档。手动档位和导出的文件会保留。</p><div class="button-row"><UiButton tone="jade" @click="restart">开始新的故事</UiButton><UiButton @click="panel = null">先不重来</UiButton></div></template>
      <template v-else-if="panel?.kind === 'notice'"><p>{{ panel.text }}</p></template>
    </Modal>
  </div>
</template>
