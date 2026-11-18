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
  { id: 'narion', name: 'Narion', variable: 'narion' },
  { id: 'dre-kaar', name: 'Dre’Kaar', variable: 'dreKaar' },
] as const;

function discoverPath({ danger, subscriptions }: DiscoveryOptions): DiscoveryResult
{
  const trace = observers.map(({ id, variable }) =>
    `Call fox.${subscriptions[id] ? 'attach' : 'detach'}(${variable}).`,
  );

  if (!danger)
  {
    return {
      danger,
      recipients: [],
      responses: {
        narion: 'No message. The path is safe.',
        'dre-kaar': 'No message. The path is safe.',
      },
      summary: 'The path is safe. The fox sends no messages and keeps looking.',
      trace: [
        ...trace,
        'The fox checks the path and finds no danger.',
        'The fox does not call notify(). No Observer gets a notification.',
      ],
    };
  }

  const attached = observers.filter(({ id }) => subscriptions[id]);
  const [firstObserver, secondObserver] = attached;
  const recipients = attached.map(({ id }) => id);
  let summary = 'Danger ahead! Narion and Dre’Kaar get the same message.';
  trace.push('The fox sees danger. discoverDanger() saves “Danger ahead” and calls notify().');

  if (!firstObserver)
  {
    summary = 'Danger ahead! Both bracelets are off, so no one gets the warning.';
    trace.push('notify() finds an empty observers field. No update(discovery) calls are made.');
  }
  else
  {
    trace.push('notify() reads the observers field and calls update(discovery) on each attached Observer.');
    if (!secondObserver)
    {
      summary = `Danger ahead! Only ${firstObserver.name} gets the warning.`;
    }
  }

  if (subscriptions.narion)
  {
    trace.push('NarionObserver.update(discovery) calls planRoute(): Narion chooses a safer route.');
  }

  if (subscriptions['dre-kaar'])
  {
    trace.push('DreKaarObserver.update(discovery) calls prepareDefense(): Dre’Kaar gets ready to protect the group.');
  }

  return {
    danger,
    recipients,
    responses: {
      narion: subscriptions.narion
        ? 'Message received. Narion plans a safer path.'
        : 'No message. Narion’s bracelet is off.',
      'dre-kaar': subscriptions['dre-kaar']
        ? 'Message received. Dre’Kaar gets ready to protect the group.'
        : 'No message. Dre’Kaar’s bracelet is off.',
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
  return discoverPath(options);
}
