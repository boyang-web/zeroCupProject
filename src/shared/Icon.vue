<script setup lang="ts">
defineProps<{ name: string }>();
const paths: Record<string, string> = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  bag: 'M5 7h14l2 14H3L5 7Zm3 0V5a4 4 0 0 1 8 0v2',
  collection: 'M3 4h18v5H3V4Zm2 5v12h14V9M9 13h6',
  fullscreen: 'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',
  book: 'M12 5.5C9 3.5 5 3.5 2.5 4.5v15C5 18.5 9 18.5 12 20.5m0-15c3-2 7-2 9.5-1v15c-2.5-1-6.5-1-9.5 1m0-15v15',
  talk: 'M20.5 11c0 4.5-4.1 8-9 8H6l-4 3 1.8-5.5A7.5 7.5 0 0 1 2 11c0-4.5 4-8 9-8s9.5 3.5 9.5 8ZM7 10h9m-9 4h5',
  look: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  letter: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  tea: 'M4 9h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm12 0h2a3 3 0 0 1 0 6h-2M7 3v3m5-3v3M2 22h18',
  save: 'M4 3h13l4 4v14H3V3h1Zm3 0v6h9V3M7 21v-8h10v8',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-6h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1 1-3Z',
  arrow: 'M3 12h18m-6-6 6 6-6 6',
  leaf: 'M20 3C8 2 3 8 5 14c2 6 13 5 15-11ZM4 21C6 13 10 9 17 6',
  check: 'm5 12 4 4L20 5', close: 'm6 6 12 12M6 18 18 6',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  pin: 'M12 22S4 14 4 9a8 8 0 1 1 16 0c0 5-8 13-8 13Zm0-16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
};
</script>
<template><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon"><path :d="paths[name] ?? paths.look" /></svg></template>
