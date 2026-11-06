import { chapterOne, observer, mediator } from '../content/chapter-one';
import { advance, askQuestion, choose, currentScene, newJourney, testPuzzle, updatePuzzle, visibleLines } from '../application/story-engine';
import { simulateBlueprint } from '../application/simulate-blueprint';
import { parseSave, validateSave } from '../application/validate-save';
import { exportSave, loadSave, storeSave } from '../infrastructure/save-storage';
import { Save } from '../domain/saves/types';

let count = 0;
const check = (condition: boolean, label: string): void => { count++; if (!condition) throw new Error(label); };
const blueprints = [observer, mediator];
const valid = (save: Save): boolean => validateSave(save, chapterOne, blueprints).ok;
const opening = newJourney(chapterOne);
check(valid(opening), 'fresh journey valid');
check(choose(chapterOne, opening, 'woodland') === opening, 'cannot choose a future route');
const questioned = askQuestion(chapterOne, opening, 'fox');
check(questioned.askedQuestionIds.length === 1, 'question recorded');
check(askQuestion(chapterOne, questioned, 'fox') === questioned, 'question once only');
check(askQuestion(chapterOne, opening, 'unknown') === opening, 'unknown question ignored');
check(valid(questioned), 'asked question round trip');
let ending: Save = opening;
for (const route of ['woodland', 'river']) for (const warned of ['dre-kaar', 'saerenn']) for (const closing of ['together', 'cautious']) {
  let save = choose(chapterOne, advance(chapterOne, questioned), route);
  check(save.flags.route === route && valid(save), 'route chosen consistently');
  check(choose(chapterOne, save, route) === save, 'repeat choice ignored');
  save = advance(chapterOne, save);
  check(advance(chapterOne, save) === save, 'fox gate blocks unfinished puzzle');
  save = updatePuzzle(save, observer, observer.solution);
  check(!save.puzzles[observer.id]?.completed, 'editing correct graph does not complete without test');
  const originalFlags = JSON.stringify(save.flags);
  save = testPuzzle(save, observer, route === 'river');
  check(JSON.stringify(save.flags) === originalFlags, 'assistance does not change choices');
  save = advance(chapterOne, save);
  check(visibleLines(currentScene(chapterOne, save), save)[0]?.text.includes(route === 'woodland' ? 'trees' : 'crossing') === true, 'route changes warning');
  save = choose(chapterOne, save, warned);
  check(visibleLines(currentScene(chapterOne, save), save).some(l => l.speaker === warned), 'warning recipient pays off');
  check(advance(chapterOne, save) === save, 'raven gate blocks unfinished puzzle');
  save = updatePuzzle(save, mediator, mediator.solution, route === 'river');
  save = testPuzzle(save, mediator);
  check(valid(save), 'solved raven state valid');
  save = advance(chapterOne, save);
  check(visibleLines(currentScene(chapterOne, save), save).some(l => l.speaker === warned), 'camp remembers warning');
  save = choose(chapterOne, save, closing);
  check(currentScene(chapterOne, save).terminal === true && valid(save), 'all eight branches reach valid ending');
  check(advance(chapterOne, save) === save, 'ending cannot advance');
  check(testPuzzle(save, mediator).flags === save.flags, 'retesting cannot duplicate story effects');
  check(parseSave(exportSave(save), chapterOne, blueprints).ok, 'complete save round trip');
  ending = save;
}
const oneListener = { roles: observer.solution.roles, edges: [observer.solution.edges[0]!] };
const partialFox = simulateBlueprint(observer, oneListener);
check(partialFox.reachedRoles.join() === 'narion', 'only submitted subscription receives vision');
check(partialFox.trace.filter(t => t.includes('receives nothing')).length === 6, 'all disconnected listeners miss discovery');
check(simulateBlueprint(observer, observer.solution).reachedRoles.length === 7, 'full observer delivers all seven');
const noCoverRequest = { ...mediator.solution, edges: mediator.solution.edges.filter(e => !(e.source === 'dre-kaar' && e.type === 'requests')) };
check(simulateBlueprint(mediator, noCoverRequest).reachedRoles.join() === 'saerenn', 'missing request stops cover before raven');
const noCoverDelivery = { ...mediator.solution, edges: mediator.solution.edges.filter(e => !(e.target === 'narion' && e.type === 'delivers')) };
check(simulateBlueprint(mediator, noCoverDelivery).reachedRoles.join() === 'saerenn', 'missing delivery stops cover at raven');
const exampleOnly = { roles: mediator.solution.roles, edges: mediator.simulations.flatMap(s => s.path) };
check(simulateBlueprint(mediator, exampleOnly).reachedRoles.length === 2, 'both sample requests can pass incomplete network');
check(!testPuzzle(updatePuzzle(opening, mediator, exampleOnly), mediator).puzzles[mediator.id]?.completed, 'sample success alone does not complete puzzle');
const foxScene = advance(chapterOne, choose(chapterOne, advance(chapterOne, opening), 'woodland'));
const partial = updatePuzzle(foxScene, observer, oneListener);
check(valid(partial), 'partial puzzle save valid');
check(!valid(updatePuzzle(foxScene, observer, { roles: ['fox', 'narion'], edges: oneListener.edges })),
  'import rejects missing fixed-cast cards even when every edge references a present card');
