import { Blueprint, Graph } from '../domain/blueprints/types';
import { Save } from '../domain/saves/types';
import { Chapter } from '../domain/story/types';
import { validateGraph } from './validate-content';

export type SaveResult = { ok: true; save: Save } | { ok: false; error: string };
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
const own = (v: object, key: string): boolean => Object.prototype.hasOwnProperty.call(v, key);
const sameFlags = (a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): boolean =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);

export function validateSave(value: unknown, chapter: Chapter, blueprints: readonly Blueprint[]): SaveResult {
  const fail = (error: string): SaveResult => ({ ok: false, error });
  if (!record(value) || value.schemaVersion !== 1 || value.contentVersion !== chapter.contentVersion || value.chapterId !== chapter.id)
    return fail('This save uses an unsupported version or chapter.');
  if (typeof value.sceneId !== 'string' || !chapter.scenes.some(s => s.id === value.sceneId)) return fail('This save has an unknown scene.');
  if (!record(value.flags) || !Object.entries(value.flags).every(([k, v]) => own(chapter.flags, k) && typeof v === 'string' && chapter.flags[k]!.includes(v)))
    return fail('This save has an invalid story choice.');
  if (!strings(value.askedQuestionIds) || new Set(value.askedQuestionIds).size !== value.askedQuestionIds.length)
    return fail('This save has invalid conversation records.');
  if (!record(value.puzzles)) return fail('This save has invalid blueprint records.');
  const puzzles: Record<string, Save['puzzles'][string]> = {};
  for (const [id, p] of Object.entries(value.puzzles)) {
    const blueprint = blueprints.find(b => b.id === id);
    if (!blueprint || !record(p) || typeof p.completed !== 'boolean' || typeof p.assisted !== 'boolean' || !record(p.graph))
      return fail('This save has an unknown or malformed blueprint.');
    const g = p.graph;
    if (!strings(g.roles) || g.roles.length !== blueprint.roles.length || new Set(g.roles).size !== g.roles.length || !g.roles.every(id => blueprint.roles.some(r => r.id === id))
      || !Array.isArray(g.edges) || g.edges.length > blueprint.roles.length ** 2 * blueprint.edgeTypes.length)
      return fail('This save has invalid blueprint cards.');
    const roles = g.roles;
    if (!g.edges.every(e => record(e) && typeof e.source === 'string' && typeof e.target === 'string' && typeof e.type === 'string'
      && roles.includes(e.source) && roles.includes(e.target) && blueprint.edgeTypes.includes(e.type)))
      return fail('This save has an invalid connection.');
    const graph: Graph = { roles: [...roles], edges: g.edges.map(e => ({ source: e.source as string, target: e.target as string, type: e.type as string })) };
    if (new Set(graph.edges.map(e => JSON.stringify([e.source, e.target, e.type]))).size !== graph.edges.length)
      return fail('This save has duplicate connections.');
    if (p.completed && validateGraph(blueprint, graph).length !== 0) return fail('A completed blueprint is not solved.');
    puzzles[id] = { graph, completed: p.completed, assisted: p.assisted };
  }
  const save: Save = { schemaVersion: 1, chapterId: chapter.id, contentVersion: chapter.contentVersion,
    sceneId: value.sceneId, flags: { ...value.flags } as Record<string, string>, askedQuestionIds: [...value.askedQuestionIds], puzzles };
  // Reconstruct a legal path, including puzzle gates and the exact choices already committed.
  const reachable = (id: string, flags: Readonly<Record<string, string>>, visited: readonly string[], required: readonly string[]): boolean => {
    if (visited.includes(id)) return false;
    const scene = chapter.scenes.find(s => s.id === id);
    if (!scene) return false;
    const path = [...visited, id];
    if (id === save.sceneId) {
      const allowedPuzzles = chapter.scenes.filter(s => path.includes(s.id) && s.puzzleId).map(s => s.puzzleId!);
      const allowedQuestions = chapter.scenes.filter(s => path.includes(s.id)).flatMap(s => (s.questions ?? []).map(q => s.id + ':' + q.id));
      return sameFlags(flags, save.flags) && required.every(p => !!save.puzzles[p]?.completed)
        && Object.keys(save.puzzles).every(p => allowedPuzzles.includes(p))
        && save.askedQuestionIds.every(q => allowedQuestions.includes(q));
    }
    const needed = scene.puzzleId ? [...required, scene.puzzleId] : required;
    if (scene.next && reachable(scene.next, flags, path, needed)) return true;
    return (scene.choices ?? []).some(choice => reachable(choice.target, { ...flags, ...choice.effects }, path, needed));
  };
  if (!reachable(chapter.start, {}, [], [])) return fail('This save does not match a reachable journey. Earlier choices or completed blueprints are missing.');
  return { ok: true, save };
}
export function parseSave(text: string, chapter: Chapter, blueprints: readonly Blueprint[]): SaveResult {
  if (text.length > 1_000_000) return { ok: false, error: 'This save file is too large.' };
  try { return validateSave(JSON.parse(text) as unknown, chapter, blueprints); }
  catch { return { ok: false, error: 'This file is not valid save JSON.' }; }
}
