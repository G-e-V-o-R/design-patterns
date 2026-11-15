# Chain of Responsibility — Spiders on the wind

Scenario 03 adapts the third story in the project reference material. Faelina sends a signal through a configured chain: SilkThread → BloodSpider → StepSpider → IronSpider. The first matching spider handles the request; a harmless traveller reaches the end without action.

`SignalHandler` defines the contract. SilkThread is a concrete forwarding entry handler, not a superclass. Every concrete handler owns a nullable next reference and its own `handle(request)` method. The diagram combines class contracts with the example's configured next links; these links are not inheritance relationships.

`scenario.json` defines the story, classes, members, exact directed relationships, hints, positions, and local artwork. The shared configured runtime owns diagram validation, editing, history, and solutions.

`Demo.tsx` owns the demonstration state and uses `ChainDemo.tsx` for presentation. `demoModel.ts` checks the graph with the shared validator before following its next edges, recording every visited handler and stopping at the first match. Changes to the diagram clear the displayed result. Switching lessons preserves it. Only demonstration code and styles remain local.

All artwork lives in `resource/`, including copies of the three spider cards from `docs/hobbit/UML/`; documentation retains its originals.

Run `npm run test:chain` for all signal outcomes, invalid graph gating, and input immutability. `npm run test:configs` covers the configured lesson structure and artwork.
