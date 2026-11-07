import type { DragEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { connectionHandles, memberCards } from './model';
import { methodDragType } from './lessonContent';

type MemberKind = 'field' | 'method';

// Данные, которые React Flow передаёт узлу. Это похоже на отдельную структуру
// с полями карточки и функциями, нужными для обработки действий пользователя.
export type ObserverClassNodeData = {
  classHasValidationIssue: boolean;
  memberIdsWithIssues: string[];
  draggedMemberId: string | null;
  onStartMemberDrag: (event: DragEvent, id: string) => void;
  onEndMemberDrag: () => void;
  isMemberDropTarget: boolean;
  onDropMember: (id: string) => void;
  onMemberDragHover: (isHovering: boolean) => void;
  label: string;
  kind: string;
  members: typeof memberCards;
  artwork?: { src: string; alt: string };
  onRemoveClass: () => void;
};

// Тип конкретного узла диаграммы: библиотека React Flow также хранит его ID,
// координаты и служебные свойства, помимо данных ObserverClassNodeData.
export type ObserverClassNode = Node<ObserverClassNodeData, 'lessonClass'>;

const handlePositions = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};

// React Flow вызывает этот компонент для отображения одной карточки класса.
// Входной объект nodeProps содержит поле data с данными, подготовленными уроком.
export function ObserverClassDiagramNode({ data }: NodeProps<ObserverClassNode>)
{
  function handleMemberDragOver(event: DragEvent<HTMLDivElement>)
  {
    // Проверяем тип перетаскиваемых данных, чтобы не перехватывать чужие drag-события.
    if (!event.dataTransfer.types.includes(methodDragType))
    {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    data.onMemberDragHover(true);
  }

  function handleMemberDragLeave(event: DragEvent<HTMLDivElement>)
  {
    // Переход между дочерними элементами карточки не должен считаться выходом мыши.
    if (event.relatedTarget instanceof Element && event.currentTarget.contains(event.relatedTarget))
    {
      return;
    }

    data.onMemberDragHover(false);
  }

  function handleMemberDrop(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(methodDragType))
    {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    data.onMemberDragHover(false);
    data.onDropMember(event.dataTransfer.getData(methodDragType));
    data.onEndMemberDrag();
  }

  const isInterface = data.kind.toLowerCase().includes('interface');
  const className = [
    'lesson-class',
    isInterface && 'is-interface',
    data.isMemberDropTarget && 'is-drop-target',
    data.classHasValidationIssue && 'needs-fix',
  ].filter(Boolean).join(' ');

  return (
    <div
      style={{ overflow: 'visible' }}
      className={className}
      onDragOver={handleMemberDragOver}
      onDragLeave={handleMemberDragLeave}
      onDrop={handleMemberDrop}
    >
      {connectionHandles.map(handleSide =>
      {
        return (
          <Handle
            key={handleSide}
            id={handleSide}
            type="source"
            position={handlePositions[handleSide]}
          />
        );
      })}
      <ClassCardHeading
        data={data}
        onRemoveClass={data.onRemoveClass}
      />
      <ClassMemberSections
        data={data}
        onStartMemberDrag={data.onStartMemberDrag}
        onEndMemberDrag={data.onEndMemberDrag}
      />
      {data.artwork && (
        <div className="lesson-class-artwork scenario-class-artwork">
          <img src={data.artwork.src} alt={data.artwork.alt} draggable={false}/>
        </div>
      )}
    </div>
  );
}

type ClassCardHeadingInputs = {
  data: ObserverClassNodeData;
  onRemoveClass: () => void;
};

function ClassCardHeading({
  data,
  onRemoveClass,
}: ClassCardHeadingInputs)
{
  return (
    <div className="lesson-class-title">
      <small>{data.kind}</small>
      <strong>{data.label}</strong>
      {data.classHasValidationIssue && (
        <span className="lesson-fix-label">Fix this</span>
      )}
      <button
        className="nodrag"
        aria-label={`Remove ${data.label} from diagram`}
        onClick={onRemoveClass}
      >
        ×
      </button>
    </div>
  );
}

type ClassMemberSectionsInputs = {
  data: ObserverClassNodeData;
  onStartMemberDrag: (event: DragEvent, id: string) => void;
  onEndMemberDrag: () => void;
};

function ClassMemberSections({
  data,
  onStartMemberDrag,
  onEndMemberDrag,
}: ClassMemberSectionsInputs)
{
  const memberKinds: MemberKind[] = ['field', 'method'];

  return (
    <>
      {memberKinds.map(memberKind =>
      {
        const membersOfKind = data.members.filter(member => member.kind === memberKind);
        let sectionTitle = 'Methods';
        if (memberKind === 'field')
        {
          sectionTitle = 'Fields';
        }

        // Не показываем пустую секцию полей; методы остаются видимыми,
        // чтобы пользователь знал, куда их можно перетащить.
        if (memberKind === 'field' && membersOfKind.length === 0)
        {
          return null;
        }

        return (
          <div key={memberKind} className="lesson-class-members">
            <small className="lesson-member-heading">{sectionTitle}</small>
            <MemberSectionContent
              members={membersOfKind}
              data={data}
              onStartMemberDrag={onStartMemberDrag}
              onEndMemberDrag={onEndMemberDrag}
            />
          </div>
        );
      })}
    </>
  );
}

type MemberSectionContentInputs = {
  members: (typeof memberCards)[number][];
  data: ObserverClassNodeData;
  onStartMemberDrag: (event: DragEvent, id: string) => void;
  onEndMemberDrag: () => void;
};

function MemberSectionContent({
  members,
  data,
  onStartMemberDrag,
  onEndMemberDrag,
}: MemberSectionContentInputs)
{
  if (members.length === 0)
  {
    return <p>Drop fields or methods here</p>;
  }

  return (
    <>
      {members.map(member =>
      {
        return (
          <ClassMemberCard
            key={member.id}
            member={member}
            data={data}
            onStartMemberDrag={onStartMemberDrag}
            onEndMemberDrag={onEndMemberDrag}
          />
        );
      })}
    </>
  );
}

type ClassMemberCardInputs = {
  member: (typeof memberCards)[number];
  data: ObserverClassNodeData;
  onStartMemberDrag: (event: DragEvent, id: string) => void;
  onEndMemberDrag: () => void;
};

function ClassMemberCard({
  member,
  data,
  onStartMemberDrag,
  onEndMemberDrag,
}: ClassMemberCardInputs)
{
  const isBeingDragged = data.draggedMemberId === member.id;
  const hasValidationIssue = data.memberIdsWithIssues.includes(member.id);
  const className = [
    'lesson-assigned-method',
    'nodrag',
    'nopan',
    isBeingDragged && 'is-dragging',
    hasValidationIssue && 'needs-fix',
  ].filter(Boolean).join(' ');

  let memberSymbol = '+';
  if (member.kind === 'field')
  {
    memberSymbol = '−';
  }

  return (
    <div
      className={className}
      draggable
      title="Drag to another class, or to an empty area to remove it from this class"
      onDragStart={event => onStartMemberDrag(event, member.id)}
      onDragEnd={onEndMemberDrag}
    >
      <span>{memberSymbol}</span>
      <code>{member.label}</code>
      {hasValidationIssue && (
        <small className="lesson-fix-label">Fix this</small>
      )}
    </div>
  );
}

export const nodeTypes = { lessonClass: ObserverClassDiagramNode };
