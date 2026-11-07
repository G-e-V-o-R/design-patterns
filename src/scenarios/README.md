# Scenario authoring standard

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
3. **Check.** Validate the learner's model and provide specific, actionable feedback. Point to the class, member, or relationship that needs attention; do not rely on a generic “incorrect” result.
4. **Support.** Offer progressive hints and a way to inspect or load a worked solution. Neither should prevent learners from continuing to experiment.
5. **Try it.** Make the demonstration available when the model is valid (or when the solution is loaded). Show outcomes for meaningful cases, including a contrasting or no-op case where relevant.
6. **Reset and recover.** Let learners reset their own scenario and recover from edits without changing another scenario's state. Keep feedback and the demonstrated result in sync with edits.

The order and visual treatment can vary, but learners must be able to move from the story to a structural model, understand mistakes, and observe the pattern in action.

## Implementation boundaries

- Keep all scenario content and behavior in its own `src/scenarios/<id>/` directory: public component, model, validation, simulation, styles, and tests.
- Give each scenario its own state and model. Do not import from sibling scenarios, `src/app/`, or the legacy Observer compatibility module. The shell should know only the scenario's registry metadata and public component.
- Keep the initial activity understandable and safe to explore. Do not read or write legacy saves; a page reload starts a fresh scenario.
- Keep pattern-specific logic in the scenario. Do not add pattern-specific branches to the application shell or make a scenario depend on another scenario's internals.
- Scope styles to a scenario root class. Keep class names, animation names, and visual changes local; shared shell or base-style changes need regression checks for all scenarios.
- Use the existing scenario conventions and helpers where appropriate. Extract shared UI only when its contract is stable and all consumers can be regression-tested.

## Interaction and accessibility

- Use clear labels and concise instructions for cards, diagram controls, relationships, hints, validation, demo actions, and reset.
- Do not make drag-and-drop the only way to assign members or create relationships; provide equivalent controls.
- Make validation and demo outcomes available as readable text, not color or animation alone. Announce changing results accessibly, and give informative text alternatives for meaningful artwork.
- Support keyboard operation, visible focus, reduced-motion preferences, and narrow layouts. Avoid requiring animation to understand a result.
- Prevent invalid actions from corrupting the model. Keep the learner's current work visible and explain what action is needed next.

## Model and test expectations

- Keep the scenario's graph or lesson model explicit and independently testable. Put validation and simulation in the scenario model rather than coupling correctness to rendering.
- Test the canonical solution, an incomplete attempt, common incorrect assignments or relationships, and each meaningful simulation outcome. Verify that invalid structures cannot produce a success-shaped demo result.
- If the model parses external or saved input, test malformed and unsupported values and ensure they cannot introduce unknown classes, members, or relationships.
- Test scenario isolation and registration through the existing boundary checks. Add the scenario's model test to the project's test command.

## Adding a scenario

1. Create `src/scenarios/<id>/` with the scenario component, model, scoped styles, and model tests.
2. Adapt the scenario idea from `docs/hobbit/Russian Scenarios.md` into a clear A2-level description. Explain the problem and how the pattern solves it, then build the task, diagram activity, targeted checking, hints or solution, and a pattern-specific demonstration.
3. Register a unique ID and the public component in `src/scenarios/registry.ts`; keep `src/scenarios/types.ts` limited to the shell contract.
4. Add the model test to `package.json`.
5. Run `npm test` and `npm run build`.
6. Check the scenario in a browser: initial state, incomplete and incorrect models, solution, every demo case, reset, undo if present, keyboard use, narrow layouts, and switching between scenarios. Confirm that switching preserves the scenario's state and reset affects only that scenario.

## Observer as the reference

Use [ObserverScenario.tsx](./observer/ObserverScenario.tsx) as the public-entry example and [ObserverLesson.tsx](./observer/ObserverLesson.tsx) as the full lesson example. The Observer reference is valuable because it combines:

- A memorable story with a specific, testable learning goal.
- A build sequence and clear descriptions for class, member, and relationship cards, with scenario artwork on the concrete class cards.
- Targeted validation that identifies the affected diagram elements.
- Progressive hints, a worked solution, reset, and undo.
- A demonstration with contrasting danger/safe outcomes, subscription changes, accessible status, and a method-call trace.
- A separate model and tests for validation and behavior.

These are learning and quality standards, not requirements to reproduce Observer's vocabulary, exact controls, or visual design. Choose the interactions and test cases that best express the new pattern.
