import type { DragEvent } from 'react';
import { classCards, hints, memberCards, type MediatorGraph } from './model';

type Tab = 'classes' | 'members';

export function MediatorTray({ graph, tab, onTabChange, draggedMember, issueClassIds, issueMemberIds, hint, onAddClass, onAssign, onStartDrag, onDragEnd, onShowHint, onShowSolution }: {
  graph: MediatorGraph;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  draggedMember: string | null;
  issueClassIds: Set<string>;
  issueMemberIds: Set<string>;
  hint: number;
  onAddClass: (id: string) => void;
  onAssign: (memberId: string, owner: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onDragEnd: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
}) {
  return <aside className="med-tray"><h2>Your cards <small>{graph.classes.length}/6 classes</small></h2><div className="med-tabs" role="group" aria-label="Mediator card category"><button aria-pressed={tab === 'classes'} onClick={() => onTabChange('classes')}>Classes & interface</button><button aria-pressed={tab === 'members'} onClick={() => onTabChange('members')}>Fields & methods</button></div>
    <p className="med-help">{tab === 'classes' ? 'Add the six cards. Their relationships describe who each class knows.' : 'Choose a class for each member, or drag the member onto a diagram card. Choose “Unassigned” to remove it.'}</p>
    {tab === 'classes'
      ? <ClassCards graph={graph} issueClassIds={issueClassIds} onAddClass={onAddClass}/>
      : <MemberCards graph={graph} draggedMember={draggedMember} issueMemberIds={issueMemberIds} onAssign={onAssign} onStartDrag={onStartDrag} onDragEnd={onDragEnd}/>}
    <div className="med-hints"><button disabled={hint === hints.length - 1} onClick={onShowHint}>Show hint {Math.min(hint + 2, 3)} / 3</button>{hint >= 0 && <p>{hints[hint]}</p>}<button className="med-text-button" onClick={onShowSolution}>Show solution</button></div>
  </aside>;
}

function ClassCards({ graph, issueClassIds, onAddClass }: { graph: MediatorGraph; issueClassIds: Set<string>; onAddClass: (id: string) => void }) {
  return <div className="med-card-list">{classCards.map(card => <article key={card.id} className={'med-tray-card' + (issueClassIds.has(card.id) ? ' med-needs-fix' : '')}><small>{card.kind}</small><h3>{card.label}</h3><p>{card.description}</p>{issueClassIds.has(card.id) && <span className="med-fix">Fix this</span>}<button disabled={graph.classes.includes(card.id)} onClick={() => onAddClass(card.id)}>{graph.classes.includes(card.id) ? '✓ In diagram' : `Add ${card.label}`}</button></article>)}</div>;
}

function MemberCards({ graph, draggedMember, issueMemberIds, onAssign, onStartDrag, onDragEnd }: { graph: MediatorGraph; draggedMember: string | null; issueMemberIds: Set<string>; onAssign: (memberId: string, owner: string) => void; onStartDrag: (event: DragEvent, id: string) => void; onDragEnd: () => void }) {
  return <div className="med-card-list">{memberCards.map(member => <article draggable onDragStart={event => onStartDrag(event, member.id)} onDragEnd={onDragEnd} key={member.id} className={'med-member-card' + (draggedMember === member.id ? ' is-dragging' : '') + (issueMemberIds.has(member.id) ? ' med-needs-fix' : '')}><small>{member.kind} · drag or assign</small><code>{member.label}</code><p>{member.description}</p>{issueMemberIds.has(member.id) && <span className="med-fix">Fix this</span>}<label>Assign to<select aria-label={`Assign ${member.label}`} value={graph.members[member.id] ?? ''} onChange={event => onAssign(member.id, event.target.value)}><option value="">Unassigned</option>{classCards.filter(card => graph.classes.includes(card.id)).map(card => <option key={card.id} value={card.id}>{card.label}</option>)}</select></label></article>)}</div>;
}
