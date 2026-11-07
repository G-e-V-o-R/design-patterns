import type { DragEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { connectionHandles, memberCards } from './model';
import { methodDragType } from './lessonContent';

export type ClassNode = Node<{ needsFix: boolean; issueMemberIds: string[]; draggedMethod: string | null; onStartMethodDrag: (event: DragEvent, id: string) => void; onEndMethodDrag: () => void; isDropTarget: boolean; onDropMethod: (id: string) => void; onDragHover: (hovered: boolean) => void; label: string; kind: string; members: typeof memberCards; artwork?: { src: string; alt: string }; onRemove: () => void }, 'lessonClass'>;
export function DiagramClass({ data }: NodeProps<ClassNode>) {
  return <div style={{overflow:'visible'}} className={'lesson-class ' + (data.kind.toLowerCase().includes('interface') ? 'is-interface ' : '') + (data.isDropTarget ? 'is-drop-target ' : '') + (data.needsFix ? 'needs-fix' : '')}
    onDragOver={event => {
      if (!event.dataTransfer.types.includes(methodDragType)) return;
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
      if (!event.dataTransfer.types.includes(methodDragType)) return;
      event.preventDefault();
      event.stopPropagation();
      data.onDragHover(false);
      data.onDropMethod(event.dataTransfer.getData(methodDragType));
      data.onEndMethodDrag();
    }}>
    {connectionHandles.map(side => <Handle key={side} id={side} type="source" position={{ top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }[side]} />)}
    <div className="lesson-class-title"><small>{data.kind}</small><strong>{data.label}</strong>{data.needsFix && <span className="lesson-fix-label">Fix this</span>}<button className="nodrag" aria-label={`Remove ${data.label} from diagram`} onClick={data.onRemove}>×</button></div>
    {(['field', 'method'] as const).map(kind => {
      const members = data.members.filter(member => member.kind === kind);
      if (kind === 'field' && !members.length) return null;
      return <div key={kind} className="lesson-class-members">
        <small className="lesson-member-heading">{kind === 'field' ? 'Fields' : 'Methods'}</small>
        {members.length ? members.map(member => <div key={member.id} className={'lesson-assigned-method nodrag nopan' + (data.draggedMethod === member.id ? ' is-dragging' : '') + (data.issueMemberIds.includes(member.id) ? ' needs-fix' : '')} draggable title="Drag to another class, or to an empty area to remove it from this class" onDragStart={event => data.onStartMethodDrag(event, member.id)} onDragEnd={data.onEndMethodDrag}><span>{kind === 'field' ? '−' : '+'}</span><code>{member.label}</code>{data.issueMemberIds.includes(member.id) && <small className="lesson-fix-label">Fix this</small>}</div>) : <p>Drop fields or methods here</p>}
      </div>;
    })}
    {data.artwork && <div className="lesson-class-artwork"><img src={data.artwork.src} alt={data.artwork.alt} draggable={false}/></div>}
  </div>;
}
export const nodeTypes = { lessonClass: DiagramClass };
