# Reference scenario: adding a new one

Observer is the reference implementation. Mediator is the second example. Copy the structure, not the story or vocabulary.

## Agent workflow

Shortest reliable path:

1. Read `observer/ObserverScenario.tsx`, `observer/model.ts`, and `observer/model.test.ts`.
2. Read `observer/ObserverLesson.tsx`, `observer/useObserverLesson.ts`, and the extracted components to see the expected decomposition.
3. Write the new model and its tests first.
4. Build the UI against the tested model.
5. Register the scenario and add its test script.
6. Run the checks below.

Do not read every component before starting. The model and tests define the behavior; the UI structure is defined by the decomposition below.

## Required file set

```text
src/scenarios/<id>/
  <Pattern>Scenario.tsx   thin public entry point; owns scenario state
  <Pattern>Lesson.tsx     lesson orchestrator; composes the UI
  model.ts                cards, solutions, validation, simulation
  model.test.ts           standalone model tests
  <pattern>.css           styles scoped to the scenario root
```

Decompose the lesson further by responsibility. Observer is the reference:

```text
  use<Pattern>Lesson.ts   stateful editor logic and handlers
  <Pattern>ClassDiagramNode.tsx React Flow node renderer with a descriptive name
  <Pattern>Diagram.tsx    React Flow canvas and diagram controls
  <Pattern>Demo.tsx       pattern-specific demonstration
  <Pattern>Intro.tsx      story and instructions
  <Pattern>Tray.tsx       card tray
```

Do not keep the whole lesson in one component. `<Pattern>Lesson.tsx` should read as composition and view wiring, not contain the full UI and all behavior. Extract content, node rendering, presentational sections, and stateful logic into focused files. The exact boundaries can vary, but a monolith is not acceptable.

## Public entry contract

The registry imports the default export. The shell passes `active`, which tells a scenario whether it is visible.

```tsx
import { useState } from 'react';
import { emptyLesson } from './model';
import { PatternLesson } from './PatternLesson';
import './pattern.css';

export default function PatternScenario({ active = true }: { active?: boolean }) {
  const [graph, setGraph] = useState(emptyLesson);
  return <div className="pattern-scenario"><PatternLesson active={active} graph={graph} onChange={setGraph}/></div>;
}
```

Rules:

- The scenario owns its mutable state.
- Pass `active` to visibility-dependent effects such as React Flow `fitView`.
- Use one root class for scoped styles, e.g. `pattern-scenario`.
- Do not import from `src/app/`, `src/scenarios/types.ts`, `src/scenarios/registry.ts`, or another scenario.

## Model contract

Keep the model independent of React.

Typical graph:

```ts
export type PatternGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: { source: string; target: string; type: string }[];
};
```

The model should export:

- `classCards`, `memberCards`, `relationshipKinds`
- `emptyLesson()`
- `solutionLesson()`
- `getLessonIssues(graph)`
- `validateLesson(graph)` as a convenience wrapper
- `hints`
- `simulateLesson(...)` or an equivalent demo function
- optional `parseLesson(...)` only if saved input is accepted

Issues must identify what to fix:

```ts
export type Issue = {
  message: string;
  classIds: string[];
  memberIds: string[];
  edgeIndices: number[];
};
```

Rules:

- `solutionLesson()` returns fresh objects on every call.
- Validation accepts cards in any order but checks expected ownership and relationships.
- Report missing, misplaced, duplicate, reversed, and extra members or edges.
- Do not produce a success-shaped simulation result for an invalid graph.
- Do not mutate the input graph.
- Keep all ids unique and stable.

## Test contract

`model.test.ts` runs directly with `tsx`; there is no test framework. Use a local `assert` helper like Observer does.

Test at least:

- the canonical solution has no issues;
- an empty graph has issues;
- each missing class, member, and relationship produces a targeted issue;
- misplaced members are reported on both the member and the expected class;
- reversed, extra, and duplicate relationships are rejected;
- simulation succeeds only for a valid graph;
- every meaningful demo outcome, including a no-op or contrasting case;
- `solutionLesson()` does not share mutable state;
- parser tests if the model accepts external input.

End with a readable pass message.

## Registration and test wiring

Add a static import and entry in `src/scenarios/registry.ts`:

```ts
import PatternScenario from './pattern/PatternScenario';

export const scenarios = [
  { id: 'pattern', number: '03', title: 'Story title', pattern: 'Pattern', Component: PatternScenario },
] as const satisfies readonly ScenarioDefinition[];
```

Add scripts to `package.json`:

```json
"test:pattern": "tsx src/scenarios/pattern/model.test.ts",
"test": "npm run test:boundaries && npm run test:observer && npm run test:mediator && npm run test:pattern"
```

The boundary test enforces:

- every scenario directory owns `model.test.ts`;
- scenario imports stay inside that directory or `docs/`;
- every directory has exactly one registry entry;
- every registry entry imports from its own directory;
- every scenario has a `test:<id>` script included in `npm test`.

## UI guidance

For a diagram lesson, Observer shows the expected split:

- `ObserverDiagram` owns React Flow and `fitView`.
- `ObserverClassDiagramNode` owns the Observer node shape; name node renderers descriptively for each scenario.
- `ObserverDiagramBuilderPanel`, `ObserverIntro`, `ObserverRelations`, and `ObserverActions` are presentational.
- `useObserverLesson` owns history, issues, hints, solution, and demo invalidation.
- `ObserverLesson` keeps view-only state and connects the pieces.

When extracting:

- preserve existing DOM structure, class names, `aria-*`, and button text;
- keep behavior-changing logic out of presentational components;
- keep visibility-dependent effects behind `active`;
- do not introduce a shared runtime abstraction across scenarios.

## Common mistakes

- Importing model helpers from another scenario.
- Forgetting `model.test.ts` or the `test:<id>` script.
- Adding the directory but not registering it.
- Registering it but importing from the wrong path.
- Forgetting to pass `active`.
- Returning shared mutable objects from `solutionLesson()`.
- Returning a successful demo result for an invalid graph.
- Reporting only a generic “invalid diagram” message without ids.
- Not testing reversed, extra, and duplicate relationships.
- Keeping the whole lesson in one component.
- Putting pattern-specific branches in the shell.

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
