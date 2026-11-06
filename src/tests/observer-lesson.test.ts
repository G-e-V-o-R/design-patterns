const assert = {
  ok(value: unknown, message = 'Expected a truthy value') { if (!value) throw new Error(message); },
  equal(actual: unknown, expected: unknown, message = 'Values differ') { if (actual !== expected) throw new Error(message); },
  deepEqual(actual: unknown, expected: unknown, message = 'Structures differ') { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message); },
};
import { connectionHandles, emptyLesson, solutionLesson, validateLesson, simulateLesson, parseLesson } from '../application/observer-lesson';
const solution = solutionLesson();
assert.deepEqual(validateLesson(solution), []);
assert.ok(validateLesson(emptyLesson()).length > 0);
assert.equal(solution.members.subscribers, 'publisher');
const withoutField = {...solution, members: {...solution.members}};
delete withoutField.members.subscribers;
assert.deepEqual(parseLesson(JSON.stringify(withoutField)), withoutField, 'keep older diagrams without the new field');
assert.ok(validateLesson(withoutField).some(s => s.includes('Place subscribers: Subscriber[]')));
const wrongFieldOwner = {...solution, members: {...solution.members, subscribers: 'narion'}};
assert.ok(validateLesson(wrongFieldOwner).some(s => s.includes('subscribers: Subscriber[] belongs in FoxPublisher')));
assert.equal(simulateLesson(wrongFieldOwner).length, 1);
const misplaced = {...solution, members: {...solution.members, notify: 'subscriber'}};
assert.ok(validateLesson(misplaced).some(s => s.includes('notify() belongs in FoxPublisher')));
assert.equal(simulateLesson(misplaced).length, 1);
assert.ok(!simulateLesson(misplaced).some(s => s.includes('chooses a safer route')));
for (const edge of solution.edges) {
  const missing = {...solution, edges: solution.edges.filter(e => e !== edge)};
  assert.ok(validateLesson(missing).length);
  const reversed = {...missing, edges: [...missing.edges, {...edge, source: edge.target, target: edge.source}]};
  assert.ok(validateLesson(reversed).length);
}
assert.ok(validateLesson({...solution, edges: [...solution.edges, {source:'publisher',target:'narion',type:'stores'}]}).length);
assert.ok(validateLesson({...solution, edges: [...solution.edges, solution.edges[0]!]}).length);
assert.ok(validateLesson({...solution, classes: solution.classes.filter(c => c !== 'subscriber')}).length);
const trace = simulateLesson(solution);
assert.ok(trace.some(s => s.includes('fox.subscribe(narion)')));
assert.ok(trace.some(s => s.includes('NarionSubscriber.update')));
assert.ok(trace.some(s => s.includes('DreKaarSubscriber.update')));
assert.ok(trace.some(s => s.includes('fox.unsubscribe(narion)')));
assert.deepEqual(parseLesson(JSON.stringify(solution)), solution);
assert.deepEqual(parseLesson(JSON.stringify(misplaced)), misplaced, 'retain structurally safe but incorrect attempts');
const partial = {classes: ['publisher'], members: {subscribe: 'publisher'}, edges: []};
assert.deepEqual(parseLesson(JSON.stringify(partial)), partial);
for (const raw of [null, '{', 'null', '[]', '{}', JSON.stringify({classes:['raven'],members:{},edges:[]}), JSON.stringify({...solution,members:{notify:'unknown'}}), JSON.stringify({...solution,edges:[null]}), JSON.stringify({...solution,edges:[{source:'publisher',target:'subscriber',type:'unknown'}]}), JSON.stringify({...solution,classes:['publisher','publisher']}), ' '.repeat(50001)]) {
  assert.deepEqual(parseLesson(raw), emptyLesson());
}
for (const sourceHandle of connectionHandles) {
  for (const targetHandle of connectionHandles) {
    const withPorts = {...solution, edges: solution.edges.map(edge => ({...edge, sourceHandle, targetHandle}))};
    assert.deepEqual(parseLesson(JSON.stringify(withPorts)), withPorts, 'preserve both selected ports');
    assert.deepEqual(validateLesson(withPorts), [], 'port placement does not change relationship meaning');
  }
}
for (const side of connectionHandles) {
  for (const suffix of ['start', 'end']) {
    const oldPorts = {...solution, edges: solution.edges.map(edge => ({...edge, sourceHandle: `${side}-${suffix}`, targetHandle: `${side}-${suffix}`}))};
    const centered = {...solution, edges: solution.edges.map(edge => ({...edge, sourceHandle: side, targetHandle: side}))};
    assert.deepEqual(parseLesson(JSON.stringify(oldPorts)), centered, 'move old points to the center of the same side');
  }
}
for (const field of ['sourceHandle', 'targetHandle']) {
  for (const value of ['unknown', 'top-middle', 'left-end-extra', '', null, 42, {}]) {
    assert.deepEqual(parseLesson(JSON.stringify({...solution, edges: [{...solution.edges[0], [field]: value}]})), emptyLesson(), 'reject malformed ports');
  }
}
solution.members.notify = 'narion';
assert.equal(solutionLesson().members.notify, 'publisher', 'solution must not share mutable state');
console.log('Observer lesson: validation, simulation, and saved-attempt checks passed.');
