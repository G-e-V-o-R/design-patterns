# Shared lesson templates

## Config-only lessons

New diagram lessons use a small `scenario.json` manifest, referenced JSON sections, and local `resource/` images. Start with [the authoring guide](../REFERENCE_SCENARIO.md). The shared config compiler, graph validator, editor, and `ConfiguredScenario` render the whole activity. Automatic discovery happens outside shared code in the scenario registry. Optional scenario-local `Demo.tsx` supplies custom behavior through the shared demo props. Existing custom lessons can continue using the lower-level components below.

Observer, Mediator, and Chain use this UI kit. Change the shared components or `lesson.css` once to change all three designs. Pattern-specific data, validation, graph state, and demonstrations remain in their own scenario folders.

## Content and artwork

Each scenario defines local resource paths and intro copy in `scenario.json`. The config compiler supplies this plain content contract to the shared presentation:

```tsx
import introImage from './resource/intro.png?url';
import type { IntroContent } from '../shared/lessonTypes';

export const introContent = {
  number: '03',
  title: 'A new story',
  pattern: 'Pattern name',
  category: 'BEHAVIORAL PATTERN',
  headingId: 'new-pattern-heading',
  artwork: { src: introImage, alt: 'Describe the illustration' },
  caption: 'One short caption',
  paragraphs: ['The problem.', 'How the pattern helps.'],
  task: 'Build the diagram.',
  concept: 'The main idea in plain language.',
} satisfies IntroContent;
```

Render `<StoryIntro content={introContent} />` and `<ConceptCallout>{introContent.concept}</ConceptCallout>`. The image-left desktop layout, mobile stacking, title, task, and step strip are shared.

## Classes, fields, and methods

`ClassDiagramCard` receives `label`, `kind`, optional `artwork`, and a `members` array. Members have `id`, `label`, and `kind: 'field' | 'method'`; an optional description is used in the tray. Both classes and interfaces use the same card, automatically grouped into Fields and Methods. Use `variant: 'class' | 'interface'` for explicit styling; `kind` is the displayed role label.

```tsx
const members = [
  { id: 'items', label: 'items: Item[]', kind: 'field' },
  { id: 'run', label: 'run()', kind: 'method' },
];
```

The scenario adapter supplies removal/assignment callbacks and its drag MIME type. Handle configuration is optional. Use optional assigned-member drag callbacks when the scenario allows moving members between cards. Cards share a 260px width; place rows far enough apart to fit artwork and members. `DiagramBuilderPanel` renders the same class/member arrays, supplied category definitions, hints, and callbacks. Member assignment uses drag and drop only; `hideAssignedMembers` supports trays showing only unassigned cards. Pass `invalidMemberIds` to `ClassDiagramCard` to highlight misplaced members using the configured graph validator.

## Arrows and canvas

Supply `RelationshipDefinition[]`: `id`, `label`, optional `toolLabel`, and `appearance: 'solid' | 'implementation'`. `ClassDiagramCanvas` renders the relationship tools and SVG markers from that array. `createRelationshipEdge(edge, index, definitions, namespace, selected, invalid)` supplies matching labels and arrow styles. Use the same namespace for the canvas and edges, unique for each mounted scenario. The shared code does not infer semantics from pattern-specific IDs.

`ClassDiagramCanvas` owns click and drag connection direction: the first selected port is always the source and the second is the target. Its `onConnect` callback receives the complete connection, including both handle IDs; scenarios do not track connection starts or swap endpoints. Pass this object to the editor's `connect(connection, relationshipType)` handler and store `createDiagramRelationship(connection, relationshipType)` from `shared/connections.ts` after configured editor validation. Use the shared `DiagramRelationship` type in graph models. Do not reconstruct an edge from just its class IDs, which would discard the selected ports.

The shared edge renderer preserves selected ports and normalizes old `side-start/end` IDs. Edges without explicit ports, including example solutions and card-body connections, default to bottom → top. History and saved graphs keep endpoint IDs together with the relationship.


## Workspace

`LessonWorkspace` accepts a tray and board children. `BoardToolbar` accepts counts and undo/reset callbacks; `SolutionNotice` shows scenario-provided solution guidance. Compose the scenario's validation status and demonstration inside the board. `lesson.css` is the single source for intro, workspace, tray, canvas, card, and toolbar dimensions and responsive styles.

For the reusable adapters, see `ConfiguredLessonWorkspace.tsx` and `ConfiguredClassNode.tsx`; lesson-specific data comes from each `scenario.json`. Shared files must never import scenario models, scenario resources, or app-shell files.

## Start a new pattern with data

Use the [Observer config](../observer/config/scenario.json) as a reference for a new scenario's manifest and section files. The configured runtime imports the shared styles and supplies the node, canvas, tray, relationships, validation, and history adapters. Do not copy those adapters into the scenario.

For a custom demonstration, add `Demo.tsx` with a default export accepting `ConfiguredDemoProps`. Observer, Mediator, and Chain show how to separate demo state, simulation, presentation, and scoped styles. Their demo models validate graphs against the same JSON through `configuredLessonModel` before simulating.

## What to change where

| Desired change | File/data |
| --- | --- |
| Story illustration, title, paragraphs, task, steps | `scenario.json`: title and intro |
| Class/interface names, roles, descriptions | `scenario.json`: classes |
| Per-class image and alternative text | `scenario.json`: classes[].image and imageAlt |
| Fields, methods, and their owners | `scenario.json`: nested fields and methods |
| Expected directed arrows | `scenario.json`: classes[].relationships |
| Custom arrow labels and appearance | `scenario.json`: relationshipTypes |
| Initial card positions | `scenario.json`: classes[].position |
| Common dimensions, spacing, typography, responsive layout | `shared/lesson.css` and `shared/artwork.css` |
| Graph validation and generated solution | `shared/configuredLessonModel.ts` |
| Editing and history | `shared/useConfiguredLesson.ts` |
| Custom simulation and demonstration | Scenario-local `Demo.tsx` and demo helpers |

`ConfiguredLessonWorkspace` passes targeted feedback from the shared validator to class cards, edges, and relationship rows. Keep shared validation and rendering free of pattern-specific branches. See `REFERENCE_SCENARIO.md` for authoring and verification requirements.

Config sections (`intro`, `classes`, `hints`, and optional `relationshipTypes`) may be inline values or local JSON paths. The compiler accepts a fourth argument to resolve referenced sections, shared by browser registration, build validation, and demo config loaders. See [the section format](../REFERENCE_SCENARIO.md).
