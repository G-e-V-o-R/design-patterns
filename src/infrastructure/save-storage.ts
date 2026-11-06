import { Blueprint } from '../domain/blueprints/types';
import { Save } from '../domain/saves/types';
import { Chapter } from '../domain/story/types';
import { parseSave } from '../application/validate-save';

export const SAVE_KEY = 'threads-of-the-journey.save.v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function loadSave(chapter: Chapter, blueprints: readonly Blueprint[], storage?: StoragePort): { save: Save | null; error?: string } {
  try {
    const text = (storage ?? window.localStorage).getItem(SAVE_KEY);
    if (!text) return { save: null };
    const result = parseSave(text, chapter, blueprints);
    return result.ok ? { save: result.save } : { save: null, error: result.error };
  } catch { return { save: null, error: 'Local saves are unavailable. You can still play and export your journey.' }; }
}
export function storeSave(save: Save, storage?: StoragePort): { ok: boolean; error?: string } {
  try { (storage ?? window.localStorage).setItem(SAVE_KEY, JSON.stringify(save)); return { ok: true }; }
  catch { return { ok: false, error: 'Your journey could not be saved locally. Export it from Settings before leaving.' }; }
}
export function exportSave(save: Save): string { return JSON.stringify(save, null, 2); }
