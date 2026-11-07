import { relationshipKinds, type LessonGraph } from './model';
import { label } from './lessonContent';

export function ObserverRelations({ edges, issueEdgeIndices, onRemoveEdge }: {
  edges: LessonGraph['edges'];
  issueEdgeIndices: Set<number>;
  onRemoveEdge: (index: number) => void;
}) {
  return <>
    <div className="lesson-arrow-help" aria-label="What the arrows mean">{relationshipKinds.map(kind => <p id={`arrow-help-${kind.id}`} key={kind.id}>{kind.description}</p>)}</div>
    {edges.length > 0 && <ul className="lesson-relations" aria-label="Diagram relationships">{edges.map((edge,index) => <li key={index} className={issueEdgeIndices.has(index) ? "needs-fix" : undefined}><span>{issueEdgeIndices.has(index) && <b className="lesson-fix-label">Fix this arrow</b>}<strong>{label(edge.source)}</strong> <em>{relationshipKinds.find(kind => kind.id === edge.type)?.label}</em> <strong>{label(edge.target)}</strong></span><button aria-label={`Remove relationship ${index+1}`} onClick={() => onRemoveEdge(index)}>×</button></li>)}</ul>}
  </>;
}
