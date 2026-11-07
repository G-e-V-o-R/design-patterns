# Design Patterns agent guidance

This repository contains design pattern reference material in `docs/` and a Vite/React app in `src/`. The app is a small shell (`src/app/`) that renders independently owned scenarios from `src/scenarios/<id>/`. Each scenario owns its model, validation, simulation, UI, styles, and tests; the registry uses static imports so missing modules fail at build time. Inspect the live repository before assuming a stack or module layout.

## Project agents

- `architecture_planner`: read-only implementation plan before code changes.
- `web_implementer`: scoped implementation after the plan is reviewed.
- `browser_qa`: browser verification and reproduction; does not edit application files.
- `security_reviewer`: security review when requested; does not edit application files.

For every requested web application code change, ask `architecture_planner` for a plan and wait for its result before editing code. Give it the task and relevant constraints. The plan should name affected files, design choices, and verification; a small fix can have a short plan. The main agent reviews the plan and passes it to `web_implementer` or implements it directly. If new facts change the approach, update the plan before continuing.

Delegate independent browser checks when useful. Use `security_reviewer` when the user explicitly requests a security review. Keep edits to a given file with one agent at a time. The main agent coordinates work and verifies the combined result. Run `npm test`, `npm run typecheck`, and `npm run build` before finishing.

When adding a scenario, start with `src/scenarios/REFERENCE_SCENARIO.md`.

## Code style

- In TypeScript and TSX, put the opening `{` of function bodies and `if`/`else` blocks on its own line. Put `else` on its own line as well; do not combine it with the closing brace or its opening brace.
