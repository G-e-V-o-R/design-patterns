export interface Asset {
  readonly id: string;
  readonly sourcePath: string;
}
export interface Character {
  readonly id: string;
  readonly name: string;
  readonly portraitAssetId: string;
  readonly companion: string;
}
export interface Location {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly kind: "landmark" | "encounter";
  readonly sceneIds: readonly string[];
  readonly locked: boolean;
}
export interface WorldMap {
  readonly assetId: string;
  readonly locations: readonly Location[];
  readonly connections: readonly {
    readonly from: string;
    readonly to: string;
  }[];
}
