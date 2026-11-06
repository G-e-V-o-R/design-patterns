# Stage 1 architecture decision

Reviewed with architecture_planner after repository inspection and again after the card audit. Application source belongs at repository-root `src/`. Stage 1 establishes typed content and validation; Stage 2 adds the playable browser interface.

| Directory | Responsibility | Allowed dependencies |
| --- | --- | --- |
| src/domain | Story, blueprint, world, save contracts | Other domain contracts |
| src/content | Characters, asset references, map, chapter, graph definitions | Domain types |
| src/application | Reusable content validation and future use cases | Domain contracts; content passed as arguments |
| src/tests | Valid content and deliberate invalid fixtures | Application and content |
| Future src/app | React composition and screens | Application, content, UI |
| Future src/infrastructure | Save storage and editor adapters | Domain/application contracts |

No browser APIs, React imports, filesystem access, or authored chapter imports belong in the domain. Content paths refer to repository sources, not browser URLs. Stage 2 supplies an asset build adapter and React Flow graph conversion. Render positions never determine puzzle correctness.

Root package configuration supports strict TypeScript and content tests. React, Vite, React Flow, and browser tooling are deferred until the playable interface. Check the machine's Node version before installing that stack: current system Node is 12.22.9 and will need a supported modern runtime for the browser build.

The chapter uses explicit route and warning flags, optional questions, and conditional dialogue. Record assistance separately. Observer subscription direction differs from notification direction. Mediator routing is authored data and traces traverse the submitted graph. Exact solutions refer to roles and typed relationships; they ignore layout.

Source of editorial truth for Stage 1: CAST.md, CHAPTER.md, BLUEPRINTS.md, FLOWS.md and asset-manifest.json in this directory. Typed content is their executable representation; changes must update both until a content-authoring pipeline replaces this duplication.

Verification includes strict compilation, unique IDs, valid speakers/assets/scene references, normalized map coordinates, a reachable ending, graph contracts, and malformed fixtures that prove validation catches errors. Browser playthrough, persistence, and graph simulation are Stage 2 gates and must not be reported as verified in Stage 1.
