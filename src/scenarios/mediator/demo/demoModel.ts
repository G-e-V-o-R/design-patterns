import { localize, type Language } from '../../shared/language';
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

  return describeCoordination(request, 'en');
}

export function describeCoordination(request: RequestKind, language: Language): CoordinationResult
{
  const isCoverRequest = request === 'cover';
  const sender = isCoverRequest ? 'dre-kaar' : 'faelina';
  const recipient = isCoverRequest ? 'narion' : 'saerenn';

  const requestMethod = isCoverRequest ? 'requestCover' : 'requestShelter';
  const responseMethod = isCoverRequest ? 'provideCover' : 'provideShelter';
  const senderClass = classLabel(sender);
  const recipientClass = classLabel(recipient);
  return {
    request,
    sender,
    recipient,
    summary: isCoverRequest
      ? localize(language, 'Only Narion receives the cover request and provides covering fire.', 'Просьбу о прикрытии получает только Нарион. Он прикрывает отряд огнём.')
      : localize(language, 'Only Saerenn receives the shelter request and guides the group to safety.', 'Просьбу об укрытии получает только Саэренн. Она ведёт отряд в безопасное место.'),
    trace: [
      localize(
        language,
        `${senderClass}.${requestMethod}() calls mediator.notify(this, "${request}").`,
        `Метод ${senderClass}.${requestMethod}() вызывает mediator.notify(this, "${request}").`,
      ),
      localize(
        language,
        `RavenMediator.notify(sender, "${request}") selects ${recipientClass} using its coordination rule.`,
        `Метод RavenMediator.notify(sender, "${request}") выбирает ${recipientClass} по правилу маршрутизации.`,
      ),
      localize(
        language,
        `RavenMediator calls ${recipientClass}.${responseMethod}().`,
        `Посредник RavenMediator вызывает ${recipientClass}.${responseMethod}().`,
      ),
      localize(
        language,
        `${recipientClass} performs its own business logic. The other participants receive no request.`,
        `${recipientClass} выполняет свою часть задачи. Остальные участники не получают запроса.`,
      ),
    ],
  };
}

