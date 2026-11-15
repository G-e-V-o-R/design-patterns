import scenario from './scenario.json';
import { compileScenarioConfig } from '../shared/scenarioConfig';
import { getConfiguredLessonIssues, type LessonGraph } from '../shared/configuredLessonModel';

const config = compileScenarioConfig(scenario, 'observer/scenario.json', path => path);

export type DiscoveryOptions = {
  danger: boolean;
  narionSubscribed: boolean;
};

export type DiscoveryResult = {
  danger: boolean;
  recipients: ('narion' | 'dre-kaar')[];
  responses: { narion: string; 'dre-kaar': string };
  summary: string;
  trace: string[];
};

function discoverPath({
  danger,
  narionSubscribed,
}: DiscoveryOptions): DiscoveryResult
{
  let subscriptionDescription: string;
  if (narionSubscribed)
  {
    subscriptionDescription = 'Call fox.attach(narion) and fox.attach(dreKaar). Both observers are in the observers field.';
  }
  else
  {
    subscriptionDescription = 'Call fox.detach(narion). Only Dre’Kaar remains in the observers field.';
  }

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
        subscriptionDescription,
        'The fox checks the path and finds no danger.',
        'The fox does not call notify(). No Observer gets a notification.',
      ],
    };
  }

  let recipients: ('narion' | 'dre-kaar')[];
  let narionResponse: string;
  let summary: string;
  const trace = [
    subscriptionDescription,
    'The fox sees danger. discoverDanger() saves “Danger ahead” and calls notify().',
    'notify() reads the observers field and calls update(discovery) on each attached Observer.',
  ];

  if (narionSubscribed)
  {
    recipients = ['narion', 'dre-kaar'];
    narionResponse = 'Message received. Narion plans a safer path.';
    summary = 'Danger ahead! Narion and Dre’Kaar get the same message.';
    trace.push(
      'NarionObserver.update(discovery) calls planRoute(): Narion chooses a safer route.',
    );
  }
  else
  {
    recipients = ['dre-kaar'];
    narionResponse = 'No message. Narion’s bracelet is off.';
    summary = 'Danger ahead! Only Dre’Kaar gets the message. Narion’s bracelet is off.';
  }

  trace.push(
    'DreKaarObserver.update(discovery) calls prepareDefense(): Dre’Kaar gets ready to protect the group.',
  );

  return {
    danger,
    recipients,
    responses: {
      narion: narionResponse,
      'dre-kaar': 'Message received. Dre’Kaar gets ready to protect the group.',
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
