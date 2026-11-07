import { relationshipKinds, type LessonGraph } from './model';
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
      <RelationshipLegend />
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

function RelationshipLegend()
{
  return (
    <div className="lesson-arrow-help" aria-label="What the arrows mean">
      {relationshipKinds.map(kind => (
        <p id={`arrow-help-${kind.id}`} key={kind.id}>
          {kind.description}
        </p>
      ))}
    </div>
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
  const relationshipKind = relationshipKinds.find(kind =>
    kind.id === edge.type);
  let relationshipLabel = '';
  if (relationshipKind)
  {
    relationshipLabel = relationshipKind.label;
  }

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
        <strong>{label(edge.source)}</strong>
        <em>{relationshipLabel}</em>
        <strong>{label(edge.target)}</strong>
      </span>
      <button
        aria-label={`Remove relationship ${edgeIndex + 1}`}
        onClick={() => onRemove(edgeIndex)}
      >
        ×
      </button>
    </li>
  );
}
