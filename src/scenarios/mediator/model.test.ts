const assert = {
  ok(value: unknown, message = 'Expected truthy value') { if (!value) throw new Error(message); },
  equal(actual: unknown, expected: unknown, message = 'Values differ') { if (actual !== expected) throw new Error(message); },
  deepEqual(actual: unknown, expected: unknown, message = 'Structures differ') { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message); },
};
import { emptyLesson, solutionLesson, getLessonIssues, simulateLesson, memberCards } from './model';

assert.deepEqual(getLessonIssues(solutionLesson()), []);
const shuffled = solutionLesson();
shuffled.classes.reverse();
shuffled.edges.reverse();
assert.deepEqual(getLessonIssues(shuffled), [], 'layout/order is not semantic');
assert.equal(simulateLesson(emptyLesson(), 'cover'), null, 'incomplete diagrams cannot run');
const cover = simulateLesson(solutionLesson(), 'cover')!;
assert.equal(cover.sender, 'dre-kaar');
assert.equal(cover.recipient, 'narion');
assert.ok(cover.trace.some(step => step.includes('provideCover()')));
const shelter = simulateLesson(solutionLesson(), 'shelter')!;
assert.equal(shelter.sender, 'faelina');
assert.equal(shelter.recipient, 'saerenn');
assert.ok(shelter.trace.some(step => step.includes('provideShelter()')));
for (const member of memberCards) {
  const graph = solutionLesson();
  delete graph.members[member.id];
  assert.ok(getLessonIssues(graph).some(issue => issue.memberIds.includes(member.id)));
  graph.members[member.id] = member.owner === 'raven' ? 'mediator' : 'raven';
  assert.ok(getLessonIssues(graph).some(issue => issue.memberIds.includes(member.id)));
}
for (let index = 0; index < solutionLesson().edges.length; index++) {
  const graph = solutionLesson();
  const [edge] = graph.edges.splice(index, 1);
  assert.ok(getLessonIssues(graph).length > 0, 'missing edge fails');
  assert.equal(simulateLesson(graph, 'cover'), null);
  graph.edges.push({ ...edge!, source: edge!.target, target: edge!.source });
  assert.ok(getLessonIssues(graph).some(issue => issue.edgeIndices.includes(graph.edges.length - 1)), 'reversed edge highlighted');
}
const duplicate = solutionLesson();
duplicate.edges.push({...duplicate.edges[0]!});
assert.ok(getLessonIssues(duplicate).some(issue => issue.message.includes('duplicate')));
const direct = solutionLesson();
direct.edges.push({ source:'dre-kaar', target:'narion', type:'uses' });
assert.ok(getLessonIssues(direct).some(issue => issue.edgeIndices.includes(9)), 'peer dependency rejected');
const foreign = solutionLesson();
foreign.classes.push('publisher');
foreign.members.notify = 'publisher';
foreign.edges.push({source:'publisher',target:'mediator',type:'stores'});
assert.ok(getLessonIssues(foreign).length >= 3, 'foreign scenario data rejected');
const missingClass = solutionLesson();
missingClass.classes = missingClass.classes.filter(id => id !== 'raven');
assert.ok(getLessonIssues(missingClass).some(issue => issue.classIds.includes('raven')));
const first = solutionLesson();
first.classes.pop(); first.members.participants = 'narion'; first.edges[0]!.source = 'narion';
assert.deepEqual(getLessonIssues(solutionLesson()), [], 'fresh solutions do not share mutable state');
const empty = emptyLesson(); empty.classes.push('raven'); empty.members.foo = 'raven';
assert.deepEqual(emptyLesson(), {classes:[],members:{},edges:[]}, 'fresh attempts are independent');
console.log('Mediator: validation, targeted feedback, routing, invalid-diagram gating and state isolation passed.');
