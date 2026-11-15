import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';
import { ClassDiagramCard } from '../scenarios/shared/ClassDiagramNode.tsx';
import { withClassArtwork } from '../scenarios/shared/classArtwork.ts';
import { DiagramBuilderPanel } from '../scenarios/shared/DiagramBuilderPanel.tsx';
import { createRelationshipEdge } from '../scenarios/shared/relationships.ts';
import { connectionHandles, createDiagramRelationship, orientConnection } from '../scenarios/shared/connections.ts';

for (const sourceHandle of connectionHandles)
{
  for (const targetHandle of connectionHandles)
  {
    const connection = { source: 'first', target: 'second', sourceHandle, targetHandle };
    const forward = createDiagramRelationship(orientConnection(connection, 'first'), 'delegates');
    assert.deepEqual(forward, { ...connection, type: 'delegates' });
    const reversed = createDiagramRelationship(orientConnection(connection, 'second'), 'delegates');
    assert.deepEqual(reversed, {
      source: 'second', target: 'first', sourceHandle: targetHandle, targetHandle: sourceHandle, type: 'delegates',
    });
  }
}
assert.deepEqual(createDiagramRelationship({ source: 'first', target: 'second' }, 'delegates'), {
  source: 'first', target: 'second', type: 'delegates', sourceHandle: 'bottom', targetHandle: 'top',
});
assert.deepEqual(createDiagramRelationship({
  source: 'first', target: 'second', sourceHandle: 'left-start', targetHandle: 'right-end',
}, 'delegates'), {
  source: 'first', target: 'second', type: 'delegates', sourceHandle: 'left', targetHandle: 'right',
});

const relationships = [
  { id: 'delegates', label: 'delegates work' },
  { id: 'fulfills', label: 'fulfills contract', appearance: 'implementation' },
];
const edge = { source: 'worker', target: 'contract', type: 'fulfills', sourceHandle: 'left', targetHandle: 'right' };
const first = createRelationshipEdge(edge, 2, relationships, 'first', true);
const second = createRelationshipEdge(edge, 2, relationships, 'second');
assert.equal(first.label, 'fulfills contract');
assert.equal(first.sourceHandle, 'left');
assert.equal(first.targetHandle, 'right');
assert.equal(first.style?.strokeDasharray, '6 4');
assert.ok(Number(first.style?.strokeWidth) > Number(second.style?.strokeWidth));
assert.notEqual(first.markerEnd, second.markerEnd, 'Mounted scenarios need distinct marker IDs');
assert.equal(createRelationshipEdge({ ...edge, type: 'missing' }, 0, relationships, 'first').label, 'Unknown relationship: missing');
assert.equal(createRelationshipEdge({ ...edge, type: 'delegates' }, 0, relationships, 'first').style?.strokeDasharray, undefined);

const markup = renderToStaticMarkup(createElement(ReactFlowProvider, null,
  createElement(ClassDiagramCard, {
    label: 'CustomContract',
    kind: 'interface',
    variant: 'interface',
    members: [
      { id: 'state', kind: 'field', label: 'state: Value' },
      { id: 'work', kind: 'method', label: 'perform()' },
    ],
    artwork: { src: '/custom-art.png', alt: 'Custom artwork' },
    handles: [],
    dragType: 'application/custom-member',
    isDropTarget: false,
    onRemove: () => {},
    onAssign: () => {},
    onDragHover: () => {},
  }),
));
assert.match(markup, /is-interface/);
assert.match(markup, /CustomContract/);
assert.match(markup, /state: Value/);
assert.match(markup, /perform\(\)/);
assert.match(markup, /src="\/custom-art.png"/);
assert.ok(markup.indexOf('state: Value') < markup.indexOf('Methods'));
assert.ok(markup.indexOf('perform()') > markup.indexOf('Methods'));

