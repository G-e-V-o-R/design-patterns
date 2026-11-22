import assert from 'node:assert/strict';
import { compileScenarioConfig, type ScenarioConfig } from '../scenarios/shared/scenarioConfig';
import {
  emptyConfiguredLesson,
  getConfiguredLessonIssues,
  solutionConfiguredLesson,
  type LessonGraph,
} from '../scenarios/shared/configuredLessonModel';

function fixture(): ScenarioConfig
{
  return {
    id: 'sample',
    title: 'A configurable lesson',
    pattern: 'Strategy',
    intro: { paragraphs: ['Choose a route.'], image: './resource/intro.svg', task: 'Build the strategy diagram.' },
    classes: [
      { id: 'route', label: 'Route', kind: 'interface', methods: [{ id: 'travel', label: 'travel()' }] },
      {
        id: 'walker', label: 'Walker', kind: 'class', image: './resource/walker.svg',
        fields: [{ id: 'speed', label: 'speed: number' }],
        methods: [{ id: 'walker-travel', label: 'travel()' }],
        relationships: [{ type: 'implements', target: 'route' }],
      },
    ],
    hints: ['Start with the shared contract.'],
  };
}

function compile(config: unknown)
{
  return compileScenarioConfig(config, 'sample/scenario.json', path => `/resolved/${path.replace(/^\.\//, '')}`);
}

const scenario = compile(fixture());
assert.equal(scenario.intro.category, undefined);
assert.equal(scenario.members.length, 3);
assert.equal(scenario.memberOwners.speed, 'walker');
assert.equal(scenario.classes[1]?.artwork?.src, '/resolved/resource/walker.svg');
assert.equal(scenario.classes[1]?.artwork?.framing, undefined);
for (const framing of [0, 16, 100])
{
  const framed = fixture();
  framed.classes[1]!.imageFraming = framing;
  framed.classes[1]!.imageHeight = 220;
  assert.equal(compile(framed).classes[1]?.artwork?.framing, framing);
  assert.equal(compile(framed).classes[1]?.artwork?.height, 220);
}
assert.deepEqual(getConfiguredLessonIssues(scenario, solutionConfiguredLesson(scenario)), []);
assert.ok(getConfiguredLessonIssues(scenario, emptyConfiguredLesson()).length > 0);
assert.notDeepEqual(scenario.positions.route, scenario.positions.walker);
assert.deepEqual(scenario.solutionPositions, scenario.positions);

const structural = fixture();
structural.intro.category = 'STRUCTURAL PATTERN';
assert.equal(compile(structural).intro.category, 'STRUCTURAL PATTERN');
structural.intro.category = ' ';
assert.throws(() => compile(structural), /intro\.category/);

const layout = fixture();
layout.classes[0]!.solutionPosition = { x: 0, y: 0 };
layout.classes[1]!.solutionPosition = { x: 0, y: 300 };
const up = solutionConfiguredLesson(compile(layout)).edges[0];
assert.equal(up?.sourceHandle, 'top');
assert.equal(up?.targetHandle, 'bottom');
layout.classes[0]!.solutionPosition = { x: 0, y: 110, anchorY: 'center' };
layout.classes[1]!.solutionPosition = { x: 380, y: 110, anchorY: 'center' };
const centeredLayout = compile(layout);
assert.deepEqual(centeredLayout.solutionPositions.walker, { x: 380, y: 110, anchorY: 'center' });
const left = solutionConfiguredLesson(centeredLayout).edges[0];
assert.equal(left?.sourceHandle, 'left');
assert.equal(left?.targetHandle, 'right');

const first = solutionConfiguredLesson(scenario);
const second = solutionConfiguredLesson(scenario);
first.classes.pop();
first.members.speed = 'route';
first.edges[0]!.target = 'walker';
assert.equal(second.classes.length, 2);
assert.equal(second.members.speed, 'walker');
assert.equal(second.edges[0]?.target, 'route');
assert.equal(scenario.expectedEdges[0]?.target, 'route');

