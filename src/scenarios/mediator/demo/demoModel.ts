import { config as demoConfig } from '../config/config';
import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';

export { demoConfig };

export function classLabel(id: string)
{
  return demoConfig.classes.find(card => card.id === id)?.label ?? id;
}

export type RequestKind = 'cover' | 'shelter';

export type CoordinationResult = {
  request: RequestKind;
  sender: string;
  recipient: string;
  summary: string;
  trace: string[];
};

export function simulateLesson(
  graph: LessonGraph,
  request: RequestKind,
): CoordinationResult | null
{
  if (getConfiguredLessonIssues(demoConfig, graph).length)
  {
    return null;
  }

  const isCoverRequest = request === 'cover';
  const sender = isCoverRequest ? 'dre-kaar' : 'faelina';
  const recipient = isCoverRequest ? 'narion' : 'saerenn';

  return {
    request,
    sender,
    recipient,
    summary: isCoverRequest
      ? 'Only Narion receives the cover request and provides covering fire.'
      : 'Only Saerenn receives the shelter request and guides the group to safety.',
    trace: [
      `${classLabel(sender)}.${isCoverRequest ? 'requestCover' : 'requestShelter'}() calls mediator.notify(this, "${request}").`,
      `RavenMediator.notify(sender, "${request}") selects ${classLabel(recipient)} using its coordination rule.`,
      `RavenMediator calls ${classLabel(recipient)}.${isCoverRequest ? 'provideCover' : 'provideShelter'}().`,
      `${classLabel(recipient)} performs its own business logic. The other participants receive no request.`,
    ],
  };
}

