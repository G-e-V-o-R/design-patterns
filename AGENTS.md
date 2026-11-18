# Design Patterns agent guidance

This repository contains design pattern reference material in `docs/` and a Vite/React app in `src/`. The app is a small shell (`src/app/`) that renders independently owned scenarios from `src/scenarios/<id>/`. New diagram lessons use a small `scenario.json` manifest referencing focused local JSON sections (`intro`, `classes`, `hints`, and optional `relationshipTypes`) plus local artwork; the shared runtime supplies their model, validation, editor, and UI. Optional `Demo.tsx` files own custom simulation behavior. Existing code-based scenarios own their models, validation, simulation, UI, styles, and tests. The registry keeps their static imports and automatically discovers configs and demos with eager imports; Vite validates configs and images at startup/build time. Inspect the live repository before assuming a stack or module layout.

Scenarios may import their own files, shared scenario-neutral resources from `src/scenarios/shared/`, and artwork from `docs/`. Do not import from sibling scenarios or `src/app/`; shared resources must not depend on scenario internals.

## Project agents

- `architecture_planner`: read-only implementation plan before code changes.
- `web_implementer`: scoped implementation after the plan is reviewed.
- `browser_qa`: browser verification and reproduction; does not edit application files.
- `security_reviewer`: security review when requested; does not edit application files.

For every requested web application code change, ask `architecture_planner` for a plan and wait for its result before editing code. Give it the task and relevant constraints. The plan should name affected files, design choices, and verification; a small fix can have a short plan. The main agent reviews the plan and passes it to `web_implementer` or implements it directly. If new facts change the approach, update the plan before continuing.

Delegate independent browser checks when useful. Use `security_reviewer` when the user explicitly requests a security review. Keep edits to a given file with one agent at a time. The main agent coordinates work and verifies the combined result. Run `npm test`, `npm run typecheck`, and `npm run build` before finishing.

When adding a scenario, start with `src/scenarios/REFERENCE_SCENARIO.md`.

## Code style

- In TypeScript and TSX, put the opening `{` of function bodies and `if`/`else` blocks on its own line. Put `else` on its own line as well.
- Format CSS for reading, not compression: one selector block per section, one declaration per line, two-space indentation, and blank lines between unrelated rules. Keep media queries expanded and their nested rules indented. Do not minify or pack whole stylesheets into long lines.
- Keep scenario-specific selectors scoped to that scenario's root class. Put genuinely reusable, scenario-neutral styles in `src/scenarios/shared/`; do not share pattern-specific rules.
- Keep JSX returns easy to scan. Split large repeated or conceptually separate UI sections into small components instead of building one dense markup block.
- Use descriptive names for components, props, and values. Prefer named intermediate values and `if`/`switch` over nested or hard-to-read ternary expressions.
- Use comments only to clarify non-obvious behavior. When a code comment is helpful, write it in Russian for this project.
