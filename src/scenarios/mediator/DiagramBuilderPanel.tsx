import type { DragEvent } from 'react';
import {
  classCards,
  hints,
  memberCards,
  type MediatorGraph,
} from './model';

type Tab = 'classes' | 'members';

type MediatorTrayProps = {
  graph: MediatorGraph;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  draggedMember: string | null;
  hint: number;
  onAddClass: (id: string) => void;
  onAssign: (memberId: string, owner: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onDragEnd: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
};

export function MediatorTray({
  graph,
  tab,
  onTabChange,
  draggedMember,
  hint,
  onAddClass,
  onAssign,
  onStartDrag,
  onDragEnd,
  onShowHint,
  onShowSolution,
}: MediatorTrayProps)
{
  return (
    <aside className="med-tray">
      <h2>
        Your cards <small>{graph.classes.length}/6 classes</small>
      </h2>

      <div className="med-tabs" role="group" aria-label="Mediator card category">
        <button
          aria-pressed={tab === 'classes'}
          onClick={() => onTabChange('classes')}
        >
          Classes & interface
        </button>
        <button
          aria-pressed={tab === 'members'}
          onClick={() => onTabChange('members')}
        >
          Fields & methods
        </button>
      </div>

      <p className="med-help">
        {tab === 'classes'
          ? 'Add the six cards. Their relationships describe who each class knows.'
          : 'Choose a class for each member, or drag the member onto a diagram card. Choose “Unassigned” to remove it.'}
      </p>

      {tab === 'classes'
        ? (
          <ClassCards
            graph={graph}
            onAddClass={onAddClass}
          />
        )
        : (
          <MemberCards
            graph={graph}
            draggedMember={draggedMember}
            onAssign={onAssign}
            onStartDrag={onStartDrag}
            onDragEnd={onDragEnd}
          />
        )}

      <div className="med-hints">
        <button
          disabled={hint === hints.length - 1}
          onClick={onShowHint}
        >
          Show hint {Math.min(hint + 2, 3)} / 3
        </button>
        {hint >= 0 && <p>{hints[hint]}</p>}
        <button className="med-text-button" onClick={onShowSolution}>
          Show solution
        </button>
      </div>
    </aside>
  );
}

type ClassCardsProps = {
  graph: MediatorGraph;
  onAddClass: (id: string) => void;
};

function ClassCards({ graph, onAddClass }: ClassCardsProps)
{
  return (
    <div className="med-card-list">
      {classCards.map(card =>
      {
        const isInDiagram = graph.classes.includes(card.id);

        return (
          <article key={card.id} className="med-tray-card">
            <small>{card.kind}</small>
            <h3>{card.label}</h3>
            <p>{card.description}</p>
            <button
              disabled={isInDiagram}
              onClick={() => onAddClass(card.id)}
            >
              {isInDiagram ? '✓ In diagram' : `Add ${card.label}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}

type MemberCardsProps = {
  graph: MediatorGraph;
  draggedMember: string | null;
  onAssign: (memberId: string, owner: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onDragEnd: () => void;
};

function MemberCards({
  graph,
  draggedMember,
  onAssign,
  onStartDrag,
  onDragEnd,
}: MemberCardsProps)
{
  return (
    <div className="med-card-list">
      {memberCards.map(member =>
      {
        const isDragging = draggedMember === member.id;
        const cardClassName = 'med-member-card'
          + (isDragging ? ' is-dragging' : '');

        return (
          <article
            draggable
            onDragStart={event => onStartDrag(event, member.id)}
            onDragEnd={onDragEnd}
            key={member.id}
            className={cardClassName}
          >
            <small>{member.kind} · drag or assign</small>
            <code>{member.label}</code>
            <p>{member.description}</p>
            <label>
              Assign to
              <select
                aria-label={`Assign ${member.label}`}
                value={graph.members[member.id] ?? ''}
                onChange={event => onAssign(member.id, event.target.value)}
              >
                <option value="">Unassigned</option>
                {classCards
                  .filter(card => graph.classes.includes(card.id))
                  .map(card => (
                    <option key={card.id} value={card.id}>
                      {card.label}
                    </option>
                  ))}
              </select>
            </label>
          </article>
        );
      })}
    </div>
  );
}
