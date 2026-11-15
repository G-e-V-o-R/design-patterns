import { relationshipLabel, type DiagramRelationship, type RelationshipDefinition } from './relationships';

export function RelationshipList({ edges, relationships, classLabel, onRemove, invalidEdgeIndices }: {
  edges: readonly DiagramRelationship[];
  invalidEdgeIndices?: ReadonlySet<number>;
  relationships: readonly RelationshipDefinition[];
  classLabel: (id: string) => string;
  onRemove: (index: number) => void;
})
{
  if (edges.length === 0)
  {
    return null;
  }

  return (
    <ul className="pattern-relations" aria-label="Diagram relationships">
      {edges.map((edge, index) =>
      {
        const source = classLabel(edge.source) || '(unnamed endpoint)';
        const target = classLabel(edge.target) || '(unnamed endpoint)';
        const relation = relationshipLabel(edge.type, relationships);
        const description = `${source} → ${relation} → ${target}`;
        return (
          <li key={index} className={invalidEdgeIndices?.has(index) ? 'is-invalid' : undefined}
            title={invalidEdgeIndices?.has(index) ? 'Review this relationship' : undefined}>
            <span><strong>{source}</strong> → {relation} → <strong>{target}</strong></span>
            <button
              type="button"
              aria-label={`Remove arrow ${index + 1}: ${description}`}
              title={`Remove ${description}`}
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          </li>
        );
      })}
    </ul>
  );
}
