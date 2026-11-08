import type { LessonGraph } from './model';
import { label } from './lessonContent';

type ObserverRelationsProps = {
  edges: LessonGraph['edges'];
  issueEdgeIndices: Set<number>;
  onRemoveEdge: (index: number) => void;
};

export function ObserverRelations({
  edges,
  issueEdgeIndices,
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
              hasValidationIssue={issueEdgeIndices.has(edgeIndex)}
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
  hasValidationIssue,
  onRemove,
}: {
  edge: LessonGraph['edges'][number];
  edgeIndex: number;
  hasValidationIssue: boolean;
  onRemove: (index: number) => void;
})
{
  const sourceLabel = label(edge.source) || '(unnamed endpoint)';
  const targetLabel = label(edge.target) || '(unnamed endpoint)';
  let rowClassName: string | undefined;
  if (hasValidationIssue)
  {
    rowClassName = 'needs-fix';
  }

  return (
    <li className={rowClassName}>
      <span>
        {hasValidationIssue && (
          <b className="lesson-fix-label">Fix this arrow</b>
        )}
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
