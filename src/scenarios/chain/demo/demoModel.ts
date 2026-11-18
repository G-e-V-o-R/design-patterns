import { config as chainConfig } from '../config/config';
import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';

export { chainConfig };

export function classLabel(id: string)
{
  return chainConfig.classes.find(card => card.id === id)?.label ?? id;
}

export type RequestKind = 'blood' | 'step' | 'iron' | 'safe';

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

  const firstHandler = 'blood';
  const trace: ChainStep[] = [{
    handler: 'thread',
    action: 'forward',
    message: `SilkThread forwards the request to ${classLabel(firstHandler)}.`,
  }];
  let current: string | undefined = firstHandler;
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
      trace.push({ handler: current, action: 'pass', message: `${classLabel(current)} does not recognize the signal. Pass to ${classLabel(next)}.` });
    }
    else
    {
      trace.push({ handler: current, action: 'unhandled', message: `${classLabel(current)} does not recognize the signal. There is no next handler.` });
    }
    current = next;
  }
  return { request, handler: null, summary: 'No spider handles this request. The traveller passes safely.', trace };
}

