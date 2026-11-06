export interface Preferences { guided: boolean; technical: boolean; reducedMotion: boolean }
const key = 'threads-preferences-v1';
export function readPreferences(): Preferences {
  const defaults = { guided: true, technical: false, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
  try { const p = JSON.parse(localStorage.getItem(key) || '{}'); return { guided: typeof p.guided === 'boolean' ? p.guided : defaults.guided, technical: typeof p.technical === 'boolean' ? p.technical : defaults.technical, reducedMotion: typeof p.reducedMotion === 'boolean' ? p.reducedMotion : defaults.reducedMotion }; } catch { return defaults; }
}
export function savePreferences(p: Preferences): void { try { localStorage.setItem(key, JSON.stringify(p)); } catch { /* Optional preferences never block play. */ } }
