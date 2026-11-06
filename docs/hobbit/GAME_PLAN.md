# Game concept — preliminary proposal

Status: core product direction confirmed by the owner. No application implementation has started.

Confirmed constraints:
- Audience includes programming beginners, experienced developers, and fantasy adventure players.
- Format is an illustrated adventure with dialogue choices, a journey map, and blueprint puzzles.
- All player-facing text is English.
- Use only the owner's existing characters. Do not introduce Tolkien characters or newly invented characters. Build the world and connective plot around the supplied cast; the Hobbit reference describes the desired sense of adventure and companionship.
- Preserve the Russian source as reference; author a reviewed English adaptation for the game.

## Existing material

`Russian Scenarios.md` contains paragraph text extracted from `Russian Scenarios.docx`, preserving Russian wording and source numbering. This is a text conversion, not a reconstruction of Word formatting or embedded images.

There are 41 numbered scenes. Hero assets include Narion, Jararis, Latve, Saerenn, Faelina, Elbir, Dre_Kaar, and DRE, plus orc roles. DRE's identity and spelling differences between prose and filenames need editorial resolution. The sampled `UML/1.5.png` is an illustration of a hero and fox, not a formal class diagram. The sampled `scenarios/1.1.png` is a scene illustration. Folder names and numeric prefixes alone are insufficient to establish the correct solution graph. Audit and explicitly map every asset before production.

## Proposed adventure

Working title: The Threads of the Journey. An illustrated party adventure with a route map, consequential conversations, camp scenes, and magical blueprint construction.

Proposed new connective plot: the company must reach an ancient fortress before an advancing army and restore its warning network. Each companion holds part of the knowledge needed to awaken it. Their magic requires cooperation, while their past failures make trust difficult. The final decision is whom the restored network will protect and who will control it. This premise is newly proposed, not present as a complete plot in the source.

Act I: departure and learning to cooperate. Use the fox's shared vision, raven communication, and a meal at camp to introduce characters and mechanics (scenes 1, 2, 6).

Act II: the dangerous road. Poison forces a negotiation at the guarded lair; workshops and strange devices offer different ways onward (9–20). Routes change whom the party meets and which resources they retain.

Act III: the forest of memories. Scenes 26–32 reveal personal failures. Conversations and earlier choices affect trust and reconciliation. These scenes need narrative treatment; do not force every moral choice into a single correct design-pattern answer.

Act IV: the siege. Reuse learned abilities in the battlefield scenes (33–41), culminating in a combined blueprint and a story decision. Earlier alliances alter available help and the epilogue.

## Serving all three audiences

Use one shared campaign with adjustable assistance rather than three separate games. At the start, offer a guided or independent puzzle experience; allow switching at any time. Never require programming knowledge to understand the journey objective.

For fantasy players, introduce cards through character abilities and show the consequences of their connections. Provide optional step-by-step guidance and a worked solution so a puzzle cannot permanently block the story.

For programming beginners, progressively reveal pattern names, UML relationship labels, and a short explanation after the scene. Teach one relationship at a time and keep a replayable journal example.

For experienced developers, offer optional mastery challenges: remove unnecessary dependencies, repair a broken graph, or adapt a known pattern to a changed constraint. Author and validate these challenges explicitly. They must preserve the canonical pattern's required structure, and must not gate story content.

Record assistance and optional mastery separately from narrative choices. Using hints must not reduce companion trust or produce a worse ending. Test the first chapter with representatives of all three audiences before expanding it.

## English adaptation and cast boundaries

Create a cast registry from the supplied hero artwork and source prose. Confirm aliases such as Elbir/Elvir and Jararis/Жарарис, and determine whether DRE and Dre_Kaar represent the same character before assigning roles. Preserve the owner's character identities; names used in this proposal are provisional English transliterations.

Translate dialogue for natural English while preserving motives, relationships, and scenario intent. Keep stable scenario IDs linking the English adaptation to the Russian source. English UI, hints, journal entries, accessibility labels, and puzzle explanations belong in the same localization inventory.

The source mentions incidental figures such as a guard, smith, father, and commanders. Their inclusion as depicted or speaking characters requires confirmation that they belong to the owner's allowed cast. Until resolved, use existing approved characters for scene roles where coherent, or describe the event through narration and existing characters' recollections. Do not invent replacement characters. Existing animal companions and orc role assets should also receive explicit registry entries.

## Player loop

Choose a destination → inspect a scene → talk and choose an approach → assemble a magical blueprint → test it in a visible simulation → see consequences → return to camp.

