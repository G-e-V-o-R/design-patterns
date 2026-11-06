import { Graph } from "../blueprints/types";
export interface Save {
  readonly schemaVersion: 1;
  readonly contentVersion: number;
  readonly chapterId: string;
  readonly sceneId: string;
  readonly flags: Readonly<Record<string, string>>;
  readonly askedQuestionIds: readonly string[];
  readonly puzzles: Readonly<
    Record<
      string,
      {
        readonly graph: Graph;
        readonly completed: boolean;
        readonly assisted: boolean;
      }
    >
  >;
}
// Persistence and runtime import validation are implemented in Stage 2.
