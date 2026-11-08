# Mediator scenario files

This directory contains the standalone Mediator learning scenario. The learner assembles a class diagram, validates the mediator and colleague relationships, then explores how messages are routed through the mediator.

## File responsibilities

| File | Responsibility |
|---|---|
| `Scenario.tsx` | Public entry point; initializes the scenario model and renders the lesson. |
| `LessonWorkspace.tsx` | Composes the lesson UI and wires the diagram, editing state, feedback, and demo together. |
| `model.ts` | Defines the diagram model, expected structure, validation, feedback, and routing simulation. |
| `model.test.ts` | Tests model validation, feedback, routing, and scenario state isolation. |
| `useLessonEditor.ts` | Manages lesson editing state and actions such as validation, reset, undo, hints, and demo launch. |
| `StoryIntro.tsx` | Presents the scenario story and explains the Mediator pattern. |
| `DiagramBuilderPanel.tsx` | Displays the available class, field, and method cards and builder actions. |
| `ClassDiagramCanvas.tsx` | Renders the diagram canvas and its controls. |
| `ClassDiagramNode.tsx` | Renders an individual class node and its members on the canvas. |
| `RelationshipList.tsx` | Displays the diagram relationships and their controls. |
| `DiagramActions.tsx` | Provides validation/demo actions and displays feedback. |
| `RoutingDemo.tsx` | Demonstrates message flow routed between colleagues through the mediator. |
| `lessonContent.ts` | Stores scenario-specific labels, hints, and diagram presentation data. |
| `styles.css` | Contains styles scoped to the Mediator scenario. |

## Where to start

| Change | Start with |
|---|---|
| Story or pattern explanation | `StoryIntro.tsx` |
| Diagram classes, relationships, rules, or routing behavior | `model.ts` |
| Hints, labels, or diagram presentation data | `lessonContent.ts` |
| Diagram editing or lesson state | `useLessonEditor.ts` and `LessonWorkspace.tsx` |
| Canvas, class node, or relationship list UI | `ClassDiagramCanvas.tsx`, `ClassDiagramNode.tsx`, or `RelationshipList.tsx` |
| Validation actions or feedback | `DiagramActions.tsx` |
| Message-routing demonstration | `RoutingDemo.tsx` |
| Scenario styling | `styles.css` |
