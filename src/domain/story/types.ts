export interface Condition {
  readonly flag: string;
  readonly equals: string;
}
export interface Line {
  readonly text: string;
  readonly speaker?: string;
  readonly when?: Condition;
}
export interface Choice {
  readonly id: string;
  readonly text: string;
  readonly target: string;
  readonly effects?: Readonly<Record<string, string>>;
}
export interface Question {
  readonly id: string;
  readonly text: string;
  readonly reply: Line;
}
export interface Scene {
  readonly id: string;
  readonly lines: readonly Line[];
  readonly choices?: readonly Choice[];
  readonly questions?: readonly Question[];
  readonly next?: string;
  readonly puzzleId?: string;
  readonly assetId?: string;
  readonly terminal?: boolean;
}
export interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly contentVersion: number;
  readonly start: string;
  readonly flags: Readonly<Record<string, readonly string[]>>;
  readonly scenes: readonly Scene[];
}
