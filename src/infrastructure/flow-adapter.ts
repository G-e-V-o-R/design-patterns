import type { Node, Edge as FlowEdge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { Blueprint, Graph, Role } from '../domain/blueprints/types';
export type CardNode = Node<{ role: Role; technical: boolean; central: boolean; highlight: boolean }, 'card'>;
export const edgeId = (e:{source:string;target:string;type:string}) => `${e.source}:${e.type}:${e.target}`;
export function flowNodes(b:Blueprint, roles:readonly string[], technical:boolean, highlight?:string):CardNode[] {
 return b.roles.filter(r=>roles.includes(r.id)).map((role,i)=>({id:role.id,deletable:false,type:'card',position:i===0?{x:410,y:310}:{x:410+370*Math.cos((i-1)*Math.PI*2/7-Math.PI/2),y:310+300*Math.sin((i-1)*Math.PI*2/7-Math.PI/2)},data:{role,technical,central:i===0,highlight:role.id===highlight}}));
}
export function flowEdges(g:Graph, technical:boolean, animated:boolean):FlowEdge[] { return g.edges.map(e=>({id:edgeId(e),source:e.source,target:e.target,sourceHandle:e.type,targetHandle:e.type,label:technical?e.type:undefined,animated,markerEnd:{type:MarkerType.ArrowClosed},style:{stroke:'#b89554',strokeWidth:2}})); }
