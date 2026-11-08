import {
  classLabel,
  relationshipKinds,
  type MediatorGraph,
} from './model';

type MediatorRelationsProps = {
  graph: MediatorGraph;
  issueEdgeIndices: Set<number>;
  onRemoveEdge: (index: number) => void;
};

export function MediatorRelations({
  graph,
  issueEdgeIndices,
  onRemoveEdge,
}: MediatorRelationsProps)
{
  return (
    <>
      {graph.edges.length > 0 && (
        <ul className="med-relations" aria-label="Mediator relationships">
          {graph.edges.map((edge, index) =>
          {
            const hasIssue = issueEdgeIndices.has(index);
            const relationshipLabel = relationshipKinds.find(kind =>
              kind.id === edge.type)?.label;

            return (
              <li
                className={hasIssue ? 'med-needs-fix' : ''}
                key={index}
              >
                <span>
                  {classLabel(edge.source)}
                  {' '}
                  <em>{relationshipLabel}</em>
                  {' '}
                  {classLabel(edge.target)}
                  {hasIssue && (
                    <b className="med-fix">Fix this arrow</b>
                  )}
                </span>
                <button
                  aria-label={`Remove mediator relationship ${index + 1}`}
                  onClick={() => onRemoveEdge(index)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
