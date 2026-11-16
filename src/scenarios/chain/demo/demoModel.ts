import { config as chainConfig } from '../config/config';
import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';

export { chainConfig };

export function classLabel(id: string)
{
  return chainConfig.classes.find(card => card.id === id)?.label ?? id;
}

export type RequestKind = 'blood' | 'step' | 'iron' | 'safe';

export const requests: { id: RequestKind; label: string }[] = [
  { id: 'blood', label: 'Orc blood trail' },
  { id: 'step', label: 'Goblin footsteps' },
  { id: 'iron', label: 'Mercenary iron' },
  { id: 'safe', label: 'Harmless traveller' },
];

export type ChainStep = {
  handler: string;
  action: 'forward' | 'pass' | 'handle' | 'unhandled';
  message: string;
};

export type ChainResult = {
  request: RequestKind;
  handler: string | null;
  summary: string;
  trace: ChainStep[];
};

export function simulateLesson(graph: LessonGraph, request: RequestKind): ChainResult | null
{
  if (getConfiguredLessonIssues(chainConfig, graph).length > 0)
  {
    return null;
  }

  const trace: ChainStep[] = [];
  let current: string | undefined = 'thread';
  while (current)
  {
    const next = graph.edges.find(edge => edge.source === current && edge.type === 'next')?.target;
    if (current === request)
    {
      trace.push({ handler: current, action: 'handle', message: `${classLabel(current)} recognizes the signal and handles it. The chain stops here.` });
      return { request, handler: current, summary: `${classLabel(current)} handles the request. Later spiders are not called.`, trace };
    }

    if (next)
    {
      let action: ChainStep['action'] = 'pass';
      let message = `${classLabel(current)} does not recognize the signal. Pass to ${classLabel(next)}.`;
      if (current === 'thread')
      {
        action = 'forward';
        message = `SilkThread forwards the request to ${classLabel(next)}.`;
      }
      trace.push({ handler: current, action, message });
    }
    else
    {
      trace.push({ handler: current, action: 'unhandled', message: `${classLabel(current)} does not recognize the signal. There is no next handler.` });
    }
    current = next;
  }
  return { request, handler: null, summary: 'No spider handles this request. The traveller passes safely.', trace };
}