A story choice determines intent: rescue scouts, protect refugees, or preserve supplies. A blueprint determines how the chosen action works. Reward success with changed scenes, companion reactions, discoveries, and new capabilities. Use short branches that reconverge while retaining consequence flags, so choices matter without multiplying the entire script.

Keep travel, humour, meals, discoveries, and quiet companionship between dangerous encounters. The existing material is frequently dark; warmth and wonder need additional writing to achieve the desired journey atmosphere.

## Blueprint rules

Players select illustrated role cards and connect typed ports. A card can show its story role first and its programming role on demand. Links represent relationships such as subscription, delegation, composition, or implementation.

Define each canonical solution as explicit roles and directed typed edges. Match this structure independently of screen coordinates, node IDs, and equivalent ordering. This preserves the requested exact design-pattern blueprint without requiring pixel-perfect placement. Permit only explicitly authored equivalent solutions.

For the fox scene, a proposed Observer puzzle connects a vision source to multiple subscribers. A test event should reach each subscriber independently. The author must first confirm the mapping against the complete card set. Hints progress from a character remark to a highlighted missing relationship to an optional worked blueprint. Assisted completion preserves story progress and records learning progress separately.

Use the actual graph to generate the simulation trace. Do not show an unconditional success animation after a superficial card count check. Explain failures in scene terms, then optionally reveal the technical explanation.

Several passages need semantic review: scene 3 does not establish an ordered chain of responsibility; scene 11 could suggest Builder or Composite; scene 13 needs product-family details to establish Abstract Factory. Scenes 22–25 resemble responsibility assignment principles. Scenes 26–32 are primarily character memories. Never infer a definitive answer from numbering alone.

## Technology recommendation

For the confirmed illustrated adventure format: React + TypeScript + Vite, with React Flow for blueprint editing, CSS for the illustrated interface, and a small deterministic TypeScript story engine. Store authored story data and graph definitions separately from rendering. Begin with versioned local saves and export/import; add accounts and cloud saves only if cross-device play becomes a requirement.

React Flow supports custom draggable nodes and handles: https://reactflow.dev/learn/customization/custom-nodes . Its connection validation is useful for editor constraints: https://reactflow.dev/examples/interaction/validation . Full puzzle correctness still needs our own validator. Vite supports static deployment: https://vite.dev/guide/static-deploy . These capabilities were checked against official documentation.

The confirmed format uses illustrated scenes and a selectable journey map. The supplied cards support this presentation; scene transitions and small visual effects can provide movement without a navigable world.

Suggested future modules: content/heroes, content/scenes, content/blueprints, assets/manifest; game/story, game/blueprints, game/save; UI/map, UI/dialogue, UI/camp, UI/workbench. Save records contain content version, current scene, choice flags, companion trust, puzzle progress, and unfinished graph. Validate imported saves and migrate supported older versions.

## First playable chapter

Target a 20–30 minute session, subject to playtesting: opening at camp, a route decision, fox scouting puzzle, raven coordination puzzle, a consequence scene, and a closing conversation. Include three active companions initially and introduce the wider party gradually. Deliver one complete emotional arc and two well-taught puzzles before expanding to all 41 scenes.

Required screens: start/continue, route map, scene/dialogue, blueprint workbench, camp/journal, settings. Provide readable text over dark art, keyboard card selection and connection controls, touch alternatives to dragging, reduced motion, and adjustable audio.

## Delivery sequence and verification

1. Audit all cards and build a reviewed scenario-to-asset manifest and approved cast registry. Resolve aliases and incidental source figures; normalize names without renaming originals blindly. Audience, English language, illustrated format, and exclusive use of the owner's characters are confirmed.
2. Write the first chapter's branching script and approve its two canonical blueprint graphs. Define the desired player emotions and concrete consequences for each choice.
3. Obtain an architecture_planner plan per repository guidance before application code changes; review affected files, implementation choices, and verification.
4. Build the playable chapter with persistence, hints, graph validation, and simulations. Test missing/reversed/extra edges, valid rearrangements, and repeated actions that must not duplicate rewards.
5. Verify a complete browser playthrough, reload during an unfinished puzzle, save round-trip, keyboard interaction, and narrow-screen usability.
6. Playtest with the intended audience: can they explain their journey goal, care about a companion, understand why the blueprint works, and continue after getting stuck? Revise before expanding the campaign.

Main scope risks are unverified card mappings, ambiguous teaching metaphors, excessive branching, and artwork that needs readable overlays or alternate crops. The first chapter should resolve these before full campaign production.

## Supplied map update

The world map is available at `../map.jpg`. Stage 1 now includes a location and route inventory and proposes placing the first chapter between Council of the Seven and Broken Bridge. See `STAGE_1_PLAN.md` for placement, overlay requirements, and map-node rules.
