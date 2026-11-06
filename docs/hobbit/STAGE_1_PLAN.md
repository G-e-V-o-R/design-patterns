# Stage 1 — Define the first playable chapter

Stage 1 produces the reviewed content and technical specification needed to implement a complete first chapter. The confirmed format is an English illustrated adventure with dialogue choices, a journey map, and blueprint puzzles, using only the owner's existing characters. The audience includes fantasy fans, programming beginners, and experienced developers.

## Proposed chapter: The First Warning

This is new connective story proposed around source scenarios 1 (fox vision), 2 (raven communication), and 6 (cooking at camp). Target eventual playing time: 20–30 minutes, to be measured in playtesting.

The company discovers signs of danger ahead. The immediate goal is to scout a safe passage and coordinate the companions through an ambush. The chapter closes at camp, where the player's decisions shape a conversation and reveal the next destination. The wider fortress plot remains a proposal until the campaign outline is reviewed.

Focus on Narion, Elvir (asset named Elbir), and Dre’Kaar, subject to the cast audit. Other existing companions can be present where required by the original scene. The fox and raven remain attached to their existing owners. Introduce no new named or speaking characters.

| Beat | Player action | Purpose and outcome |
| --- | --- | --- |
| Opening camp | Speak to companions; choose what to ask about | Establish the journey goal, warmth, and differing priorities |
| Route map | Choose a cautious approach or direct scouting | Change scene framing and the information available later; both routes rejoin |
| Fox vision | Build and test the first blueprint | Learn how one source shares discoveries with multiple companions |
| Danger revealed | Decide which existing companion to warn first | Store a story flag that changes dialogue during the encounter |
| Raven coordination | Build and test the second blueprint | Coordinate requests through a mediator and escape the encounter |
| Evening camp | Discuss the outcome while sharing a meal | Pay off at least one earlier choice and establish the next journey hook |

Scene 6 supplies atmosphere for the closing camp, rather than a third required puzzle. Avoid arbitrary timers during dialogue or construction.

## Work package 1: source and cast audit

Inspect all assets relevant to scenarios 1, 2, and 6, their UML card groups, and the selected heroes. Record explicit mappings in `content/asset-manifest.json` when this stage is executed. Numeric filename prefixes are hints, not verified associations.

Prepare `content/cast-registry.md`: canonical English display name, source spellings, artwork paths, companion creature, established traits, and allowed chapter role. Resolve Elbir/Elvir, Narion/Narrion, and DRE/Dre_Kaar rather than creating duplicate characters. Flag any source figure without an approved matching character.

Completion: every chapter illustration and card has a verified purpose; every depicted or speaking character belongs to the supplied cast; unresolved identity questions are listed explicitly.

## Work package 2: English chapter script

Write `content/chapter-01.md` with stable scene IDs, source references, narration, dialogue, choices, conditions, and outcomes. Adapt the Russian prose into natural English while preserving character motives. Mark newly written connective passages so they can be reviewed separately from translation.

Keep branching bounded: two short route variations, a warning choice, and one closing conversation variation. Track discrete flags such as route choice and warning recipient. Introduce a numeric trust system only if the script demonstrates a concrete need for it.

Include humour, a shared meal, curiosity about the landscape, and an unresolved personal concern. Players should understand what the company wants and why the journey matters before their first puzzle.

Completion: each choice has a visible payoff; all branches reach the ending; no puzzle terminology is needed to follow the plot; no unapproved character is added.

## Work package 3: two blueprint specifications

Write `content/blueprints/chapter-01.md` and machine-readable graph definitions during execution. Review the complete card sets before finalizing either solution.

Puzzle A — proposed Observer mapping for source scene 1. Define the vision source, subscription relationship, participating receivers, and event. Specify exactly which card represents each role. Demonstrate one discovery reaching all subscribed companions independently, and specify what an unsubscribed companion misses.

Puzzle B — proposed Mediator mapping for source scene 2. Define requesting companions, the raven mediator, and recipients. Specify mediated request routing and prohibit direct companion-to-companion communication where the intended solution requires mediation. Explain how this differs from broadcasting the same observation to all subscribers.

For each puzzle define: available cards; required roles; directed and typed edges; allowed equivalents; forbidden or extra edges; a canonical solution; visible test inputs and outputs; contextual failure messages; three hint levels; and an assisted solution. Exact matching refers to the authored graph's meaning, independently of card position and equivalent card IDs.

