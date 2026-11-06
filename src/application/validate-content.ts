import { Chapter, Line } from "../domain/story/types";
import { Blueprint, Graph, Edge } from "../domain/blueprints/types";
import { Asset, Character, WorldMap } from "../domain/world/types";
export interface Diagnostic {
  readonly code: string;
  readonly at: string;
}
export interface Content {
  readonly assets: readonly Asset[];
  readonly characters: readonly Character[];
  readonly chapter: Chapter;
  readonly blueprints: readonly Blueprint[];
  readonly map: WorldMap;
}
const key = (e: Edge): string => JSON.stringify([e.source, e.target, e.type]);
export function validateGraph(b: Blueprint, g: Graph): Diagnostic[] {
  const errors: Diagnostic[] = [];
  const compare = (
    expected: readonly string[],
    actual: readonly string[],
    kind: string
  ): void => {
    const seen = new Set<string>();
    for (const v of actual) {
      if (seen.has(v)) errors.push({ code: "duplicate-" + kind, at: v });
      seen.add(v);
      if (!expected.includes(v)) errors.push({ code: "extra-" + kind, at: v });
    }
    for (const v of expected)
      if (!seen.has(v)) errors.push({ code: "missing-" + kind, at: v });
  };
  compare(b.solution.roles, g.roles, "role");
  compare(b.solution.edges.map(key), g.edges.map(key), "edge");
  return errors;
}
export function validateContent(c: Content): Diagnostic[] {
  const out: Diagnostic[] = [];
  const fail = (code: string, at: string): void => {
    out.push({ code, at });
  };
  const ids = (
    items: readonly { readonly id: string }[],
    kind: string
  ): Set<string> => {
    const set = new Set<string>();
    for (const x of items) {
      if (set.has(x.id)) fail("duplicate-" + kind, x.id);
      set.add(x.id);
    }
    return set;
  };
  const assets = ids(c.assets, "asset"),
    people = ids(c.characters, "character"),
    scenes = ids(c.chapter.scenes, "scene"),
    puzzles = ids(c.blueprints, "blueprint"),
    locations = ids(c.map.locations, "location");
  const ref = (set: Set<string>, id: string, kind: string): void => {
    if (!set.has(id)) fail("unknown-" + kind, id);
  };
  const flag = (name: string, value: string): void => {
    if (!c.chapter.flags[name]?.includes(value))
      fail("invalid-flag", name + "=" + value);
  };
  const line = (l: Line): void => {
    if (l.speaker) ref(people, l.speaker, "speaker");
    if (l.when) flag(l.when.flag, l.when.equals);
  };
  c.characters.forEach((x) => ref(assets, x.portraitAssetId, "asset"));
  ref(assets, c.map.assetId, "asset");
  ref(scenes, c.chapter.start, "scene");
  for (const s of c.chapter.scenes) {
    s.lines.forEach(line);
    ids(s.questions || [], "question");
    (s.questions || []).forEach((q) => line(q.reply));
    ids(s.choices || [], "choice");
    for (const x of s.choices || []) {
      ref(scenes, x.target, "scene");
      for (const name of Object.keys(x.effects || {}))
        flag(name, x.effects![name]!);
    }
    if (s.next) ref(scenes, s.next, "scene");
    if (s.assetId) ref(assets, s.assetId, "asset");
    if (s.puzzleId) ref(puzzles, s.puzzleId, "blueprint");
    if (!s.terminal && !s.next && !s.choices?.length) fail("dead-end", s.id);
    if (s.terminal && (s.next || s.choices?.length))
      fail("terminal-exit", s.id);
  }
  const reached = new Set<string>();
  const visit = (id: string): void => {
    if (reached.has(id)) return;
    reached.add(id);
    const s = c.chapter.scenes.find((x) => x.id === id);
    if (s?.next) visit(s.next);
    for (const x of s?.choices || []) visit(x.target);
  };
  visit(c.chapter.start);
  for (const s of c.chapter.scenes)
    if (!reached.has(s.id)) fail("unreachable-scene", s.id);
  if (!c.chapter.scenes.some((s) => s.terminal && reached.has(s.id)))
    fail("unreachable-ending", c.chapter.id);
  for (const b of c.blueprints) {
    const roles = ids(b.roles, "role");
    for (const r of b.roles) {
      ref(assets, r.assetId, "asset");
      if (r.characterId) ref(people, r.characterId, "character");
    }
    const seen = new Set<string>();
    for (const e of b.solution.edges) {
      ref(roles, e.source, "role");
      ref(roles, e.target, "role");
      if (!b.edgeTypes.includes(e.type)) fail("unknown-edge-type", e.type);
      if (seen.has(key(e))) fail("duplicate-edge", b.id);
      seen.add(key(e));
    }
    for (const r of b.solution.roles) ref(roles, r, "role");
    if (new Set(b.solution.roles).size !== b.solution.roles.length)
      fail("duplicate-solution-role", b.id);
    for (const r of roles)
      if (!b.solution.roles.includes(r)) fail("missing-solution-role", r);
    for (const s of b.simulations) {
      for (const e of s.path)
        if (!seen.has(key(e))) fail("unknown-simulation-edge", s.id);
      s.recipients.forEach((r) => ref(roles, r, "role"));
    }
  }
  for (const l of c.map.locations) {
    if (
      !Number.isFinite(l.x) ||
      !Number.isFinite(l.y) ||
      l.x < 0 ||
      l.x > 1 ||
      l.y < 0 ||
      l.y > 1
    )
      fail("invalid-coordinate", l.id);
    l.sceneIds.forEach((id) => ref(scenes, id, "scene"));
  }
  c.map.connections.forEach((x) => {
    ref(locations, x.from, "location");
    ref(locations, x.to, "location");
  });
  return out;
}
