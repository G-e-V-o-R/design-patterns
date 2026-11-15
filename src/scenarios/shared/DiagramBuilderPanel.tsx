import type { DragEvent } from 'react';
import type { PresentedClass, MemberDefinition } from './lessonTypes';

export type CardCategory = 'classes' | 'fields' | 'methods';

const categories = [
  { id: 'classes', label: 'Classes & interfaces', help: 'Add class cards to your diagram.' },
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
  hints: readonly string[];
  hintIndex: number;
  hideAssignedMembers?: boolean;
  onAddClass: (id: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onEndDrag?: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
};

export function DiagramBuilderPanel(props: BuilderProps)
{
  const category = categories.find(item => item.id === props.category);
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
      <p className="pattern-help">{category?.help}</p>
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
      <div className="pattern-hints">
        <button disabled={props.hintIndex >= props.hints.length - 1} onClick={props.onShowHint}>
          Show hint {Math.min(props.hintIndex + 2, props.hints.length)} / {props.hints.length}
        </button>
        {props.hintIndex >= 0 && <p>{props.hints[props.hintIndex]}</p>}
        <button className="pattern-text-button" onClick={props.onShowSolution}>Show solution</button>
      </div>
    </aside>
  );
}

function MemberCard({ member, ...props }: BuilderProps & { member: MemberDefinition })
{
  return (
    <article
      className={`pattern-member-card${props.draggedMemberId === member.id ? ' is-dragging' : ''}`}
      draggable
      onDragStart={event => props.onStartDrag(event, member.id)}
      onDragEnd={props.onEndDrag}
    >
      <span className="pattern-drag-hint">{member.kind} · drag to a class</span>
      <code>{member.label}</code>
      <p className="pattern-method-description">{member.description}</p>

    </article>
  );
}
