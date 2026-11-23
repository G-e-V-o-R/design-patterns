import { localize, useLanguage, type Language } from '../../shared/language';
import { useEffect, useState } from 'react';
import foxPortrait from '../resource/fox-card.png?url';
import narionPortrait from '../../shared/resource/portraits/narion.png?url';
import dreKaarPortrait from '../../shared/resource/portraits/dre-kaar.png?url';
import { describeDiscovery, type DiscoveryResult, type ObserverId, type Subscriptions } from './demoModel';

const subscribers = [
  { id: 'narion', name: 'Narion', nameRu: 'Нарион', braceletRu: 'Браслет Нариона', portrait: narionPortrait },
  { id: 'dre-kaar', name: 'Dre’Kaar', nameRu: 'Дре’Каар', braceletRu: 'Браслет Дре’Каара', portrait: dreKaarPortrait },
] as const;

type Subscriber = typeof subscribers[number];
type Phase = 'idle' | 'checking' | 'sending' | 'finished';
type DeliveryState = 'waiting' | 'disconnected' | 'sending' | 'received';

export type DemoRun = {
  result: DiscoveryResult;
};

type ObserverDemoProps = {
  ready: boolean;
  active: boolean;
  subscriptions: Subscriptions;
  onToggleBracelet: (observer: ObserverId) => void;
  onRun: (danger: boolean) => void;
  run: DemoRun | null;
};

function getStatus(phase: Phase, result: DiscoveryResult | undefined, language: Language)
{
  switch (phase)
  {
    case 'checking':
      return localize(language, 'The fox checks the path.', 'Лиса проверяет путь.');
    case 'sending':
      return localize(language, 'Danger ahead! The fox sends the same warning to each subscribed observer.', 'Впереди опасность! Лиса отправляет одно и то же предупреждение всем подписанным наблюдателям.');
    case 'finished':
      return result?.summary;
    default:
      return localize(language, 'Choose what the fox finds. Try switching either bracelet on or off between runs.', 'Выберите, что найдёт лиса. Между запусками попробуйте включить или выключить любой браслет.');
  }
}

function getDeliveryState(subscribed: boolean, receivesMessage: boolean, phase: Phase): DeliveryState
{
  if (!subscribed)
  {
    return 'disconnected';
  }

  if (receivesMessage && phase === 'sending')
  {
    return 'sending';
  }

  if (receivesMessage && phase === 'finished')
  {
    return 'received';
  }

  return 'waiting';
}

function PathControls({ disabled, playing, selection, onRun }: {
  disabled: boolean;
  playing: boolean;
  selection: boolean | undefined;
  onRun: (danger: boolean) => void;
})
{
  const language = useLanguage();
  return (
    <div className="observer-paths" role="group" aria-label={localize(language, 'What does the fox find?', 'Что найдёт лиса?')}>
      <button
        type="button"
        data-path="danger"
        disabled={disabled}
        aria-disabled={playing}
        aria-pressed={selection === true}
        onClick={() => onRun(true)}
      >
        {localize(language, 'Find danger', 'Найти опасность')}
      </button>
      <button
        type="button"
        data-path="safe"
        disabled={disabled}
        aria-disabled={playing}
        aria-pressed={selection === false}
        onClick={() => onRun(false)}
      >
        {localize(language, 'Check a safe path', 'Проверить безопасный путь')}
      </button>
    </div>
  );
}

