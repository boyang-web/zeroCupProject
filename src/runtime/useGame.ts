import { computed, shallowRef } from 'vue';
import type { Command, ContentPack, GameState } from '../core/contracts.ts';
import { createState, matches, resolveEnding, transition } from '../core/engine.ts';
import { sceneOf } from '../core/scenes.ts';
import { createSaveRepository, type SaveEnvelope, type SaveResult, type SlotId, type StoragePort } from '../infrastructure/saves.ts';

export function useGame(content: ContentPack, storage: StoragePort) {
  const state = shallowRef(createState(content));
  const developer = shallowRef(false);
  const message = shallowRef('');
  const saveRevision = shallowRef(0);
  const repositories = { normal: createSaveRepository(storage, content), developer: createSaveRepository(storage, content, 'developer') };
  const mode = () => developer.value ? 'developer' as const : 'normal' as const;
  const volatileCheckpoints: Record<'normal' | 'developer', SaveEnvelope | null> = { normal: null, developer: null };
  let normalState: GameState | undefined, testState: GameState | undefined;
  const saves = {
    write: (slot: SlotId, next: GameState) => repositories[mode()].write(slot, next),
    remove: (slot: SlotId) => repositories[mode()].remove(slot),
    read(slot: SlotId): SaveResult<SaveEnvelope | null> {
      const volatileCheckpoint = volatileCheckpoints[mode()];
      if (slot === 'checkpoint' && volatileCheckpoint) return { ok: true, value: volatileCheckpoint };
      return repositories[mode()].read(slot);
    },
  };
  const chapter = computed(() => content.chapters.find(c => c.id === state.value.chapterId)!);
  const scene = computed(() => sceneOf(state.value, content));
  const dialogue = computed(() => content.dialogues.find(d => d.id === state.value.dialogue?.id));
  const node = computed(() => dialogue.value?.nodes.find(n => n.id === state.value.dialogue?.nodeId));
  const ending = computed(() => resolveEnding(state.value, content));
  const canTravel = computed(() => !!(chapter.value.next || chapter.value.exit) && (developer.value || matches(state.value, chapter.value.exit)));
  function setDeveloper(enabled: boolean) {
    if (enabled === developer.value) return;
    if (enabled) {
      normalState = structuredClone(state.value);
      const saved = repositories.developer.read('auto');
      const next = testState ?? (saved.ok ? saved.value?.state : undefined) ?? normalState;
      developer.value = true;
      state.value = structuredClone(next);
      if (state.value.phase === 'title') dispatch({ type: 'start' });
      else if (state.value.dialogue) dispatch({ type: 'close-dialogue' });
      message.value = '开发者测试：所有剧情入口已开放，使用独立测试存档。';
    } else {
      testState = structuredClone(state.value);
      developer.value = false;
      state.value = structuredClone(normalState!);
      message.value = '已退出测试模式，恢复正常游玩进度。';
    }
    saveRevision.value++;
  }
  function save(slot: SlotId) {
    const result = saves.write(slot, state.value); saveRevision.value++;
    message.value = result.ok ? '已保存当前进度。' : result.error;
    return result.ok;
  }
  function load(slot: SlotId) {
    const result = saves.read(slot);
    if (!result.ok) { message.value = result.error; return false; }
    if (!result.value) { message.value = '这个位置还没有存档。'; return false; }
    state.value = structuredClone(result.value.state); message.value = result.value.notice ?? '已读取进度。'; return true;
  }
  function restore(next: GameState) { state.value = structuredClone(next); message.value = '已载入导入的存档。'; }
  function dispatch(command: Command) {
    const result = transition(state.value, command, content, { developer: developer.value });
    if (result.changed) {
      let warning = '';
      if (command.type === 'choose' && node.value?.choices.some(c => c.id === command.choiceId && c.decision)) {
        const checkpoint = saves.write('checkpoint', state.value);
        volatileCheckpoints[mode()] = checkpoint.ok ? null : { format: 'baiwei-save', version: 1, savedAt: new Date().toISOString(), state: structuredClone(state.value) };
        if (!checkpoint.ok) warning = '选择前的记录仅在本次打开期间保留；刷新前请导出备份。';
      }
      state.value = result.state;
      const persisted = saves.write('auto', state.value); saveRevision.value++;
      message.value = [warning, persisted.ok ? result.message : persisted.error].filter(Boolean).join(' ');
    } else message.value = result.message;
    return result.changed;
  }
  function newGame() { state.value = createState(content); dispatch({ type: 'start' }); }
  return { state, chapter, scene, node, ending, canTravel, message, saveRevision, saves, dispatch, save, load, restore, newGame, developer, setDeveloper };
}
export type GameRuntime = ReturnType<typeof useGame>;
