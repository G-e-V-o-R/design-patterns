import type { LessonGraph } from './model';
import { label } from './lessonContent';

type ObserverRelationsProps = {
  edges: LessonGraph['edges'];
  onRemoveEdge: (index: number) => void;
};

export function ObserverRelations({
  edges,
  onRemoveEdge,
}: ObserverRelationsProps)
{
  return (
    <>
      {edges.length > 0 && (
        <ul className="lesson-relations" aria-label="Diagram relationships">
          {edges.map((edge, edgeIndex) => (
            <RelationshipRow
              key={edgeIndex}
              edge={edge}
              edgeIndex={edgeIndex}
              onRemove={onRemoveEdge}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function RelationshipRow({
  edge,
  edgeIndex,
  onRemove,
}: {
  edge: LessonGraph['edges'][number];
  edgeIndex: number;
  onRemove: (index: number) => void;
})
{
  const sourceLabel = label(edge.source) || '(unnamed endpoint)';
  const targetLabel = label(edge.target) || '(unnamed endpoint)';

  return (
    <li>
      <span>
        <strong>{sourceLabel}</strong>
        <strong>{targetLabel}</strong>
      </span>
      <button
        type="button"
        aria-label={`Remove arrow ${edgeIndex + 1}`}
        title={`Remove arrow ${edgeIndex + 1}`}
        onClick={() => onRemove(edgeIndex)}
      >
        ×
      </button>
    </li>
  );
}
