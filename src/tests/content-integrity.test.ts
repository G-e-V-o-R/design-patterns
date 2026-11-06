import { assets } from "../content/assets";
import { characters } from "../content/characters";
import { worldMap } from "../content/world-map";
import { chapterOne, observer, mediator } from "../content/chapter-one";
import {
  Content,
  validateContent,
  validateGraph,
} from "../application/validate-content";
const content: Content = {
  assets,
  characters,
  map: worldMap,
  chapter: chapterOne,
  blueprints: [observer, mediator],
};
let count = 0;
function check(ok: boolean, label: string): void {
  count++;
  if (!ok) throw new Error(label);
}
check(validateContent(content).length === 0, "real content valid");
check(
  validateContent({ ...content, assets: [...assets, assets[0]!] }).some(
    (e) => e.code === "duplicate-asset"
  ),
  "duplicates"
);
check(
  validateContent({
    ...content,
    chapter: { ...chapterOne, start: "missing" },
  }).some((e) => e.code === "unknown-scene"),
  "unknown scene"
);
check(
  validateContent({
    ...content,
    chapter: {
      ...chapterOne,
      scenes: [
        ...chapterOne.scenes,
        { id: "orphan", lines: [], terminal: true },
      ],
    },
  }).some((e) => e.code === "unreachable-scene"),
  "orphan"
);
check(
  validateContent({
    ...content,
    map: { ...worldMap, locations: [{ ...worldMap.locations[0]!, x: 2 }] },
  }).some((e) => e.code === "invalid-coordinate"),
  "coordinates"
);
check(
  validateContent({
    ...content,
    chapter: {
      ...chapterOne,
      scenes: chapterOne.scenes.map((s) => ({
        ...s,
        lines: [{ text: "bad", speaker: "invented" }],
      })),
    },
  }).some((e) => e.code === "unknown-speaker"),
  "invented speaker"
);
for (const b of content.blueprints) {
  check(validateGraph(b, b.solution).length === 0, "canonical");
  check(
    validateGraph(b, {
      roles: [...b.solution.roles].reverse(),
      edges: [...b.solution.edges].reverse(),
    }).length === 0,
    "order independent"
  );
  check(
    validateGraph(b, { ...b.solution, edges: b.solution.edges.slice(1) }).some(
      (e) => e.code === "missing-edge"
    ),
    "missing"
  );
  check(
    validateGraph(b, {
      ...b.solution,
      edges: [...b.solution.edges, b.solution.edges[0]!],
    }).some((e) => e.code === "duplicate-edge"),
    "duplicate"
  );
  check(
    validateGraph(b, {
      ...b.solution,
      edges: [
        ...b.solution.edges,
        { source: "narion", target: "elvir", type: "direct" },
      ],
    }).some((e) => e.code === "extra-edge"),
    "extra edge"
  );
  check(
    validateContent({
      ...content,
      blueprints: [
        {
          ...b,
          solution: { ...b.solution, roles: [...b.solution.roles, "invented"] },
        },
      ],
    }).some((e) => e.code === "unknown-role"),
    "invalid canonical role"
  );
  const e = b.solution.edges[0]!;
  check(
    validateGraph(b, {
      ...b.solution,
      edges: [
        { ...e, source: e.target, target: e.source },
        ...b.solution.edges.slice(1),
      ],
    }).length > 0,
    "reversed"
  );
  check(
    validateGraph(b, {
      ...b.solution,
      roles: [...b.solution.roles, "stranger"],
    }).some((e) => e.code === "extra-role"),
    "unknown role"
  );
}
console.log("Passed " + count + " content integrity and graph assertions.");
