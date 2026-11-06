import { Blueprint, Graph } from '../domain/blueprints/types';
import { Save } from '../domain/saves/types';
import { Chapter, Line, Scene } from '../domain/story/types';
import { validateGraph } from './validate-content';

export function newJourney(chapter: Chapter): Save {
  return { schemaVersion: 1, contentVersion: chapter.contentVersion, chapterId: chapter.id,
    sceneId: chapter.start, flags: {}, askedQuestionIds: [], puzzles: {} };
}
export function currentScene(chapter: Chapter, save: Save): Scene {
  const scene = chapter.scenes.find(s => s.id === save.sceneId);
  if (!scene) throw new Error('The saved scene is not part of this chapter.');
  return scene;
}
export function visibleLines(scene: Scene, save: Save): readonly Line[] {
  return scene.lines.filter(line => !line.when || save.flags[line.when.flag] === line.when.equals);
}
export function askQuestion(chapter: Chapter, save: Save, id: string): Save {
  const scene = currentScene(chapter, save);
  const key = scene.id + ':' + id;
  if (!scene.questions?.some(q => q.id === id) || save.askedQuestionIds.includes(key)) return save;
  return { ...save, askedQuestionIds: [...save.askedQuestionIds, key] };
}
export function choose(chapter: Chapter, save: Save, id: string): Save {
  const scene = currentScene(chapter, save);
  const choice = scene.choices?.find(c => c.id === id);
  if (!choice || (scene.puzzleId && !save.puzzles[scene.puzzleId]?.completed)) return save;
  return { ...save, sceneId: choice.target, flags: { ...save.flags, ...choice.effects } };
}
export function advance(chapter: Chapter, save: Save): Save {
  const scene = currentScene(chapter, save);
  if (!scene.next || (scene.puzzleId && !save.puzzles[scene.puzzleId]?.completed)) return save;
  return { ...save, sceneId: scene.next };
}
export function updatePuzzle(save: Save, blueprint: Blueprint, graph: Graph, assisted = false): Save {
  const previous = save.puzzles[blueprint.id];
  return { ...save, puzzles: { ...save.puzzles, [blueprint.id]: {
    graph: { roles: [...graph.roles], edges: graph.edges.map(e => ({ ...e })) },
    completed: !!previous?.completed && validateGraph(blueprint, graph).length === 0,
    assisted: !!previous?.assisted || assisted,
  } } };
}
export function testPuzzle(save: Save, blueprint: Blueprint, assisted = false): Save {
  const puzzle = save.puzzles[blueprint.id];
  if (!puzzle) return save;
  return { ...save, puzzles: { ...save.puzzles, [blueprint.id]: {
    ...puzzle, completed: validateGraph(blueprint, puzzle.graph).length === 0,
    assisted: puzzle.assisted || assisted,
  } } };
}