check(valid(updatePuzzle(foxScene, observer, { roles: [...observer.solution.roles].reverse(), edges: [] })),
  'full cast with no connections and reordered cards remains a valid unfinished save');
const parsed = parseSave(exportSave(partial), chapterOne, blueprints);
check(parsed.ok && parsed.save.puzzles[observer.id]?.graph.edges.length === 1, 'partial graph survives round trip');
const brokenAfterSolved = updatePuzzle(testPuzzle(updatePuzzle(foxScene, observer, observer.solution), observer), observer, oneListener);
check(!brokenAfterSolved.puzzles[observer.id]?.completed, 'editing solved graph removes completion');
for (const bad of [null, [], {}, { ...opening, schemaVersion: 99 }, { ...opening, flags: { route: 'bogus' } },
  { ...opening, sceneId: 'c01-end' }, { ...ending, flags: {} }, { ...ending, puzzles: {} },
  { ...opening, askedQuestionIds: ['future:question'] }, { ...opening, puzzles: ending.puzzles },
  { ...partial, puzzles: { [observer.id]: { graph: oneListener, completed: true, assisted: false } } },
  { ...partial, puzzles: { [observer.id]: { graph: { roles: ['fox'], edges: [{ source: 'unknown', target: 'fox', type: 'observes' }] }, completed: false, assisted: false } } },
  { ...partial, puzzles: { [observer.id]: { graph: { ...oneListener, edges: [...oneListener.edges, ...oneListener.edges] }, completed: false, assisted: false } } },
]) check(!validateSave(bad, chapterOne, blueprints).ok, 'malformed or unreachable save rejected');
check(!parseSave('{', chapterOne, blueprints).ok, 'malformed JSON safely rejected');
check(!parseSave(' '.repeat(1_000_001), chapterOne, blueprints).ok, 'oversized import rejected');
let stored: string | null = null;
const storage = { getItem: (): string | null => stored, setItem: (_: string, value: string): void => { stored = value; } };
check(loadSave(chapterOne, blueprints, storage).save === null, 'empty storage');
check(storeSave(partial, storage).ok, 'save write');
check(loadSave(chapterOne, blueprints, storage).save?.sceneId === partial.sceneId, 'load restores scene');
const failingStorage = { getItem: (): string => { throw new Error('denied'); }, setItem: (): void => { throw new Error('full'); } };
check(!storeSave(partial, failingStorage).ok, 'quota error handled');
check(!!loadSave(chapterOne, blueprints, failingStorage).error, 'storage access error handled');
console.log(`Passed ${count} runtime, simulation, and save assertions.`);
