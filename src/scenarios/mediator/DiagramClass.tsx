import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { memberCards } from './model';
import { mediatorDragType } from './lessonContent';

export type ClassNode = Node<{
  label: string;
  kind: string;
  members: typeof memberCards;
  needsFix: boolean;
  issueMembers: Set<string>;
  isDropTarget: boolean;
  artwork?: { src: string; alt: string };
  onRemove: () => void;
  onAssign: (member: string) => void;
  onDragHover: (hovered: boolean) => void;
}, 'mediatorClass'>;

export function DiagramClass({ data }: NodeProps<ClassNode>) {
  return <div className={'med-class' + (data.kind === 'interface' ? ' med-interface' : '') + (data.needsFix ? ' med-needs-fix' : '') + (data.isDropTarget ? ' med-drop-target' : '')}
    onDragOver={event => {
      if (!event.dataTransfer.types.includes(mediatorDragType)) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      data.onDragHover(true);
    }}
    onDragLeave={event => {
      if (event.relatedTarget instanceof Element && event.currentTarget.contains(event.relatedTarget)) return;
      data.onDragHover(false);
    }}
    onDrop={event => {
      if (!event.dataTransfer.types.includes(mediatorDragType)) return;
      event.preventDefault();
      event.stopPropagation();
      data.onDragHover(false);
      const id = event.dataTransfer.getData(mediatorDragType);
      if (id) data.onAssign(id);
    }}>
    <Handle type="target" position={Position.Top}/>
    <header><small>{data.kind}</small><strong>{data.label}</strong><button className="nodrag" aria-label={`Remove ${data.label}`} onClick={data.onRemove}>×</button>{data.needsFix && <span className="med-fix">Fix this</span>}</header>
    {(['field', 'method'] as const).map(kind => <div className="med-class-members" key={kind}><small>{kind === 'field' ? 'Fields' : 'Methods'}</small>{data.members.filter(member => member.kind === kind).map(member => <code key={member.id} className={data.issueMembers.has(member.id) ? 'med-fix' : ''}>{member.label}</code>)}{!data.members.some(member => member.kind === kind) && <p>Assign {kind}s from your cards</p>}</div>)}
    {data.artwork && <div className="med-class-artwork scenario-class-artwork"><img src={data.artwork.src} alt={data.artwork.alt} draggable={false}/></div>}
    <Handle type="source" position={Position.Bottom}/>
  </div>;
}

export const nodeTypes = { mediatorClass: DiagramClass };
