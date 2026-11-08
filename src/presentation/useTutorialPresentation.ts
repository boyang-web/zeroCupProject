import { computed, ref, shallowRef, watch } from 'vue';
import type { GuideStep } from '../core/contracts.ts';

interface TutorialSource {
  guide: () => GuideStep | undefined;
  suspended: () => boolean;
  inactive: () => boolean;
}

// Hold the current lesson through camera moves and continuous panels. None of
// this presentation state is a story fact or belongs in a save.
export function useTutorialPresentation(source: TutorialSource) {
  const presented = shallowRef<GuideStep>();
  const minimized = ref(false);
  watch([source.guide, source.suspended, source.inactive], () => {
    if (source.inactive()) { presented.value = undefined; minimized.value = false; return; }
    if (source.suspended()) return;
    const next = source.guide();
    if (next?.id !== presented.value?.id) minimized.value = false;
    presented.value = next;
  }, { immediate: true, flush: 'sync' });
  const visible = computed(() => !!presented.value && !source.suspended() && !source.inactive());
  const focused = computed(() => !!presented.value?.focus && !minimized.value && !source.inactive());
  const chrome = computed(() => minimized.value ? undefined : presented.value?.chrome);
  const allowsObject = (id: string) => !focused.value || presented.value?.target === id;
  return { presented, minimized, visible, focused, chrome, allowsObject };
}
