# Design Patterns agent guidance

This repository currently contains design pattern reference material in `docs/` and no web application code in `src/`. Inspect the live repository before assuming an application stack.

## Project agents

- `architecture_planner`: read-only implementation plan before code changes.
- `web_implementer`: scoped implementation after the plan is reviewed.
- `browser_qa`: browser verification and reproduction; does not edit application files.
- `security_reviewer`: security review when requested; does not edit application files.

For every requested web application code change, ask `architecture_planner` for a plan and wait for its result before editing code. Give it the task and relevant constraints. The plan should name affected files, design choices, and verification; a small fix can have a short plan. The main agent reviews the plan and passes it to `web_implementer` or implements it directly. If new facts change the approach, update the plan before continuing.

Delegate independent browser checks when useful. Use `security_reviewer` when the user explicitly requests a security review. Keep edits to a given file with one agent at a time. The main agent coordinates work and verifies the combined result.
