import type { DragEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { memberCards } from './model';
import { chainDragType } from './lessonContent';

export type ClassNode = Node<{
  label: string;
  kind: string;
  members: typeof memberCards;
  isDropTarget: boolean;
  onRemove: () => void;
  onAssign: (member: string) => void;
  onDragHover: (hovered: boolean) => void;
}, 'chainClass'>;

export type ChainNode = ClassNode;

export function DiagramClass({ data }: NodeProps<ClassNode>)
{
  const className = [
    'chain-class',
    data.kind === 'interface' && 'chain-interface',
    data.isDropTarget && 'chain-drop-target',
  ].filter(Boolean).join(' ');

  function handleDragOver(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(chainDragType))
    {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    data.onDragHover(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>)
  {
    if (
      event.relatedTarget instanceof Element
      && event.currentTarget.contains(event.relatedTarget)
    )
    {
      return;
    }

    data.onDragHover(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(chainDragType))
    {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    data.onDragHover(false);

    const memberId = event.dataTransfer.getData(chainDragType);
    if (memberId)
    {
      data.onAssign(memberId);
    }
  }

  return (
    <div
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Handle type="target" position={Position.Top} />

      <header>
        <small>{data.kind}</small>
        <strong>{data.label}</strong>
        <button
          className="nodrag"
          aria-label={`Remove ${data.label}`}
          onClick={data.onRemove}
        >
          ×
        </button>
      </header>

      {data.members.length === 0
        ? <p className="chain-class-empty">Assign members from your cards</p>
        : (['field', 'method'] as const).map(kind =>
        {
          const members = data.members.filter(member => member.kind === kind);
          if (members.length === 0)
          {
            return null;
          }

          return (
            <div className="chain-class-members" key={kind}>
              <small>{kind === 'field' ? 'Fields' : 'Methods'}</small>
              {members.map(member => (
                <code key={member.id}>{member.label}</code>
              ))}
            </div>
          );
        })}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const nodeTypes = { chainClass: DiagramClass };
