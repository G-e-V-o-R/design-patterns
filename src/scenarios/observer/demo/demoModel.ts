import { localize, type Language } from '../../shared/language';
import { config } from '../config/config';
import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';

export type ObserverId = 'narion' | 'dre-kaar';
export type Subscriptions = Record<ObserverId, boolean>;

export type DiscoveryOptions = {
  danger: boolean;
  subscriptions: Subscriptions;
};

export type DiscoveryResult = {
  danger: boolean;
  recipients: ObserverId[];
  responses: Record<ObserverId, string>;
  summary: string;
  trace: string[];
};

const observers = [
  { id: 'narion', name: 'Narion', nameRu: 'Нарион', variable: 'narion' },
  { id: 'dre-kaar', name: 'Dre’Kaar', nameRu: 'Дре’Каар', variable: 'dreKaar' },
] as const;

export function describeDiscovery({ danger, subscriptions }: DiscoveryOptions, language: Language = 'en'): DiscoveryResult
{
  const trace = observers.map(({ id, variable }) =>
  {
    const method = subscriptions[id] ? 'attach' : 'detach';
    return localize(language, `Call fox.${method}(${variable}).`, `Вызов fox.${method}(${variable}).`);
  });

  if (!danger)
  {
    return {
      danger,
      recipients: [],
      responses: {
        narion: localize(language, 'No message. The path is safe.', 'Нет сообщения. Путь безопасен.'),
        'dre-kaar': localize(language, 'No message. The path is safe.', 'Нет сообщения. Путь безопасен.'),
      },
      summary: localize(language, 'The path is safe. The fox sends no messages and keeps looking.', 'Путь безопасен. Лиса продолжает разведку и не отправляет сообщений.'),
      trace: [
        ...trace,
        localize(language, 'The fox checks the path and finds no danger.', 'Лиса проверяет путь и не находит опасности.'),
        localize(language, 'The fox does not call notify(). No Observer gets a notification.', 'Лиса не вызывает notify(). Ни один наблюдатель не получает уведомления.'),
      ],
    };
  }

  const attached = observers.filter(({ id }) => subscriptions[id]);
  const [firstObserver, secondObserver] = attached;
  const recipients = attached.map(({ id }) => id);
  let summary = localize(language, 'Danger ahead! Narion and Dre’Kaar get the same message.', 'Впереди опасность! Нарион и Дре’Каар получают одно и то же сообщение.');
  trace.push(localize(language, 'The fox sees danger. discoverDanger() saves “Danger ahead” and calls notify().', 'Лиса замечает опасность. Метод discoverDanger() сохраняет предупреждение «Впереди опасность!» и вызывает notify().'));

  if (!firstObserver)
  {
    summary = localize(language, 'Danger ahead! Both bracelets are off, so no one gets the warning.', 'Впереди опасность! Оба браслета выключены, поэтому никто не получает предупреждения.');
    trace.push(localize(language, 'notify() finds an empty observers field. No update(discovery) calls are made.', 'Метод notify() видит, что поле observers пусто, и не вызывает update(discovery).'));
  }
  else
  {
    trace.push(localize(language, 'notify() reads the observers field and calls update(discovery) on each attached Observer.', 'Метод notify() читает поле observers и вызывает update(discovery) у каждого подписанного наблюдателя.'));
    if (!secondObserver)
    {
      summary = localize(
        language,
        `Danger ahead! Only ${firstObserver.name} gets the warning.`,
        `Впереди опасность! Предупреждение получает только ${firstObserver.nameRu}.`,
      );
    }
  }

  if (subscriptions.narion)
  {
    trace.push(localize(language, 'NarionObserver.update(discovery) calls planRoute(): Narion chooses a safer route.', 'Метод NarionObserver.update(discovery) вызывает planRoute(): Нарион выбирает более безопасный маршрут.'));
  }

  if (subscriptions['dre-kaar'])
  {
    trace.push(localize(language, 'DreKaarObserver.update(discovery) calls prepareDefense(): Dre’Kaar gets ready to protect the group.', 'Метод DreKaarObserver.update(discovery) вызывает prepareDefense(): Дре’Каар готовится защищать отряд.'));
  }

  return {
    danger,
    recipients,
    responses: {
      narion: subscriptions.narion
        ? localize(language, 'Message received. Narion plans a safer path.', 'Сообщение получено. Нарион прокладывает более безопасный маршрут.')
        : localize(language, 'No message. Narion’s bracelet is off.', 'Нет сообщения. Браслет Нариона выключен.'),
      'dre-kaar': subscriptions['dre-kaar']
        ? localize(language, 'Message received. Dre’Kaar gets ready to protect the group.', 'Сообщение получено. Дре’Каар готовится защищать отряд.')
        : localize(language, 'No message. Dre’Kaar’s bracelet is off.', 'Нет сообщения. Браслет Дре’Каара выключен.'),
    },
    summary,
    trace,
  };
}


export function simulateDiscovery(graph: LessonGraph, options: DiscoveryOptions): DiscoveryResult | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }
  return describeDiscovery(options);
}
