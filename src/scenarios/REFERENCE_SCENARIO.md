# Adding a scenario

## Recommended: a manifest and focused content files

Use the [Observer config](./observer/config/scenario.json) as a reference for the manifest, content files, and artwork. The manifest `id` must equal the scenario directory name.

Keep `scenario.json` focused on metadata and local section references:

```json
{
  "id": "example",
  "number": "04",
  "title": "Example lesson",
  "pattern": "Example pattern",
  "intro": "./intro.json",
  "classes": "./classes.json",
  "hints": "./hints.json"
}
```

- `intro.json` contains the story object: paragraphs, image, task, and optional category, imageAlt, caption, concept, and three steps.
- `classes.json` contains the class/interface array. Keep fields, methods, and positions nested inside their owning class. Use `position` for the starting position in the editor and optional `solutionPosition` for the compact worked example. Set `"anchorY": "center"` in the solution positions of cards that should share a midpoint at the same y-coordinate. Cards with the same solution y-coordinate connect from their sides. Cards on different rows connect from their top or bottom. Each class or interface lists its expected outgoing arrows in `relationships`, with a `type` and a `target` class ID for each arrow. Use `"relationships": []` when there are no outgoing arrows.
- `hints.json` contains an array of progressive hint strings.
- Optional `relationshipTypes` can reference `./relationships.json`, an array of custom relationship definitions. `implements` and `uses` are built in. The toolbar offers a relationship type only when a class declares an arrow of that type in `classes.json`.

Each section can also remain inline. References must start with `./`, end with `.json`, and stay inside the scenario directory; nested folders are supported. Section files contain the section value directly, without a wrapper key. Includes are not recursive. Artwork paths remain relative to the scenario directory, even when a content file lives in a subfolder.

Shared code supplies state, history, validation, solution generation, card and arrow interactions, and layout. Registration, asset bundling, and generic model checks are automatic; do not edit the registry or package scripts for a config-only scenario. Development validation refreshes when any scenario JSON file changes.

An optional scenario-local `Demo.tsx` default export receives `ConfiguredDemoProps` and is discovered automatically. A plain config lesson has completion feedback without a simulated runtime demo. Novel simulation behavior still belongs in scenario code.

`shared/scenarioConfig.ts` validates content, `shared/configuredLessonModel.ts` validates learner graphs, and the `Configured*` components plus `useConfiguredLesson.ts` implement the reusable workspace. Instances own independent graph/history state. Shared code contains no pattern-specific branches.

## Existing examples

[Observer](./observer/config/scenario.json), [Mediator](./mediator/config/scenario.json), and [Chain](./chain/config/scenario.json) use the shared configured runtime and supply custom demonstrations.

## File layout

```text
src/scenarios/<id>/
  scenario.json          metadata and section references
  intro.json             story, task, artwork, concept, steps
  classes.json           cards, members, arrows, positions
  hints.json             progressive hints
  relationships.json     optional custom relationship types
  config.ts              optional typed loader for demo code
  resource/              local artwork
  Demo.tsx               optional default export accepting ConfiguredDemoProps
  demoModel.ts           optional framework-independent simulation
  demoModel.test.ts      simulation tests, when a demo model exists
  styles.css             optional styles scoped to the demo root
```

A demo may have focused presentation helpers such as Observer's `NotificationDemo.tsx`. Do not copy editors, diagram validators, canvases, or lesson workspace components into a scenario. Shared `ConfiguredScenario`, `ConfiguredLessonWorkspace`, `useConfiguredLesson`, and `configuredLessonModel` own those responsibilities.

## Agent workflow

1. Read a matching existing manifest and its content files.
2. Define metadata in `scenario.json` and story, diagram, and hints in their referenced files. Keep stable, unique IDs and put each member inside its owning class.
3. If simulation is useful, add a default-exported `Demo.tsx` receiving `graph`, `ready`, and `active` from `ConfiguredDemoProps`.
4. Keep simulation rules and tests local; use the shared configured graph validator instead of reimplementing lesson validation. Derive card labels and artwork metadata from the config when the demo needs them. For direct TypeScript use, follow `observer/config.ts`: statically import section JSON and pass a lookup as the fourth argument to `compileScenarioConfig`.
5. Run the checks and browser flows below.

## Demo lifecycle and tests

- The shared runtime mounts the demo only for a valid diagram; invalidation unmounts it and clears stale results.
- Clear displayed results when the graph changes. Preserve demo state when only switching scenarios.
- Gate timers, animation, and layout/resize effects with `active`. Respect reduced motion and expose outcomes as readable status text.
- Keep simulation independent of React and do not mutate the graph. Invalid graphs must not produce successful simulation results.
- Test every meaningful outcome, including safe/unmatched cases, subscription changes, first-match stopping, or other pattern-specific behavior.
- Add a `test:<id>` script for custom demo tests and include it in `npm test`. Config validation, artwork checks, generated solutions, and generic diagram checks are already automatic.