const tray = renderToStaticMarkup(createElement(DiagramBuilderPanel, {
  classes: [{ id: 'worker', kind: 'class', variant: 'class', artwork: { src: '/worker.png', alt: 'Worker' }, label: 'Worker', description: 'Does work' }],
  members: [{ id: 'work', kind: 'method', label: 'perform()' }],
  placedClasses: ['worker'],
  assignments: {},
  category: 'methods',
  onCategoryChange: () => {},
  draggedMemberId: null,
  hints: ['First hint', 'Second hint'],
  hintIndex: 0,
  onAddClass: () => {},
  onStartDrag: () => {},
  onShowHint: () => {},
  onShowSolution: () => {},
}));
assert.match(tray, /1\/1 classes/);
assert.match(tray, /Show hint 2 \/ 2/);
assert.match(tray, /First hint/);
assert.doesNotMatch(tray, /<select|Assign to/);
assert.match(tray, /draggable="true"/);
console.log('Shared templates: configured members, artwork, relationships, selection, and marker isolation passed.');

const { RelationshipList } = await import('../scenarios/shared/RelationshipList.tsx');
const { LessonStatus, LessonAction } = await import('../scenarios/shared/LessonLayout.tsx');
const { StoryIntro } = await import('../scenarios/shared/StoryIntro.tsx');
const relations = renderToStaticMarkup(createElement(RelationshipList, {
  edges: [edge],
  relationships,
  classLabel: id => ({ worker: 'Worker', contract: 'Contract' })[id],
  onRemove: () => {},
}));
assert.match(relations, /Worker.*→ fulfills contract →.*Contract/);
assert.match(relations, /aria-label="Remove arrow 1: Worker → fulfills contract → Contract"/);
assert.equal(renderToStaticMarkup(createElement(RelationshipList, {
  edges: [], relationships, classLabel: id => id, onRemove: () => {},
})), '');
const status = renderToStaticMarkup(createElement(LessonStatus, null, 'Connect your classes'));
assert.match(status, /role="status"/);
assert.match(status, /Connect your classes/);
const action = renderToStaticMarkup(createElement(LessonAction, {
  label: 'Run custom demo', description: 'Custom explanation', ready: false, onRun: () => {},
}));
assert.match(action, /disabled=""/);
assert.match(action, /Run custom demo/);
const intro = renderToStaticMarkup(createElement(StoryIntro, {
  content: {
    number: '99', title: 'Custom story', pattern: 'Custom pattern', headingId: 'custom-heading',
    artwork: { src: '/custom-intro.png', alt: 'Custom illustration' }, caption: 'Custom caption',
    paragraphs: ['First paragraph', 'Second paragraph'], task: 'Custom task', concept: 'Custom concept',
    steps: ['First custom step', 'Second custom step'],
  },
}));
assert.match(intro, /src="\/custom-intro.png"/);
assert.match(intro, /id="custom-heading"/);
assert.match(intro, /First paragraph/);
assert.match(intro, /Second custom step/);
assert.doesNotMatch(intro, /Add class cards/);
const explicitVariant = renderToStaticMarkup(createElement(ReactFlowProvider, null,
  createElement(ClassDiagramCard, {
    label: 'Port', kind: 'Contract', variant: 'interface', members: [], handles: [],
    dragType: 'application/custom-member', isDropTarget: false,
    onRemove: () => {}, onAssign: () => {}, onDragHover: () => {},
  }),
));
assert.match(explicitVariant, /is-interface/);
console.log('Shared templates: custom intro, explicit interface variant, relationship list, status, and gated action passed.');

const invalidMemberMarkup = renderToStaticMarkup(createElement(ReactFlowProvider, null,
  createElement(ClassDiagramCard, {
    label: 'Worker', kind: 'class', variant: 'class',
    artwork: { src: '/worker.png', alt: 'Worker' },
    members: [
      { id: 'state', kind: 'field', label: 'state: Value' },
      { id: 'work', kind: 'method', label: 'perform()' },
    ],
    invalidMemberIds: new Set(['state']),
    handles: [], dragType: 'application/custom-member', isDropTarget: false,
    onRemove: () => {}, onAssign: () => {}, onDragHover: () => {},
    onStartMemberDrag: () => {},
  }),
));
assert.match(invalidMemberMarkup, /is-invalid[^>]*title="Assigned to the wrong class"[^>]*draggable="true"[^>]*><span>−<\/span><code>state: Value/);
assert.equal((invalidMemberMarkup.match(/is-invalid/g) ?? []).length, 1);
assert.doesNotMatch(markup, /is-invalid/);

