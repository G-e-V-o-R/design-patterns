import {
  classCards,
  classLabel,
  relationshipKinds,
  type MediatorGraph,
} from './model';

type MediatorRelationsProps = {
  graph: MediatorGraph;
  source: string;
  target: string;
  relationship: string;
  issueEdgeIndices: Set<number>;
  onSourceChange: (id: string) => void;
  onTargetChange: (id: string) => void;
  onRelationshipChange: (type: string) => void;
  onConnect: () => void;
  onRemoveEdge: (index: number) => void;
};

export function MediatorRelations({
  graph,
  source,
  target,
  relationship,
  issueEdgeIndices,
  onSourceChange,
  onTargetChange,
  onRelationshipChange,
  onConnect,
  onRemoveEdge,
}: MediatorRelationsProps)
{
  const availableClasses = classCards.filter(card =>
    graph.classes.includes(card.id));

  return (
    <>
      <div className="med-connections">
        <h3>Connect classes</h3>
        <p>
          Choose the relationship for both the controls below and arrows
          dragged from the bottom of one card to the top of another.
        </p>

        <div className="med-connect-fields">
          <label>
            From
            <select
              value={graph.classes.includes(source) ? source : ''}
              onChange={event => onSourceChange(event.target.value)}
            >
              <option value="">Choose class</option>
              {availableClasses.map(card => (
                <option value={card.id} key={card.id}>
                  {card.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Relationship
            <select
              value={relationship}
              onChange={event => onRelationshipChange(event.target.value)}
            >
              {relationshipKinds.map(kind => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            To
            <select
              value={graph.classes.includes(target) ? target : ''}
              onChange={event => onTargetChange(event.target.value)}
            >
              <option value="">Choose class</option>
              {availableClasses.map(card => (
                <option value={card.id} key={card.id}>
                  {card.label}
                </option>
              ))}
            </select>
          </label>

          <button onClick={onConnect}>Add relationship</button>
        </div>

        <div className="med-arrow-help">
          {relationshipKinds.map(kind => (
            <p key={kind.id}>{kind.description}</p>
          ))}
        </div>
      </div>

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