function FoxCard({ phase, danger }: { phase: Phase; danger: boolean | undefined })
{
  const language = useLanguage();
  let detail = localize(language, 'Ready to scout', 'Готова к разведке');
  if (phase === 'checking')
  {
    detail = localize(language, 'Checking the path…', 'Проверяет путь…');
  }
  else if (phase === 'sending' || (phase === 'finished' && danger))
  {
    detail = localize(language, 'Danger ahead!', 'Впереди опасность!');
  }
  else if (phase === 'finished')
  {
    detail = localize(language, 'The path is safe', 'Путь безопасен');
  }

  return (
    <article className="observer-fox" data-phase={phase} data-danger={danger}>
      <img src={foxPortrait} alt="" draggable={false} />
      <div>
        <h3>{localize(language, 'Fox', 'Лиса')} <span>{localize(language, 'Subject', 'Издатель')}</span></h3>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function SubscriberCard({ subscriber, subscribed, delivery, response, disabled, playing, onToggleBracelet }: {
  subscriber: Subscriber;
  subscribed: boolean;
  delivery: DeliveryState;
  response: string;
  disabled: boolean;
  playing: boolean;
  onToggleBracelet: () => void;
})
{
  const language = useLanguage();
  return (
    <article className="observer-person" data-delivery={delivery}>
      <div className="observer-portrait">
        <img src={subscriber.portrait} alt="" draggable={false} />
        <h3>{localize(language, subscriber.name, subscriber.nameRu)}</h3>
      </div>
      <div className="observer-person-detail">
        <p className="observer-subscription">
          {subscribed ? localize(language, 'Subscribed', 'Подписка активна') : localize(language, 'Unsubscribed', 'Подписка отключена')}
        </p>
        <p>{response}</p>
        <button
          type="button"
          className="observer-bracelet"
          disabled={disabled}
          aria-disabled={playing}
          aria-pressed={subscribed}
          onClick={onToggleBracelet}
        >
          {localize(language, `${subscriber.name}’s bracelet`, subscriber.braceletRu)} <span aria-hidden="true">{subscribed ? localize(language, 'On', 'Вкл.') : localize(language, 'Off', 'Выкл.')}</span>
        </button>
      </div>
    </article>
  );
}

function DiscoveryTrace({ result }: { result: DiscoveryResult })
{
  const language = useLanguage();
  return (
    <details className="observer-trace">
      <summary>{localize(language, 'See the method calls', 'Посмотреть вызовы методов')}</summary>
      <ol>
        {result.trace.map(step => <li key={step}>{step}</li>)}
      </ol>
    </details>
  );
}

export function ObserverDemo({
  ready,
  active,
  subscriptions,
  onToggleBracelet,
  onRun,
  run,
}: ObserverDemoProps)
{
  const language = useLanguage();
  const [progress, setProgress] = useState<{ run: DemoRun; phase: Phase }>();
  let phase: Phase = 'idle';
  if (run)
  {
    phase = progress?.run === run ? progress.phase : 'checking';
  }

  useEffect(() =>
  {
    if (!run || phase === 'finished')
    {
      return;
    }

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function finish()
    {
      if (run)
      {
        setProgress({ run, phase: 'finished' });
      }
    }

    if (!active || preference.matches)
    {
      finish();
      return;
    }

    const nextPhase = phase === 'checking' && run.result.recipients.length > 0 ? 'sending' : 'finished';
    const delay = phase === 'checking' ? 540 : 900;
    const timer = window.setTimeout(() => setProgress({ run, phase: nextPhase }), delay);

    function updateMotion()
    {
      if (preference.matches)
      {
        window.clearTimeout(timer);
        finish();
      }
    }

    preference.addEventListener('change', updateMotion);
    return () =>
    {
      window.clearTimeout(timer);
      preference.removeEventListener('change', updateMotion);
    };
  }, [active, phase, run]);

  const result = run && language === 'ru'
    ? describeDiscovery({ danger: run.result.danger, subscriptions }, language)
    : run?.result;
  const disabled = !ready || !active;
  const playing = phase === 'checking' || phase === 'sending';

  function choosePath(danger: boolean)
  {
    if (!disabled && !playing)
    {
      onRun(danger);
    }
  }

  function toggleBracelet(observer: ObserverId)
  {
    if (!disabled && !playing)
    {
      onToggleBracelet(observer);
    }
  }

  return (
    <section className="observer-demo" aria-labelledby="observer-demo-heading">
      <h2 id="observer-demo-heading">{localize(language, 'Follow the fox’s warning', 'Проследите за предупреждением лисы')}</h2>
      <p>{localize(language, 'The fox warns everyone wearing a bracelet when it finds danger.', 'Заметив опасность, лиса предупреждает всех, кто носит браслет.')}</p>
      {!ready && <p>{localize(language, 'Finish your diagram to start.', 'Завершите диаграмму, чтобы начать.')}</p>}

      <PathControls disabled={disabled} playing={playing} selection={result?.danger} onRun={choosePath} />
      <div className="observer-scene">
        <FoxCard phase={phase} danger={result?.danger} />
        <div className="observer-deliveries">
          {subscribers.map(subscriber =>
          {
            const subscribed = subscriptions[subscriber.id];
            const receivesMessage = result?.recipients.includes(subscriber.id) ?? false;
            const delivery = getDeliveryState(subscribed, receivesMessage, phase);
            let response = subscribed ? localize(language, 'Waiting for a warning.', 'Ожидает предупреждения.') : localize(language, 'Bracelet is off.', 'Браслет выключен.');
            if (phase === 'finished' && result)
            {
              response = result.responses[subscriber.id];
            }
            else if (delivery === 'sending')
            {
              response = localize(language, 'Warning on the way…', 'Предупреждение в пути…');
            }

            return (
              <div key={subscriber.id} className="observer-delivery" data-subscriber={subscriber.id}>
                <div className="observer-branch" data-delivery={delivery} aria-hidden="true">
                  {delivery === 'sending' && <span className="observer-pulse" />}
                </div>
                <SubscriberCard
                  subscriber={subscriber}
                  subscribed={subscribed}
                  delivery={delivery}
                  response={response}
                  disabled={disabled}
                  playing={playing}
                  onToggleBracelet={() => toggleBracelet(subscriber.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="observer-outcome" role="status">{getStatus(phase, result, language)}</p>
      {phase === 'finished' && result && <DiscoveryTrace result={result} />}
    </section>
  );
}