const positioned = solutionConfiguredLesson(scenario);
positioned.classes.reverse();
positioned.edges[0]!.sourceHandle = 'left';
positioned.edges[0]!.targetHandle = 'right';
const before = JSON.stringify(positioned);
assert.deepEqual(getConfiguredLessonIssues(scenario, positioned), [], 'Port positions and card order are not semantic');
assert.equal(JSON.stringify(positioned), before, 'Validation must not mutate learner input');

function issuesAfter(edit: (graph: LessonGraph) => void)
{
  const graph = solutionConfiguredLesson(scenario);
  edit(graph);
  return getConfiguredLessonIssues(scenario, graph);
}

for (const card of scenario.classes)
{
  assert.ok(issuesAfter(graph =>
  {
    graph.classes = graph.classes.filter(id => id !== card.id);
  }).some(issue => issue.classIds.includes(card.id)));
}
for (const member of scenario.members)
{
  assert.ok(issuesAfter(graph =>
  {
    delete graph.members[member.id];
  }).some(issue => issue.memberIds.includes(member.id)));
}
assert.ok(issuesAfter(graph =>
{
  graph.members.speed = 'route';
}).some(issue => issue.memberIds.includes('speed') && issue.classIds.includes('walker') && issue.classIds.includes('route')));
assert.ok(issuesAfter(graph => graph.classes.push('walker')).some(issue => issue.message.includes('duplicate')));
assert.ok(issuesAfter(graph => graph.classes.push('ghost')).some(issue => issue.classIds.includes('ghost')));
assert.ok(issuesAfter(graph =>
{
  graph.members.ghost = 'walker';
}).some(issue => issue.memberIds.includes('ghost')));
assert.ok(issuesAfter(graph => graph.edges.pop()).some(issue => issue.message.startsWith('Connect ')));
assert.ok(issuesAfter(graph => graph.edges.push({ ...graph.edges[0]! })).some(issue => issue.edgeIndices.includes(0) && issue.edgeIndices.includes(1)));
assert.ok(issuesAfter(graph =>
{
  graph.edges[0] = { source: 'route', target: 'walker', type: 'implements' };
}).some(issue => issue.message.startsWith('Reverse') && issue.edgeIndices.includes(0)));
assert.ok(issuesAfter(graph =>
{
  graph.edges.push({ source: 'walker', target: 'route', type: 'uses' });
}).some(issue => issue.edgeIndices.includes(1)));
assert.ok(issuesAfter(graph =>
{
  graph.edges[0]!.target = 'walker';
}).some(issue => issue.message.includes('different classes') && issue.edgeIndices.includes(0)));
assert.ok(issuesAfter(graph =>
{
  graph.edges[0]!.target = 'ghost';
}).some(issue => issue.edgeIndices.includes(0) && issue.classIds.includes('ghost')));

function invalid(edit: (config: ScenarioConfig) => void, field: string)
{
  const config = fixture();
  edit(config);
  assert.throws(() => compile(config), error => error instanceof Error
    && error.message.includes('sample/scenario.json') && error.message.includes(field));
}

