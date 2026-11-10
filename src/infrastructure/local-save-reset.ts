import { slots, type StoragePort } from './saves.ts';

// Opt-in for this workstation via .env.local; no reset token ships by default.
export function resetLocalSaves(storage: StoragePort, contentId: string, hostname: string, token?: string): boolean {
  if (!token || !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) return false;
  const marker = `baiwei:${contentId}:local-reset`;
  if (storage.getItem(marker) === token) return false;
  for (const channel of ['', 'developer:']) {
    for (const slot of slots) storage.removeItem(`baiwei:${contentId}:${channel}v1:${slot}`);
  }
  storage.setItem(marker, token);
  return true;
}
