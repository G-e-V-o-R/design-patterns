import { localize, useLanguage } from './language';
import { relationshipLabel, type DiagramRelationship, type RelationshipDefinition } from './relationships';

export function RelationshipList({ edges, relationships, classLabel, onRemove, invalidEdgeIndices }: {
  edges: readonly DiagramRelationship[];
  invalidEdgeIndices?: ReadonlySet<number>;
  relationships: readonly RelationshipDefinition[];
  classLabel: (id: string) => string;
  onRemove?: (index: number) => void;
})
{
  const language = useLanguage();
  if (edges.length === 0)
  {
    return null;
  }

  return (
    <ul className="pattern-relations" aria-label={localize(language, 'Diagram relationships', 'Связи на диаграмме')}>
      {edges.map((edge, index) =>
      {
        const source = classLabel(edge.source) || localize(language, '(unnamed endpoint)', '(безымянный класс)');
        const target = classLabel(edge.target) || localize(language, '(unnamed endpoint)', '(безымянный класс)');
        const relation = relationshipLabel(edge.type, relationships);
        const description = `${source} → ${relation} → ${target}`;
        return (
          <li key={index} className={invalidEdgeIndices?.has(index) ? 'is-invalid' : undefined}
            title={invalidEdgeIndices?.has(index) ? localize(language, 'Review this relationship', 'Проверьте эту связь') : undefined}>
            <span><strong>{source}</strong> → {relation} → <strong>{target}</strong></span>
            {onRemove && (
              <button
                type="button"
                aria-label={localize(language, `Remove arrow ${index + 1}: ${description}`, `Удалить стрелку ${index + 1}: ${description}`)}
                title={localize(language, `Remove ${description}`, `Удалить связь ${description}`)}
                onClick={() => onRemove(index)}
              >
                ×
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
