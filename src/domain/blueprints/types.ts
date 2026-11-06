export interface Role {
  readonly id: string;
  readonly label: string;
  readonly assetId: string;
  readonly characterId?: string;
}
export interface Edge {
  readonly source: string;
  readonly target: string;
  readonly type: string;
}
export interface Graph {
  readonly roles: readonly string[];
  readonly edges: readonly Edge[];
}
export interface SimulationCase {
  readonly id: string;
  readonly input: string;
  readonly path: readonly Edge[];
  readonly recipients: readonly string[];
}
export interface Blueprint {
  readonly id: string;
  readonly pattern: string;
  readonly roles: readonly Role[];
  readonly edgeTypes: readonly string[];
  readonly solution: Graph;
  readonly hints: readonly string[];
  readonly explanation: string;
  readonly simulations: readonly SimulationCase[];
}
