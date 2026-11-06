# Chapter blueprint contract

These are authored behavioral blueprints using the existing illustrated cards. They are not recovered UML solutions: the art contains no authoritative edge specification. Each card exposes its narrative role and an optional pattern explanation.

## fox-vision — Observer

Available required roles: fox plus the seven named companions. Fox art: UML/1.8.png. Companion art: group 1, mapped in asset-manifest.json. Begin guided mode with fox, Narion, and Elvir, then reveal the remaining recipients before final submission.

Canonical graph: exactly seven directed `observes` edges, each companion → fox. The port label explains “receives visions from.” At runtime, a fox discovery travels back to the subscribers. Explain the difference between the subscription arrow and event flow. No hero-to-hero links, self-links, duplicate edges, or extra nodes.

Test input: fox discovers movement near the crossing. Output: one notification per subscribed companion; unconnected companions visibly receive nothing. Every companion chooses their own response. Final success requires all seven subscriptions. Do not imply that Observer itself always requires exactly seven subscribers; that is this scene's requirement.

Hints: “Who sees first?” → “Each bracelet listens to the same fox.” → highlight one missing subscription. Assisted completion installs the full graph and plays its trace.

## raven-coordination — Mediator

Required roles: raven plus the seven companions. Art: UML group 2. Canonical graph: seven companion → raven edges typed `requests`, and seven raven → companion edges typed `delivers`. Distinct ports avoid ambiguity. No direct companion links, duplicates, or self-links.

Test inputs: Dre’Kaar requests cover; Faelina requests shelter. Raven routes cover to Narion and shelter to Saerenn. These authored rules belong to the mediator. A trace follows the actual submitted edges: a missing request link stops before the raven; a missing delivery link stops at the raven. Only the intended recipient responds. Full completion requires the entire communication network, including links unused by these two examples.

Hints: “Who can hear everyone?” → “Send requests through Elvir's raven.” → highlight a missing request or delivery. Assisted completion demonstrates both routes. Compare with the fox: shared events reach subscribers; the raven coordinates particular requests.

## Validation and advanced challenge

Match role IDs and edge triples (source, target, type), ignoring position and connection ordering. Reject unknown roles, missing roles, unknown edge types, duplicates, extra edges, and reversed edges. Equivalent screen layouts are valid. Runtime instance IDs must map uniquely to roles.

Optional mastery: repair a graph with a direct companion link and a missing mediator delivery. No story gate or extra cast required. Guided explanation and UML labels can be toggled independently.

Verification examples for each graph: canonical succeeds; shuffled nodes/edges succeeds; repositioned nodes succeeds; deleted required edge fails; reversed edge fails; extra edge fails; duplicate edge fails; unknown role fails. Test traces must reflect submitted edges. Assistance changes learning records only.
