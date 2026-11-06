export function createAmbience(url: string) {
  let audio: HTMLAudioElement | undefined;
  return {
    async setVolume(volume: number) {
      if (volume <= 0) { audio?.pause(); return true; }
      audio ??= new Audio(url); audio.loop = true; audio.volume = Math.min(1, Math.max(0, volume));
      try { await audio.play(); return true; } catch { return false; }
    },
    dispose() { if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = undefined; } },
  };
}
