import type { DragEvent } from 'react';
import type { PresentedClass, MemberDefinition } from './lessonTypes';

export type CardCategory = 'classes' | 'fields' | 'methods';

const categories = [
  { id: 'classes', label: 'Classes & interfaces', help: undefined },
  { id: 'fields', label: 'Fields', help: 'A field stores data. Drag it onto a class.' },
  { id: 'methods', label: 'Methods', help: 'A method does a job. Drag it onto a class or interface.' },
] as const;

type BuilderProps = {
  classes: readonly PresentedClass[];
  members: readonly MemberDefinition[];
  placedClasses: readonly string[];
  assignments: Record<string, string>;
  category: CardCategory;
  onCategoryChange: (category: CardCategory) => void;
  draggedMemberId: string | null;
  hints?: readonly string[];
  hintIndex?: number;
  hideAssignedMembers?: boolean;
  onAddClass: (id: string) => void;
  onAssign?: (memberId: string, owner: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onEndDrag?: () => void;
  onShowHint?: () => void;
  onShowSolution?: () => void;
};

export function DiagramBuilderPanel(props: BuilderProps)
{
  const category = categories.find(item => item.id === props.category);
  const hasPlacedClasses = props.placedClasses.length > 0;
  let categoryHelp: string | undefined = category?.help;
  if (props.onAssign && props.category !== 'classes')
  {
    categoryHelp = hasPlacedClasses ? 'Choose a class for each card.' : 'Add a class before assigning cards.';
  }
  const memberKind = props.category === 'fields' ? 'field' : 'method';
  const visibleMembers = props.members.filter(member =>
    member.kind === memberKind
    && (!props.hideAssignedMembers || !props.assignments[member.id]));

  return (
    <aside className="pattern-tray">
      <div className="pattern-section-title">
        <h2>Your cards</h2>
        <span>{props.placedClasses.length}/{props.classes.length} classes</span>
      </div>
      <div className="pattern-tabs" role="group" aria-label="Card category">
        {categories.map(item => (
          <button
            key={item.id}
            aria-pressed={props.category === item.id}
            onClick={() => props.onCategoryChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {categoryHelp && <p className="pattern-help">{categoryHelp}</p>}
      <div className="pattern-card-list">
        {props.category === 'classes' && props.classes.map(card => (
          <article key={card.id} className="pattern-tray-card">
            <small>{card.kind}</small>
            <h3>{card.label}</h3>
            <p>{card.description}</p>
            <button disabled={props.placedClasses.includes(card.id)} onClick={() => props.onAddClass(card.id)}>
              {props.placedClasses.includes(card.id) ? '✓ In diagram' : `Add ${card.label}`}
            </button>
          </article>
        ))}
        {props.category !== 'classes' && visibleMembers.map(member => (
          <MemberCard key={member.id} member={member} {...props} />
        ))}
        {props.category !== 'classes' && visibleMembers.length === 0 && <p className="pattern-method-description">All members in this category are already in the diagram.</p>}
      </div>
      {props.hints && props.hintIndex !== undefined && (
        <DiagramHelp hints={props.hints} hintIndex={props.hintIndex} onShowHint={props.onShowHint} onShowSolution={props.onShowSolution} />
      )}
    </aside>
  );
}

function MemberCard({ member, ...props }: BuilderProps & { member: MemberDefinition })
{
  const assign = props.onAssign;
  const assignedClass = props.assignments[member.id] ?? '';
  return (
    <article
      className={`pattern-member-card${props.draggedMemberId === member.id ? ' is-dragging' : ''}`}
      draggable={!assign}
      onDragStart={assign ? undefined : event => props.onStartDrag(event, member.id)}
      onDragEnd={assign ? undefined : props.onEndDrag}
    >
      {!assign && <span className="pattern-drag-hint">{member.kind} · drag to a class</span>}
      <code>{member.label}</code>
      <p className="pattern-method-description">{member.description}</p>
      {assign && (
        <select
          aria-label={`Assign ${member.label} to a class`}
          disabled={props.placedClasses.length === 0}
          value={assignedClass}
          onChange={event => assign(member.id, event.target.value)}
        >
          <option value="">{assignedClass ? 'Remove from class' : 'Choose a class'}</option>
          {props.classes.filter(card => props.placedClasses.includes(card.id)).map(card => (
            <option key={card.id} value={card.id}>{card.label}</option>
          ))}
        </select>
      )}
    </article>
  );
}

export function DiagramHelp({ hints, hintIndex, onShowHint, onShowSolution }: {
  hints: readonly string[];
  hintIndex: number;
  onShowHint?: () => void;
  onShowSolution?: () => void;
})
{
  return (
    <div className="pattern-hints">
      {hints.length > 0 && (
        <button disabled={hintIndex >= hints.length - 1} onClick={onShowHint}>
          Show hint {Math.min(hintIndex + 2, hints.length)} / {hints.length}
        </button>
      )}
      <button className="pattern-text-button" onClick={onShowSolution}>Show solution</button>
      <div aria-live="polite">{hintIndex >= 0 && <p>{hints[hintIndex]}</p>}</div>
    </div>
  );
}
