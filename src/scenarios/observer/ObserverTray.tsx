import type { DragEvent } from 'react';
import { classCards, memberCards, type LessonGraph } from './model';
import { hints } from './lessonContent';

type Tab = 'classes' | 'fields' | 'methods';

export function ObserverTray({ graph, tab, onTabChange, draggedMethod, issueClassIds, issueMemberIds, hint, onAddClass, onStartMethodDrag, onShowHint, onShowSolution }: {
  graph: LessonGraph;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  draggedMethod: string | null;
  issueClassIds: Set<string>;
  issueMemberIds: string[];
  hint: number;
  onAddClass: (id: string) => void;
  onStartMethodDrag: (event: DragEvent, id: string) => void;
  onShowHint: () => void;
  onShowSolution: () => void;
}) {
  return <aside className="lesson-tray"><div className="lesson-section-title"><h2>Your cards</h2><span>{graph.classes.length}/4 classes</span></div><div className="lesson-tabs" role="group" aria-label="Card category"><button aria-pressed={tab === 'classes'} onClick={() => onTabChange('classes')}>Classes & interface</button><button aria-pressed={tab === 'fields'} onClick={() => onTabChange('fields')}>Fields</button><button aria-pressed={tab === 'methods'} onClick={() => onTabChange('methods')}>Methods</button></div>
    <p className="lesson-help">{tab === 'classes' ? 'Add class cards to your diagram.' : tab === 'fields' ? 'A field stores data. Drag a field onto a class. To move it, drag it to another class. To take it out, drag it to an empty area.' : 'A method does a job. Drag a method onto a class or interface. To move it, drag it to another class. To take it out, drag it to an empty area.'}</p>
    {tab === 'classes' ? <ClassCards graph={graph} issueClassIds={issueClassIds} onAddClass={onAddClass}/> : <MemberCards tab={tab} draggedMethod={draggedMethod} issueMemberIds={issueMemberIds} onStartMethodDrag={onStartMethodDrag}/>}
    <div className="lesson-hints"><button onClick={onShowHint} disabled={hint === hints.length - 1}>Show hint {Math.min(hint + 2, 3)} / 3</button>{hint >= 0 && <p>{hints[hint]}</p>}<button className="lesson-text-button" onClick={onShowSolution}>Show solution</button></div>
  </aside>;
}

function ClassCards({ graph, issueClassIds, onAddClass }: { graph: LessonGraph; issueClassIds: Set<string>; onAddClass: (id: string) => void }) {
  return <div className="lesson-card-list">{classCards.map(card => <article className={"lesson-tray-card" + (issueClassIds.has(card.id) ? " needs-fix" : "")} key={card.id}><small>{card.kind}</small><h3>{card.label}</h3>{issueClassIds.has(card.id) && <span className="lesson-fix-label">Fix this</span>}<p>{card.description}</p><button disabled={graph.classes.includes(card.id)} onClick={() => onAddClass(card.id)}>{graph.classes.includes(card.id) ? '✓ In diagram' : '+ Add to diagram'}</button></article>)}</div>;
}

function MemberCards({ tab, draggedMethod, issueMemberIds, onStartMethodDrag }: { tab: Tab; draggedMethod: string | null; issueMemberIds: string[]; onStartMethodDrag: (event: DragEvent, id: string) => void }) {
  return <div className="lesson-card-list">{memberCards.filter(member => member.kind === (tab === 'fields' ? 'field' : 'method')).map(member => <article className={'lesson-member-card' + (draggedMethod === member.id ? ' is-dragging' : '') + (issueMemberIds.includes(member.id) ? ' needs-fix' : '')} key={member.id} draggable onDragStart={event => onStartMethodDrag(event, member.id)}><span className="lesson-drag-hint" aria-hidden="true">⠿ Drag to a class</span><code>{member.label}</code>{issueMemberIds.includes(member.id) && <span className="lesson-fix-label">Fix this</span>}<p className="lesson-method-description">{member.description}</p></article>)}</div>;
}