invalid(config =>
{
  config.id = '../other';
}, 'id');
invalid(config =>
{
  config.classes[1]!.id = 'route';
}, 'classes[1].id');
invalid(config =>
{
  config.classes[1]!.fields![0]!.id = 'travel';
}, 'classes[1].fields[0].id');
invalid(config =>
{
  config.classes[1]!.relationships![0]!.target = 'ghost';
}, 'classes[1].relationships[0].target');
invalid(config =>
{
  config.classes[1]!.relationships![0]!.target = 'walker';
}, 'classes[1].relationships[0].target');
invalid(config =>
{
  config.classes[1]!.relationships![0]!.type = 'unknown';
}, 'classes[1].relationships[0].type');
invalid(config =>
{
  config.classes[1]!.relationships!.push({ type: 'implements', target: 'route' });
}, 'classes[1].relationships[1]');
invalid(config =>
{
  delete config.classes[1]!.image;
}, 'classes[1].image');
for (const framing of [-1, 101, Number.NaN])
{
  invalid(config =>
  {
    config.classes[1]!.imageFraming = framing;
  }, 'classes[1].imageFraming');
}
invalid(config =>
{
  config.classes[0]!.imageFraming = 20;
}, 'classes[0].imageFraming');
invalid(config =>
{
  config.classes[1]!.imageHeight = 0;
}, 'classes[1].imageHeight');
invalid(config =>
{
  config.intro.image = '../other/resource/intro.svg';
}, 'intro.image');
invalid(config =>
{
  config.intro.image = 'https://example.com/intro.svg';
}, 'intro.image');
invalid(config =>
{
  config.classes[1]!.position = { x: Number.NaN, y: 0 };
}, 'classes[1].position');
invalid(config =>
{
  config.classes[1]!.solutionPosition = { x: 0, y: Number.POSITIVE_INFINITY };
}, 'classes[1].solutionPosition');
invalid(config =>
{
  config.relationshipTypes = [{ id: 'uses', label: 'duplicate' }];
}, 'relationshipTypes[0].id');
invalid(config =>
{
  config.intro.steps = ['Only one'];
}, 'intro.steps');
assert.throws(() => compile({ ...fixture(), clasess: [] }), /scenario.clasess/);
assert.throws(() => compile({ ...fixture(), classes: null }), /classes/);
assert.throws(() => compileScenarioConfig(fixture(), 'sample/scenario.json', () =>
{
  throw new Error('Missing file');
}), /sample\/scenario.json: classes\[1\].image:.*Missing file/);

const custom = fixture();
custom.relationshipTypes = [{ id: 'delegates', label: 'delegates work' }];
custom.classes[1]!.relationships![0]!.type = 'delegates';
assert.equal(compile(custom).expectedEdges[0]?.type, 'delegates');
console.log('Configured lesson parsing, solutions, targeted validation, and immutability cases passed.');

const inline = fixture();
const sectionFiles: Record<string, unknown> = {
  './content/intro.json': inline.intro,
  './classes.json': inline.classes,
  './hints.json': inline.hints,
  './relationships.json': [],
};
const manifest = {
  id: inline.id,
  title: inline.title,
  pattern: inline.pattern,
  intro: './content/intro.json',
  classes: './classes.json',
  hints: './hints.json',
  relationshipTypes: './relationships.json',
};
const loadSections = (input: unknown, files = sectionFiles) => compileScenarioConfig(
  input, 'sample/scenario.json', path => `/resolved/${path.replace(/^\.\//, '')}`, path => files[path],
);
assert.deepEqual(loadSections(manifest), compile(inline), 'Split and inline configurations compile identically.');
assert.deepEqual(loadSections({ ...manifest, intro: inline.intro }), compile(inline), 'Inline and referenced sections can be mixed.');
assert.equal(manifest.intro, './content/intro.json', 'Compilation must not mutate the manifest.');
for (const reference of ['../intro.json', '/intro.json', './other/../intro.json', 'https://example.com/intro.json', './scenario.json'])
{
  assert.throws(() => loadSections({ ...manifest, intro: reference }), /intro: Use a local JSON section path/);
}
assert.throws(() => loadSections(manifest, {}), /scenario.json: intro: Cannot load.*intro.json/);
assert.throws(() => loadSections(manifest, { ...sectionFiles, './content/intro.json': [] }), /content\/intro.json: intro: Expected an object/);
assert.throws(() => loadSections(manifest, { ...sectionFiles, './hints.json': './nested.json' }), /hints.json: hints: Expected an array/);
assert.throws(() => compile(manifest), /without a JSON section resolver/);
