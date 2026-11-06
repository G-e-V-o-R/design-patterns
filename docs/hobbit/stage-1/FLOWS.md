# Chapter interaction specification

Start → new journey or continue → scene → route map → branch scene → dialogue → workbench → outcome → next scene → camp → chapter end.

Dialogue uses a stable readable text panel, speaker portrait, optional questions, and explicit Continue. Previously asked questions are marked. Choices are committed once and saved immediately. Reload restores the last committed step without repeating consequences.

Map uses docs/map.jpg at its original aspect ratio with normalized coordinate overlays. White/green marks are encounter nodes, as delegated by the owner. Named landmarks are chapter destinations. Keep both exact “Dungeon of the” labels and distinguish them internally as dungeon-west and dungeon-southwest. A parallel location list exposes the same actions for keyboard and narrow screens. Locked destinations explain when they become available. Map does not imply crossing an impassable river without a scripted event.

First chapter approximate marker anchors: departure (0.064,0.28), woodland approach (0.082,0.35), river approach (0.129,0.397), bridge approach (0.18,0.421). These are interaction anchors over existing marks, not surveyed geography. The two scouting branches rejoin at the bridge approach; select the current encounter there from story state. Use an ordered encounter list for multiple scenes at one node. Future landmarks remain visible and locked.

Workbench: scene goal, card tray, inspect card, connection ports, test, undo, reset, hints, assistance, and return to scene. Tap/click a source then a target to connect; keyboard users select both through labelled controls. Confirm reset when progress exists. Returning preserves the graph. Test feedback identifies affected cards and offers a text trace as well as animation. No forced timer. Reduced motion replaces travelling effects with highlighted trace steps.

Save version, chapter ID, current scene, choice flags, completed questions, puzzle graphs, completion and assistance. Validate imports before replacing current data; preserve the current save if import fails. Autosave at transitions and after graph changes. Export/import is available from settings. Audio is optional and never conveys unique information.

Acceptance walkthroughs: complete each route and warning variant; solve independently and with assistance; reload in a partially connected graph; navigate entirely with keyboard; use tap connections on a narrow screen; complete with reduced motion. Test story reachability and graph correctness independently of rendering.