## Registration and boundaries

`registry.ts` discovers `scenario.json`, local resources, and optional `Demo.tsx` exports eagerly. Config IDs must match their directory names. Set `number` to preserve a specific lesson order. Do not add static registry entries for configured lessons.

Scenarios may import their own files and scenario-neutral resources from `shared/`. Shared resources must not depend on scenario internals or the app shell. Keep pattern-specific artwork in the scenario's `resource/` directory, retaining documentation copies where needed.

## Intro panel visual contract

The Observer and Mediator intros share one composition. Future scenarios must preserve this layout and styling, changing only scenario copy, artwork, caption, and pattern-specific terminology:

- Render one framed intro panel containing the story/task copy and one `figure` with meaningful `img` alt text and a short `figcaption`.
- At desktop/tablet widths, place the large illustration in the **left** column and the story in the **right** column. Use a two-column grid with proportions close to `0.55fr / 1.45fr`; do not shrink the image into a small thumbnail or put it after the story.
- Give the whole panel a 1px subtle green border (`#aec79d26`), 12px rounded corners, clipped contents, and dark green text-panel background (`#1b2823`). Pad the copy by 32px on wide screens.
- Keep the copy hierarchy and sizing consistent: uppercase 10px scenario/pattern kicker (`#d2b980`, 1.8px letter spacing); prominent title at `clamp(28px, 3vw, 43px)` and 1.2 line height; small outlined 12px pattern-name pill; story paragraphs at 16px/1.75 in muted green (`#bbc6b6`) with 12px between paragraphs; and a clearly emphasized “Your task” instruction with warm gold emphasis (`#e1c38d`).
- The image fills a tall portrait region (approximately `aspect-ratio: 0.69`) with `object-fit: contain` over dark green (`#12231c`). Fade the 11px caption into the bottom of the image; do not crop important artwork.
- Follow the intro with a compact, three-step horizontal strip using a top border and generous spacing, then the lesson workspace. Place the main-idea/concept callout after the interactive lesson content.
- At tablet widths (up to 1050px), retain both columns, use a minimum 220px image column, and reduce copy padding to 24px. At widths up to 720px, stack the copy above the illustration, use 24px 20px copy padding, keep the illustration visible at roughly 82% width, reduce the title to 30px and body copy to 14px, and space the steps evenly. Ensure the content does not overflow. Never hide the intro artwork on mobile.
- Scope intro selectors to the scenario root and intro classes. Match the reference spacing, typography, colors, borders, and responsive breakpoints rather than inventing a new per-pattern card style.

For exact markup and CSS, use `shared/StoryIntro.tsx` and `shared/lesson.css`. Scenario configs supply content to that template; change the shared files once to update both.

## User-facing UX consistency contract

From the learner's point of view, every scenario should feel like another lesson in the same workshop, not a separate app. Keep the same navigation, lesson progression, workspace structure, control placement, interaction conventions, and feedback behavior. Change the story, pattern vocabulary, diagram data, and demo behavior—not the way users operate the workshop.

### Workshop navigation and lesson order

- Use the shared app shell for the workshop header, scenario navigation, skip link, and footer. Do not build scenario-specific navigation or duplicate shell elements inside a scenario.
- Keep each scenario's content in this order: intro panel; three numbered orientation steps; diagram-building workspace; main-idea/concept callout.
- Keep the scenario selector and workspace behavior consistent when switching patterns. Each scenario owns its own state; switching scenarios must not unexpectedly clear another scenario's in-memory progress or run effects for a hidden scenario.

### Workspace layout and controls

