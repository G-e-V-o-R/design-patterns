# Create a diagram lesson

Copy this folder into the app:

```bash
cp -r docs/scenario-template src/scenarios/my-pattern
npm run dev
```

Edit `src/scenarios/my-pattern/scenario.json`. Set `id` to the folder name; replace the story, classes, members, relationships, hints, and artwork. The supplied cards are a working Strategy example to make the structure easy to understand. Replace the sample SVG images with your own local images when authoring the lesson.

You do not need a React component, model, stylesheet, registry entry, or package script. New folders are discovered automatically. The template in `docs/` is not registered as a lesson.

## Config fields

| Field | Meaning |
| --- | --- |
| `id` | Unique folder name, such as `my-pattern`. |
| `title`, `pattern` | Story title and design pattern name. |
| `number` | Optional navigation number. Omit for automatic numbering. |
| `intro.paragraphs` | Story paragraphs. |
| `intro.image`, `intro.imageAlt` | Local intro artwork and its accessible description. |
| `intro.task`, `intro.concept` | Learner's task and explanation of the pattern. |
| `intro.caption`, `intro.steps` | Optional image caption and orientation steps. |
| `classes` | Class/interface definitions with nested members and relationships. |
| `hints` | Progressive hints, in the order revealed. |
| `relationshipTypes` | Optional additional arrow types and their appearance. |

Each class has `id`, `label`, and `kind` (`class` or `interface`). Concrete classes also require `image`; use `imageAlt` for a meaningful description. `description` appears in the tray. `position: { "x": 0, "y": 0 }` can override the default layout.

`fields` and `methods` contain `{ "id": "unique-member-id", "label": "name: Type", "description": "Optional help" }`. Member IDs must be unique across the whole scenario, even when two classes have methods with the same label. Nest a member under its correct owner: the engine creates the mixed tray and validates the learner's assignments from this information.

`relationships` contains `{ "type": "implements", "target": "interface-id" }`. The enclosing class is the source. `implements` and `uses` are available by default. Define additional types with, for example:

```json
"relationshipTypes": [
  { "id": "delegates", "label": "delegates to", "toolLabel": "Delegates", "appearance": "solid" }
]
```

Artwork paths must point inside the scenario's `resource/` directory, e.g. `./resource/intro.svg`. Supported formats: SVG, PNG, JPG, JPEG, WebP, AVIF, GIF. Assets are bundled by Vite for deployment. Missing images, duplicate IDs, unknown targets, malformed fields, and unsupported arrow types produce config errors naming the problem field.

The config describes one expected diagram. Member order and arrow attachment sides do not affect correctness. Extra, reversed, missing, and duplicate relationships are reported. Loading the solution creates fresh state; it does not alter the config.

## Optional runnable demo

A diagram-only lesson finishes with completion feedback. For a custom simulation, add `Demo.tsx` in the same folder, with a default React component:

```tsx
import type { ConfiguredDemoProps } from '../shared/ConfiguredScenario';

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  return <p>The completed diagram contains {graph.classes.length} classes.</p>;
}
```

The demo is discovered automatically. Honor `ready` and `active` when implementing controls or effects; a hidden scenario must not keep running animations. Keep simulation code and its tests inside the scenario. JSON does not execute arbitrary expressions or describe new algorithms.

## Checks

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

`npm test` automatically validates every config and its generated solution. For custom simulation code, add tests for its meaningful outcomes as well.
