# Mediator: Thoughts through the raven

`scenario.json` owns the story, diagram classes and members, directed relationships, positions, and local artwork. The shared configured lesson supplies editing, validation, history, and the worked example.

`Demo.tsx` is discovered automatically and owns the demo result. `RoutingDemo.tsx` renders cover and shelter routes, their method traces, and the six direct connections shown for comparison. Visibility-dependent measurements and animation respect `active`; changing the graph clears stale results.

`demoModel.ts` simulates coordination only after the shared validator accepts the graph against this JSON. `demoArtwork.ts` supplies bundled images for the demo and obtains alternative text from the same config. `styles.css` contains scoped demo styles.

Run `npm run test:mediator` for request routing and invalid-diagram gating, and `npm run test:configs` for shared diagram validation.
