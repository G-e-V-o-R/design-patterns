# Pattern Workshop

The app contains independently owned learning scenarios: **Observer — the fox’s discovery** and **Mediator — thoughts through the raven**. Both teach patterns through class diagrams and demonstrations.

## Module ownership

Each scenario directory in `scenarios/` owns its content, graph model, validation, simulation, UI, styles, and tests. Shared scenario-neutral resources live in `scenarios/shared/`; scenarios may import from their own directory, `shared/`, or `docs/`, but never from sibling scenarios or `app/`. Change a scenario inside its own folder:

- `scenarios/observer/`: the fox lesson and bracelet demo.
- `scenarios/mediator/`: the raven lesson and targeted request routing.
- `scenarios/shared/`: reusable, pattern-neutral resources used by multiple scenarios.
- `scenarios/registry.ts`: presentation metadata and each scenario’s public component import.
- `scenarios/types.ts`: the small shell contract; no shared graph or simulation model.
- `app/App.tsx`, `app/shell.css`, `app/ScenarioBoundary.tsx`: navigation, page chrome, and per-scenario rendering error containment.
- `app/styles.css`: pattern-neutral base reset and typography shared by the shell and every scenario.

Scenarios must not import sibling scenarios, the shell contract, or application internals. Shared functionality used by multiple scenarios belongs in `scenarios/shared/`; scenario-specific behavior stays in its own directory. Scenarios may also use third-party UI libraries and existing art in `docs/`. Observer CSS is nested under `.observer-scenario`; Mediator CSS is scoped to `.mediator-scenario`. Keep any new rules and animation names local to the scenario unless they are genuinely shared. Shared resources and base styles in `app/styles.css` affect multiple scenarios and require checking all lessons when changed.

## State and new scenarios

Each scenario component owns its own state. Visited scenarios remain mounted in hidden panels, preserving diagrams, history, hints, and demo state when switching. The shell passes `active` so hidden scenarios do not run visibility-dependent behavior. Reset affects only its own scenario. Page reload starts fresh.

To add a scenario:

1. Create `scenarios/<id>/` with its public component, model, scoped styles, and `model.test.ts`.
2. Register its unique ID and component import in `scenarios/registry.ts`. The registry uses static imports so missing or broken modules fail loudly at build time.
3. Add a `test:<id>` script to `package.json` and include it in `npm test`.
4. Run `npm test`, `npm run typecheck`, and `npm run build`.
5. Check completion, switching, reset isolation, keyboard use, and narrow layouts in a browser.

Do not put pattern-specific branches in the shell or make one lesson reuse another lesson’s internals. Extract a shared editor only when it has a stable contract and regression coverage for all consumers. Module isolation limits accidental coupling; shared-library and shell changes still need regression checks.

## Verification

Run `npm run dev`, `npm run build`, and `npm test` with Node 22.12 or newer. Tests cover each lesson’s validation and simulation, and enforce scenario import boundaries, unique registration IDs, matching directory/component ownership, and per-scenario test wiring.
