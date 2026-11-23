# Scenario authoring standard

## Config-first authoring

For a new diagram lesson, follow the [manifest and content recipe](./REFERENCE_SCENARIO.md) and use the [Observer config](./observer/config/scenario.json) as a working example. Shared code owns the editor, validation, history, solution, and layout. Automatic discovery and tests include the new directory without registry or package edits.

Observer, Mediator, and Chain also use this config infrastructure, with local `Demo.tsx` components for their simulations. Config-only lessons use shared model checks and finish with diagram completion feedback; they do not require a bespoke simulation.

Use the Observer scenario as the quality bar for every new learning scenario. The goal is not to copy its fox story or its exact interface; each scenario should teach its own pattern with the same clarity, feedback, and completeness.

## What every scenario must teach

- **One pattern, one learning goal.** Name the pattern and state the core idea in plain language. The learner should be able to tell what they will build and what concept the activity teaches.
- **A clear scenario description.** Start from the scenario idea in [`docs/hobbit/Russian Scenarios.md`](../../docs/hobbit/Russian%20Scenarios.md). Write it in simple A2-level English. Keep the main idea, and add a few sentences when needed to help the player understand what is happening. Explain both the situation and its solution: who the roles are, how they interact, and how the pattern solves the problem. Keep the story, diagram, labels, and demonstration consistent.
- **A correct structural model.** Explain the roles, responsibilities, fields, methods, and relationships that matter to the pattern. Make clear which participants know about one another and which communicate through an abstraction or coordinator.
- **Pictures on concrete class cards.** In the class diagram, give each class card (except interface cards) a picture that fits its role in the scenario, as in Observer. Use meaningful alt text for each picture.
- **A visible behavioral result.** Let the learner try representative inputs and see the pattern's effects. Explain who acts, what changes, and why. Include a readable call trace or equivalent explanation when it helps connect runtime behavior to the diagram.

Observer demonstrates this flow: the fox's discovery introduces a publisher and its subscribers; the scenario explains that the fox sends a message through a shared interface, and each subscriber decides what to do. The learner builds their class relationships and responsibilities; then danger, a safe path, and subscription changes show how notifications behave.

## Required learning flow

1. **Orient.** Use the idea in `docs/hobbit/Russian Scenarios.md` as the starting point. Give the scenario a title, pattern name, clear A2-level description of the situation and how the pattern works, and an explicit task.
2. **Build.** Provide the classes or interfaces, members, and relationship choices needed to model the pattern. Explain the interactions and controls before expecting the learner to use them.
3. **Give feedback.** Validate as the learner edits. Highlight the misplaced member or incorrect relationship that needs attention.
4. **Show an example.** Offer a separate worked example and preserve the learner's work.
5. **Try it.** Make the demonstration available when the learner completes their diagram. Show outcomes for meaningful cases, including a contrasting or no-op case where relevant.
6. **Reset and recover.** Let learners reset their own scenario and recover from edits without changing another scenario's state. Keep feedback and the demonstrated result in sync with edits.

The order and visual treatment can vary, but learners must be able to move from the story to a structural model, understand mistakes, and observe the pattern in action.

## Implementation boundaries

- Keep each scenario's content and behavior in its own `src/scenarios/<id>/` directory: config, artwork, and optional demo components, simulation, styles, and tests. Put reusable scenario-neutral resources used by multiple scenarios in `src/scenarios/shared/`.
- Keep the public entry and lesson orchestrator thin. Decompose content, presentational UI, and stateful logic into focused files rather than building a monolith.
- Let the configured runtime own each lesson’s independent graph and editor state; keep custom demo state local. Do not import from sibling scenarios, `src/scenarios/types.ts`, `src/scenarios/registry.ts`, or `src/app/`. Reusable scenario-neutral resources belong in `src/scenarios/shared/`; artwork may be imported from `docs/`.
- Keep the initial activity understandable and safe to explore. A page reload starts a fresh scenario.
- Keep pattern-specific logic in the scenario. Do not add pattern-specific branches to the application shell or make a scenario depend on another scenario's internals.
- Scope styles to a scenario root class. Keep class names, animation names, and visual changes local; shared shell or base-style changes need regression checks for all scenarios.
- Use the existing scenario conventions and helpers where appropriate. Extract shared UI only when its contract is stable and all consumers can be regression-tested.

## Interaction and accessibility

- Use clear labels and concise instructions for cards, diagram controls, relationships, validation, demo actions, and reset.
- Do not make drag-and-drop the only way to assign members or create relationships; provide equivalent controls.
- Make validation and demo outcomes available as readable text, not color or animation alone. Announce changing results accessibly, and give informative text alternatives for meaningful artwork.
- Support keyboard operation, visible focus, reduced-motion preferences, and narrow layouts. Avoid requiring animation to understand a result.
- Prevent invalid actions from corrupting the model. Keep the learner's current work visible and explain what action is needed next.

## Model and test expectations

- Use the shared configured graph model and validator. Keep custom simulation independently testable in the scenario’s demo model.
- Test the canonical solution, an incomplete attempt, common incorrect assignments or relationships, and each meaningful simulation outcome. Verify that invalid structures cannot produce a success-shaped demo result.
- If the model parses external or saved input, test malformed and unsupported values and ensure they cannot introduce unknown classes, members, or relationships.
- Test scenario isolation and registration through the existing boundary checks. Add custom demo tests to the project’s test command; config checks are discovered automatically.

## Adding a scenario

1. Create `src/scenarios/<id>/config/scenario.json` and set a unique matching config ID.
2. Adapt the scenario idea into clear story copy, diagram definitions, and local artwork referenced through `scenario.json`.
3. Add an optional `Demo.tsx` and focused simulation helpers when the pattern needs a custom demonstration. Registration is automatic.
4. Include custom demo tests in `npm test`; config validation already covers every scenario directory.
5. Run `npm test`, `npm run typecheck`, and `npm run build`.
6. Check the scenario in a browser: initial state, incomplete and incorrect models, solution, every demo case, reset, undo if present, keyboard use, narrow layouts, and switching between scenarios. Confirm that switching preserves the scenario's state, the hidden scenario does not run visibility-dependent behavior, and reset affects only that scenario.

## Observer as the reference

Use [REFERENCE_SCENARIO.md](./REFERENCE_SCENARIO.md) for the file-by-file recipe and checklist. Use [scenario.json](./observer/config/scenario.json) as a complete lesson definition and [Demo.tsx](./observer/demo/Demo.tsx) as the custom demo entry example. The Observer reference is valuable because it combines:

- A memorable story with a specific, testable learning goal.
- A build sequence and clear descriptions for class, member, and relationship cards, with scenario artwork on the concrete class cards.
- Targeted validation that identifies the affected diagram elements.
- Live progress, a separate worked example, reset, and undo.
- A demonstration with contrasting danger/safe outcomes, subscription changes, accessible status, and a method-call trace.
- Shared graph validation plus a separate demo model and behavior tests.

These are learning and quality standards, not requirements to reproduce Observer's vocabulary, exact controls, or visual design. Choose the interactions and test cases that best express the new pattern.