const invalidSolid = createRelationshipEdge({ ...edge, type: 'delegates' }, 0, relationships, 'first', false, true);
const invalidImplementation = createRelationshipEdge(edge, 0, relationships, 'first', true, true);
assert.equal(invalidSolid.style.stroke, invalidSolid.markerEnd.color);
assert.notEqual(invalidSolid.style.stroke, second.style.stroke);
assert.equal(invalidSolid.style.strokeWidth, 3);
assert.equal(invalidImplementation.style.strokeWidth, 4.5);
assert.equal(invalidImplementation.style.strokeDasharray, '6 4');
assert.notEqual(invalidImplementation.markerEnd, first.markerEnd);
assert.ok(invalidImplementation.labelBgStyle.fill);
const { RelationshipMarkers } = await import('../scenarios/shared/RelationshipTools.tsx');
const markers = renderToStaticMarkup(createElement(RelationshipMarkers, { relationships, namespace: 'first' }));
assert.ok(markers.includes(`id="${invalidImplementation.markerEnd}"`));
assert.ok(markers.includes(`stroke="${invalidImplementation.style.stroke}"`));
const invalidRelations = renderToStaticMarkup(createElement(RelationshipList, {
  edges: [edge], relationships, classLabel: id => id, onRemove: () => {},
  invalidEdgeIndices: new Set([0]),
}));
assert.match(invalidRelations, /class="is-invalid"/);
assert.doesNotMatch(relations, /is-invalid/);
console.log('Shared feedback: drag-only cards, misplaced members, invalid arrows, markers, and relationship rows passed.');

const classDefinitions = [
  { id: 'worker', label: 'Worker', kind: 'concrete worker', variant: 'class', description: 'Works' },
  { id: 'contract', label: 'Contract', kind: 'contract', variant: 'interface', description: 'Defines work' },
];
const artwork = { worker: { src: '/worker.png', alt: 'Worker at work' } };
const presentedClasses = withClassArtwork(classDefinitions, artwork);
assert.equal(presentedClasses[0].artwork, artwork.worker);
assert.equal(presentedClasses[1].artwork, undefined);
assert.throws(() => withClassArtwork(classDefinitions, {}), /Worker.*requires an image/);
assert.throws(() => withClassArtwork(classDefinitions, { worker: { src: ' ', alt: 'Worker' } }), /requires an image/);
assert.throws(() => withClassArtwork(classDefinitions, { worker: { src: '/worker.png', alt: ' ' } }), /alternative text/);
const cardProps = {
  label: 'Worker', kind: 'concrete worker', variant: 'class', members: [], handles: [],
  dragType: 'application/custom-member', isDropTarget: false,
  onRemove: () => {}, onAssign: () => {}, onDragHover: () => {},
};
assert.throws(() => renderToStaticMarkup(createElement(ReactFlowProvider, null,
  createElement(ClassDiagramCard, cardProps),
)), /Worker.*requires an image/);
const concreteCard = renderToStaticMarkup(createElement(ReactFlowProvider, null,
  createElement(ClassDiagramCard, { ...cardProps, artwork: artwork.worker }),
));
assert.match(concreteCard, /src="\/worker.png"/);
assert.doesNotMatch(explicitVariant, /<img/);

const trayProps = {
  classes: presentedClasses,
  members: [
    { id: 'state', kind: 'field', label: 'state: Value' },
    { id: 'work', kind: 'method', label: 'perform()' },
  ],
  placedClasses: [], assignments: {}, onCategoryChange: () => {}, draggedMemberId: null,
  hints: [], hintIndex: -1, onAddClass: () => {}, onStartDrag: () => {},
  onShowHint: () => {}, onShowSolution: () => {},
};
for (const category of ['classes', 'fields', 'methods'])
{
  const rendered = renderToStaticMarkup(createElement(DiagramBuilderPanel, { ...trayProps, category }));
  assert.match(rendered, />Classes &amp; interfaces<\/button>/);
  assert.match(rendered, />Fields<\/button>/);
  assert.match(rendered, />Methods<\/button>/);
  assert.doesNotMatch(rendered, /<select|Fields &amp; methods/);
  assert.equal(rendered.includes('state: Value'), category === 'fields');
  assert.equal(rendered.includes('perform()'), category === 'methods');
}
console.log('Shared contracts: required concrete artwork, interface exemption, and separate fixed member tabs passed.');