Offer a story-first card face and optional UML labels. Beginners receive progressive explanations; experienced players can disable guidance and attempt one optional graph repair challenge. Assistance never worsens narrative outcomes.

Completion: a reviewer can solve each puzzle from its instructions, distinguish the two patterns, and predict the simulation result. Correct, incomplete, reversed-edge, and extra-edge examples have explicit expected results.

## Work package 4: screen and interaction specification

Create `design/chapter-01-flows.md` covering start/continue, map, illustrated dialogue, blueprint workbench, camp/journal, and settings. Document a full walkthrough and loading/resume states.

The workbench needs a card tray, clear connection ports, inspect-card view, test action, contextual feedback, undo/reset, hints, and return-to-scene action. Define both keyboard and pointer controls. For small screens, allow a focused workbench view, readable card inspection, and tap-to-connect interaction. Keep text on readable panels rather than directly over dark artwork.

Completion: every action has a defined result; unfinished puzzles can be resumed; the chapter is operable without drag gestures; reduced motion and readable typography are specified.

## Work package 5: implementation architecture

Ask architecture_planner for a read-only implementation plan after the chapter and puzzle definitions are ready, as required by repository guidance. The main agent reviews the result before application code changes.

Proposed stack: React, TypeScript, Vite, and React Flow. Use a deterministic story state model, authored content files, a graph validator independent of React Flow, and versioned local saves with export/import. Story flags and puzzle assistance are separate. No backend is needed for the initial chapter.

The implementation plan must name the future app location, module boundaries, dependencies, content schemas, save format, asset handling, and test commands. The owner selected repository-root `src/` for code. Root source and configuration writes require filesystem escalation from the current docs-only workspace.

Completion: the plan accounts for all chapter interactions and identifies exactly which files implementation will create. Graph tests cover semantic correctness; browser verification covers a complete journey and reload during an unfinished puzzle.

## Stage boundary and next stage

Stage 1 is complete when the cast/asset mapping, English script, two puzzle definitions, interaction flow, and reviewed architecture plan agree. Review the resulting chapter package as a concrete whole. Open questions must identify their actual impact and proposed resolution.

Stage 2 implements this chapter and verifies it in the browser. Its acceptance criteria include a complete start-to-ending journey, visible consequences for choices, correct graph validation, functioning assistance, resume after reload, and keyboard/touch usability. Playtest with representatives of all three audiences before expanding the campaign.

Do not expand to all 41 scenes during Stage 1. The first chapter is the place to establish reusable content rules and prove that story decisions and blueprint construction fit together.

## Supplied world map

The owner supplied `../map.jpg` (1280 × 1280). Use this artwork as the journey map. Visible labels include Council of the Seven, Broken Bridge, Ashen Plains, Poisoned Fen, Gate of Hilgarn, Temple of Silent Light, and Rift of Shadows. Both labels intentionally read “Dungeon of the”; preserve their names and assign distinct internal IDs. White and green marks are encounter nodes by the agreed design decision.

Proposed chapter placement: start near Council of the Seven, scout the forest toward Broken Bridge, and close at a camp near the bridge. This is a proposed scenario placement, not an established route in the source. The route choice can select two scouting approaches within this region, reconverging before the raven encounter. Later regions remain visible but unavailable in the first chapter. Treat the Council as a location; its name does not authorize adding seven new characters.

Extend work package 1 with a map-node inventory: stable location IDs, exact display labels, normalized image coordinates, available connections, associated scene IDs, and chapter unlock conditions. Review connections against rivers, cliffs, and the broken crossing; do not assume every nearby marker is reachable.

Extend work package 4 with a responsive map overlay: preserve image aspect ratio, anchor interactive nodes to normalized coordinates, provide keyboard-focusable location buttons and a parallel location list, distinguish current/available/completed/locked states, and make labels readable on narrow screens. The overlay must align at different viewport sizes. Do not modify the original image during planning. Use the existing marks as encounter anchors without modifying the original artwork.

Stage 1 execution artifacts are in `stage-1/`; see `stage-1/ARCHITECTURE.md` for the reviewed module boundaries and `stage-1/CHAPTER.md` for the English script.
