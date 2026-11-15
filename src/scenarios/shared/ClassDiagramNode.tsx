import type { DragEvent } from 'react';
import { Handle, Position } from '@xyflow/react';
import { connectionHandles } from './connections';
import { requireClassArtwork } from './classArtwork';
import type { ClassAppearance, MemberDefinition } from './lessonTypes';

export type DiagramHandle = {
  id?: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  type: 'source' | 'target';
};

export type ClassDiagramCardProps = ClassAppearance & {
  label: string;
  kind: string;
  members: readonly MemberDefinition[];
  invalidMemberIds?: ReadonlySet<string>;
  handles?: readonly DiagramHandle[];
  dragType: string;
  isDropTarget: boolean;
  onRemove: () => void;
  onAssign: (id: string) => void;
  onDragHover: (hovered: boolean) => void;
  draggedMemberId?: string | null;
  onStartMemberDrag?: (event: DragEvent, id: string) => void;
  onEndMemberDrag?: () => void;
};

const defaultHandles: readonly DiagramHandle[] = connectionHandles.map(side => ({
  id: side,
  side,
  type: 'source',
}));

const handlePositions = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right };

export function ClassDiagramCard(props: ClassDiagramCardProps)
{
  if (props.variant === 'class')
  {
    requireClassArtwork(props.artwork, props.label);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(props.dragType))
    {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    props.onDragHover(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>)
  {
    if (event.relatedTarget instanceof Element && event.currentTarget.contains(event.relatedTarget))
    {
      return;
    }
    props.onDragHover(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(props.dragType))
    {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    props.onDragHover(false);
    const memberId = event.dataTransfer.getData(props.dragType);
    if (memberId)
    {
      props.onAssign(memberId);
    }
    props.onEndMemberDrag?.();
  }

  const className = [
    'pattern-class',
    props.variant === 'interface' && 'is-interface',
    props.isDropTarget && 'is-drop-target',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {(props.handles ?? defaultHandles).map(handle => (
        <Handle key={handle.id ?? handle.side} id={handle.id} type={handle.type} position={handlePositions[handle.side]} />
      ))}
      <header className="pattern-class-title">
        <small>{props.kind}</small>
        <strong>{props.label}</strong>
        <button className="nodrag" aria-label={`Remove ${props.label} from diagram`} onClick={props.onRemove}>×</button>
      </header>
      {(['field', 'method'] as const).map(kind => (
        <MemberSection key={kind} sectionKind={kind} {...props} />
      ))}
      {props.artwork && (
        <div className="scenario-class-artwork">
          <img src={props.artwork.src} alt={props.artwork.alt} draggable={false} />
        </div>
      )}
    </div>
  );
}

function MemberSection({ sectionKind, ...props }: ClassDiagramCardProps & { sectionKind: 'field' | 'method' })
{
  const members = props.members.filter(member => member.kind === sectionKind);
  const heading = sectionKind === 'field' ? 'Fields' : 'Methods';
  return (
    <div className="pattern-class-members">
      <small className="pattern-member-heading">{heading}</small>
      {members.length === 0 && <p>Assign {sectionKind}s from your cards</p>}
      {members.map(member => (
        <div
          key={member.id}
          className={`pattern-assigned-method nodrag nopan${props.draggedMemberId === member.id ? ' is-dragging' : ''}${props.invalidMemberIds?.has(member.id) ? ' is-invalid' : ''}`}
          title={props.invalidMemberIds?.has(member.id) ? 'Assigned to the wrong class' : undefined}
          draggable={Boolean(props.onStartMemberDrag)}
          onDragStart={event => props.onStartMemberDrag?.(event, member.id)}
          onDragEnd={props.onEndMemberDrag}
        >
          <span>{sectionKind === 'field' ? '−' : '+'}</span>
          <code>{member.label}</code>
        </div>
      ))}
    </div>
  );
}