- Preserve the same desktop workspace arrangement: builder/tray on the left and diagram board on the right. On narrow screens, stack these regions in a predictable order without hiding lesson functionality.
- Keep the builder's card-category controls, card list, hint, and solution controls together in the tray. Use consistent labels and interaction patterns for adding classes and assigning fields/methods. Pattern-specific card counts and class names may differ.
- Keep the board heading and progress summary at the top of the board. Place `Undo` and `Reset` together in the same location in every scenario; disable `Undo` when there is no undo history.
- Keep diagram controls attached to the diagram board. Relationship creation, movement, deletion, and other editing operations should use the same discoverable interaction conventions across scenarios.
- Treat relationship arrows as a core part of the learner experience, not as incidental diagram decoration:
  - Keep the relationship-tool group inside the diagram canvas at the bottom-left. Include a `Move` mode and one clearly labelled, keyboard-operable tool per relationship type, each with a small visual preview of its line and arrowhead.
  - Selecting a relationship tool enters drawing mode. Clearly indicate the selected tool and provide a live instruction: select the source class, then the target class; `Escape` or `Move` cancels drawing mode. Preserve the same sequence and status placement in every scenario.
  - Arrows are directed: the arrowhead points from source to target. Preserve that direction in the graph model, visible edge, accessible label, validation, and demo semantics. Never silently reverse an edge to make an invalid solution pass.
  - Make each relationship type visually distinguishable and consistent between its toolbar preview and canvas edge. Follow the established convention: solid line with a closed arrowhead for ordinary relationships; dashed line with an open/hollow arrowhead for `implements`. Put the relationship label on the edge so meaning does not depend on color or arrow shape alone.
  - Keep arrow selection/deletion discoverable: clicking an edge selects it, selected state is visible, and the relationship list gives each edge a labelled remove action. Keyboard deletion must work as well as pointer deletion.
  - Validate expected direction, type, endpoints, and multiplicity. Give targeted feedback for missing, reversed, duplicate, self-referencing, unknown, and extra arrows; keep invalid arrows visible and identifiable so the learner can correct them. Test these cases in the model tests.
- Keep validation/status feedback immediately after the diagram and before the interactive demo. Keep the demo in the board/workspace flow, after the learner has built and validated the diagram; do not make users search for a scenario-specific location.
- Keep hints progressive and discoverable, and keep `Show solution` in the builder tray. Loading the solution must be clearly identified as an example/solution state, not as the learner having independently completed the task.
- Use consistent control labels, disabled/loading/ready states, confirmation behavior for destructive actions, status-message placement, focus behavior, and keyboard support. Do not rename or relocate common controls without a clear usability reason applied consistently to the reference scenarios too.

### Consistency with room for pattern differences

- Reuse the same panel/card surfaces, typography scale, spacing rhythm, border/radius treatment, button hierarchy, muted/gold color roles, focus indicators, and status/feedback styling defined by Observer and Mediator.
- Keep component placement and sequence consistent even when a scenario needs a different demo. The demo content, controls, animation, and outcome may express that pattern, but use the same heading/intro/status conventions and remain in the same workspace position.
- Keep step-strip ordering and number of steps consistent. Wording may reflect each pattern's task, but use short action-oriented labels that describe the same progression: add/assign diagram elements, connect the diagram, then test the pattern.
- Preserve the same behavior and layout at desktop, tablet, and mobile breakpoints. Stack rather than remove content or controls, prevent horizontal overflow, and maintain a usable tap target and reading order.
- Keep patterns accessible in the same way: semantic headings and regions, labelled controls, useful `aria-*` states, visible keyboard focus, keyboard-operable actions, and announced validation/demo status. Do not rely on color or drag-and-drop alone; provide an accessible alternative for essential actions.

When adding or changing a scenario, compare the rendered experience side by side with Observer and Mediator at desktop and mobile widths. A scenario-specific difference should be intentional, explained by the pattern, and not force the learner to relearn the workshop UI.

## Shared interaction and accessibility rules

When extracting components or applying the visual contract:

- preserve meaningful DOM structure, class names, `aria-*` attributes, keyboard behavior, and button labels;
- keep behavior-changing logic in the model/editor/workspace, not in presentation-only components;
- keep visibility-dependent effects behind `active`;
- keep status and validation feedback visible and specific; do not make an invalid diagram appear ready or successful;
- maintain usable keyboard controls and narrow layouts;
- reuse the stateless presentation templates in `src/scenarios/shared/`; keep lesson state and validation in the configured runtime and custom simulation in the scenario. Do not create a shared pattern-specific runtime engine.

## Common mistakes

- Importing another scenario's internals.
- Duplicating diagram definitions or validation in demo code.
- Adding a static registry entry for a discovered config.
- Forgetting demo tests or allowing an invalid graph to simulate successfully.
- Running hidden-scenario timers or layout effects.
- Retaining demo results after the graph changes.
- Omitting local artwork or informative alt text for concrete classes.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

Then check in a browser:

- initial state;
- incomplete and incorrect diagrams;
- every hint and the solution;
- every demo case, including the contrasting case;
- reset and undo;
- keyboard use and narrow layout;
- switching scenarios preserves state and does not run hidden-scenario effects.

## Shared presentation

The configured runtime uses the stateless templates documented in [shared/README.md](./shared/README.md). Change common workspace behavior there once for every lesson. Only custom demonstration behavior needs scenario-specific implementation.
