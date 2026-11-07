# Pattern Workshop

The app contains independently owned learning scenarios: **Observer — the fox’s discovery** and **Mediator — thoughts through the raven**. Both teach patterns through class diagrams and demonstrations. Project introduction work is deferred.

## Module ownership

Each directory in `scenarios/` owns its content, graph model, validation, simulation, UI, styles, and tests. Change a scenario inside its own folder:

- `scenarios/observer/`: the existing fox lesson and bracelet demo.
- `scenarios/mediator/`: the raven lesson and targeted request routing.
- `scenarios/registry.ts`: presentation metadata and each scenario’s public component.
- `scenarios/types.ts`: the small shell contract; no shared graph or simulation model.
- `app/App.tsx`, `app/shell.css`, `app/ScenarioBoundary.tsx`: navigation, page chrome, and per-scenario rendering error containment.

Scenarios must not import sibling scenarios or application internals. They may use third-party UI libraries and existing art in `docs/`. Observer CSS is nested under `.observer-scenario`; Mediator CSS is scoped to `.mediator-scenario`. Keep any new rules and animation names local to the scenario. Shared base styles in `app/styles.css` and shell styles affect all scenarios and require checking both lessons when changed.

The legacy `application/observer-lesson.ts` re-exports the Observer model for compatibility. New scenarios must not use it. Previous story, map, journal, chapter content, and save modules remain inactive reference code.

## State and new scenarios

Each scenario component owns its own state. Visited scenarios remain mounted in hidden panels, preserving diagrams, history, hints, and demo state when switching. Hidden panels are excluded from interaction and accessibility navigation. Reset affects only its own scenario. Page reload starts fresh; no old saves are read or overwritten.

To add a scenario:

1. Create `scenarios/<id>/` with its public component, model, scoped styles, and model tests.
2. Register its component and unique ID in `scenarios/registry.ts`.
3. Add its test entry to `package.json`; run all tests and the build.
4. Check completion, switching, reset isolation, keyboard use, and narrow layouts in a browser.

Do not put pattern-specific branches in the shell or make one lesson reuse another lesson’s internals. Extract a shared editor only when it has a stable contract and regression coverage for all consumers. Module isolation limits accidental coupling; shared-library and shell changes still need regression checks.

## Verification

Run `npm run dev`, `npm run build`, and `npm test` with Node 22.12 or newer. Tests cover each lesson’s validation and simulation, existing story contracts, and enforce scenario import boundaries and unique registration IDs.
