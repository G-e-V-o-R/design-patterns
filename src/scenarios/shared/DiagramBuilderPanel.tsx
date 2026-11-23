import { localize, useLanguage } from './language';
import type { DragEvent } from 'react';
import type { PresentedClass, MemberDefinition } from './lessonTypes';

export type CardCategory = 'classes' | 'fields' | 'methods';

const categories = [
  { id: 'classes', label: 'Classes & interfaces', russianLabel: 'Классы и интерфейсы', help: undefined },
  { id: 'fields', label: 'Fields', russianLabel: 'Поля', help: { en: 'A field stores data. Drag it onto a class.', ru: 'Поле хранит данные. Перетащите его на класс.' } },
  { id: 'methods', label: 'Methods', russianLabel: 'Методы', help: { en: 'A method does a job. Drag it onto a class or interface.', ru: 'Метод выполняет действие. Перетащите его на класс или интерфейс.' } },
] as const;

type BuilderProps = {
  classes: readonly PresentedClass[];
  members: readonly MemberDefinition[];
  placedClasses: readonly string[];
  assignments: Record<string, string>;
  category: CardCategory;
  onCategoryChange: (category: CardCategory) => void;
  draggedMemberId: string | null;
  hideAssignedMembers?: boolean;
  onAddClass: (id: string) => void;
  onAssign?: (memberId: string, owner: string) => void;
  onStartDrag: (event: DragEvent, id: string) => void;
  onEndDrag?: () => void;
};

export function DiagramBuilderPanel(props: BuilderProps)
{
  const language = useLanguage();
  const category = categories.find(item => item.id === props.category);
  const hasPlacedClasses = props.placedClasses.length > 0;
  let categoryHelp: string | undefined = category?.help?.[language];
  if (props.onAssign && props.category !== 'classes')
  {
    categoryHelp = hasPlacedClasses ? localize(language, 'Choose a class for each card.', 'Выберите класс для каждой карточки.') : localize(language, 'Add a class before assigning cards.', 'Сначала добавьте класс.');
  }
  const memberKind = props.category === 'fields' ? 'field' : 'method';
  const visibleMembers = props.members.filter(member =>
    member.kind === memberKind
    && (!props.hideAssignedMembers || !props.assignments[member.id]));

  return (
    <aside className="pattern-tray">
      <div className="pattern-section-title">
        <h2>{localize(language, 'Your cards', 'Ваши карточки')}</h2>
      </div>
      <div className="pattern-tabs" role="group" aria-label={localize(language, 'Card category', 'Категория карточек')}>
        {categories.map(item => (
          <button
            key={item.id}
            aria-pressed={props.category === item.id}
            onClick={() => props.onCategoryChange(item.id)}
          >
            {localize(language, item.label, item.russianLabel)}
          </button>
        ))}
      </div>
      {categoryHelp && <p className="pattern-help">{categoryHelp}</p>}
      <div className="pattern-card-list">
        {props.category === 'classes' && props.classes.map(card => (
          <article key={card.id} className="pattern-tray-card">
            <small>{localize(language, card.kind, card.variant === 'class' ? 'класс' : 'интерфейс')}</small>
            <h3>{card.label}</h3>
            <p>{card.description}</p>
            <button disabled={props.placedClasses.includes(card.id)} onClick={() => props.onAddClass(card.id)}>
              {props.placedClasses.includes(card.id) ? localize(language, '✓ In diagram', '✓ На диаграмме') : localize(language, `Add ${card.label}`, `Добавить ${card.label}`)}
            </button>
          </article>
        ))}
        {props.category !== 'classes' && visibleMembers.map(member => (
          <MemberCard key={member.id} member={member} {...props} />
        ))}
        {props.category !== 'classes' && visibleMembers.length === 0 && <p className="pattern-method-description">{localize(language, 'All members in this category are already in the diagram.', 'Все карточки этой категории уже на диаграмме.')}</p>}
      </div>
    </aside>
  );
}

function MemberCard({ member, ...props }: BuilderProps & { member: MemberDefinition })
{
  const language = useLanguage();
  const assign = props.onAssign;
  const assignedClass = props.assignments[member.id] ?? '';
  const dragHint = localize(language, `${member.kind} · drag to a class`,
    member.kind === 'field' ? 'поле · перетащите на класс' : 'метод · перетащите на класс');
  return (
    <article
      className={`pattern-member-card${props.draggedMemberId === member.id ? ' is-dragging' : ''}`}
      draggable={!assign}
      onDragStart={assign ? undefined : event => props.onStartDrag(event, member.id)}
      onDragEnd={assign ? undefined : props.onEndDrag}
    >
      {!assign && <span className="pattern-drag-hint">{dragHint}</span>}
      <code>{member.label}</code>
      <p className="pattern-method-description">{member.description}</p>
      {assign && (
        <select
          aria-label={localize(language, `Assign ${member.label} to a class`, `Назначить ${member.label} классу`)}
          disabled={props.placedClasses.length === 0}
          value={assignedClass}
          onChange={event => assign(member.id, event.target.value)}
        >
          <option value="">{assignedClass ? localize(language, 'Remove from class', 'Убрать из класса') : localize(language, 'Choose a class', 'Выбрать класс')}</option>
          {props.classes.filter(card => props.placedClasses.includes(card.id)).map(card => (
            <option key={card.id} value={card.id}>{card.label}</option>
          ))}
        </select>
      )}
    </article>
  );
}
