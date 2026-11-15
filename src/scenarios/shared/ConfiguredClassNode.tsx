import type { Node, NodeProps } from '@xyflow/react';
import { ClassDiagramCard, type ClassDiagramCardProps } from './ClassDiagramNode';

export type ConfiguredClassNode = Node<ClassDiagramCardProps & Record<string, unknown>, 'configuredClass'>;

export function ConfiguredClassCard({ data }: NodeProps<ConfiguredClassNode>)
{
  return <ClassDiagramCard {...data} />;
}

export const configuredNodeTypes = { configuredClass: ConfiguredClassCard };
