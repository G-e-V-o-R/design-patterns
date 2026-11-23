import { useEffect, useRef, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { localize, useLanguage } from '../../shared/language';
import narion from '../../shared/resource/portraits/narion.png';
import guard from '../resource/tish-karr-guard.png';
import elder from '../resource/tish-karr-inside-the-den.png';
import { antidoteRequest, antidoteRequestRu, getMessageDuration, oldLetter, simulateRequest, wizardLetter, type Phase } from './demoModel';
import './styles.css';

const minimumVerificationDuration = 2400;
const minimumHandoffDuration = 1550;

const actors = [
  { id: 'narion', name: 'Narion', nameRu: 'Нарион', role: 'Client', roleRu: 'Клиент', image: narion },
  { id: 'guard', name: 'Guard', nameRu: 'Страж', role: 'Proxy', roleRu: 'Заместитель', image: guard },
  { id: 'elder', name: 'Elder', nameRu: 'Старейшина', role: 'Real subject', roleRu: 'Реальный объект', image: elder },
] as const;

const returnLabelsRu: Readonly<Record<string, string>> = {
  'return refusal': 'вернуть отказ',
  'return reply': 'вернуть ответ',
};

function RequestScene({ phase, hasLetter }: { phase: Phase | 'idle'; hasLetter: boolean })
{
  const language = useLanguage();
  const checking = phase === 'verify-letter';
  const showCloseUp = checking || phase === 'verified';
  const showAntidote = phase === 'answer' || phase === 'relay';
  const showSignal = !showAntidote && phase !== 'helped';
  const closeUp = useRef<HTMLDivElement>(null);
  const portraits = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    if (phase === 'verify-letter')
    {
      closeUp.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    if (phase === 'answer')
    {
      portraits.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [phase]);

  return (
    <div className="proxy-scene" data-phase={phase} data-letter={hasLetter}>
      {showCloseUp ? (
        <div className="proxy-close-up" ref={closeUp}>
          <LetterComparison checking={checking} />
        </div>
      ) : (
        <div className="proxy-actors" ref={portraits}>
          {actors.map(actor => (
            <div key={actor.id} className="proxy-actor" data-actor={actor.id}>
              <img src={actor.image} alt="" draggable={false} />
              <div className="proxy-actor-label">
                <strong>{localize(language, actor.name, actor.nameRu)}</strong>
                <span>{localize(language, actor.role, actor.roleRu)}</span>
              </div>
            </div>
          ))}
          {showAntidote && (
            <div key={phase} className="proxy-antidote" aria-hidden="true">
              <span className="proxy-vial" />
              {localize(language, 'Antidote', 'Противоядие')}
            </div>
          )}
        </div>
      )}
      <div className="proxy-route" aria-hidden="true">
        <div className="proxy-track" />
        {actors.map(actor => <span key={actor.id} className="proxy-stop" data-actor={actor.id} />)}
        <span className="proxy-block" />
        {showSignal && <span key={phase} className="proxy-signal" />}
      </div>
    </div>
  );
}

function LetterComparison({ checking }: { checking: boolean })
{
  const language = useLanguage();
  const signatureLabel = checking
    ? localize(language, 'Signature', 'Подпись')
    : localize(language, 'Signature matches ✓', 'Подпись совпадает ✓');
  const sealLabel = checking
    ? localize(language, 'Wax seal', 'Сургучная печать')
    : localize(language, 'Wax seal matches ✓', 'Печать совпадает ✓');
  return (
    <div className="proxy-comparison" data-checking={checking}>
      <div className="proxy-proof-columns">
        <strong>{localize(language, 'Presented letter', 'Предъявленное письмо')}</strong>
        <strong>{localize(language, 'Orven’s old letter', 'Старое письмо Орвена')}</strong>
      </div>
      <div className="proxy-proof-row">
        <div className="proxy-proof-label">{signatureLabel}</div>
        <div className="proxy-proof-columns">
          <span className="proxy-proof-mark proxy-signature">{localize(language, wizardLetter.signature, 'Орвен')}</span>
          <span className="proxy-proof-mark proxy-signature">{localize(language, oldLetter.signature, 'Орвен')}</span>
        </div>
      </div>
      <div className="proxy-proof-row" data-proof="seal">
        <div className="proxy-proof-label">{sealLabel}</div>
        <div className="proxy-proof-columns">
          {[wizardLetter.seal, oldLetter.seal].map((seal, index) => (
            <span key={index} className="proxy-proof-mark">
              <span className="proxy-wax-seal" data-seal={seal} role="img" aria-label={localize(language, `${seal} wax seal`, 'Сургучная печать с рассечённой звездой')} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const language = useLanguage();
  const [run, setRun] = useState<{
    graph: ConfiguredDemoProps['graph'];
    hasLetter: boolean;
    letterUnlocked: boolean;
    route: NonNullable<ReturnType<typeof simulateRequest>>;
    index: number;
  } | null>(null);

  if (run && run.graph !== graph)
  {
    setRun(null);
  }

  const stage = run?.route[run.index];
  const phase = stage?.phase;
  const playing = Boolean(run && run.index < run.route.length - 1);
  const enabled = ready && active;
  const letterUnlocked = Boolean(run?.letterUnlocked || stage?.phase === 'denied');
  const message = stage
    ? localize(language, stage.message, stage.messageRu)
    : localize(language, 'The guard waits at the entrance.', 'Страж ждёт у входа.');
  const call = stage ? localize(language, stage.call, returnLabelsRu[stage.call] ?? stage.call) : 'Audience.requestHelp(request)';

  useEffect(() =>
  {
    if (!enabled || !run || !stage || !playing || run.graph !== graph)
    {
      return;
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function advance(skipMotion: boolean)
    {
      setRun(current =>
      {
        if (!current || current !== run)
        {
          return current;
        }
        return { ...current, index: skipMotion ? current.route.length - 1 : current.index + 1 };
      });
    }

    function finishWithoutMotion()
    {
      if (motion.matches)
      {
        advance(true);
      }
    }

    finishWithoutMotion();
    motion.addEventListener('change', finishWithoutMotion);
    const messageDuration = getMessageDuration(stage.message);
    let stageDuration = messageDuration;
    if (stage.phase === 'verify-letter')
    {
      stageDuration = Math.max(messageDuration, minimumVerificationDuration);
    }
    else if (stage.phase === 'answer' || stage.phase === 'relay')
    {
      stageDuration = Math.max(messageDuration, minimumHandoffDuration);
    }
    const timer = window.setTimeout(() => advance(motion.matches), stageDuration);
    return () =>
    {
      window.clearTimeout(timer);
      motion.removeEventListener('change', finishWithoutMotion);
    };
  }, [enabled, graph, playing, run, stage]);

  function startRequest(hasLetter: boolean)
  {
    if (!enabled || playing || (hasLetter && !letterUnlocked))
    {
      return;
    }

    const route = simulateRequest(graph, hasLetter ? wizardLetter : null);
    if (route)
    {
      const index = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? route.length - 1 : 0;
      setRun({ graph, hasLetter, letterUnlocked, route, index });
    }
  }

  return (
    <section className="proxy-demo" aria-labelledby="proxy-demo-title">
      <header className="proxy-introduction">
        <h2 id="proxy-demo-title">{localize(language, 'Ask the guard for the antidote', 'Попросите у стража противоядие')}</h2>
        <p>{localize(language, antidoteRequest, antidoteRequestRu)}</p>
      </header>
      <div className="proxy-controls" role="group" aria-label={localize(language, 'Request controls', 'Управление запросом')}>
        <button type="button" disabled={!enabled} aria-disabled={playing} onClick={() => startRequest(false)}>
          {localize(language, 'Ask without the letter', 'Попросить без письма')}
        </button>
        <button type="button" disabled={!enabled || !letterUnlocked} aria-disabled={playing} onClick={() => startRequest(true)}>
          {localize(language, 'Ask with the letter', 'Предъявить письмо')}
        </button>
        <button type="button" className="proxy-reset" aria-disabled={!run} disabled={!enabled} onClick={() => setRun(null)}>
          {localize(language, 'Reset', 'Сбросить')}
        </button>
      </div>
      <RequestScene phase={phase ?? 'idle'} hasLetter={run?.hasLetter ?? false} />
      <div className="proxy-feedback" data-result={phase}>
        <p role="status" aria-atomic="true">{message}</p>
        <code>{call}</code>
      </div>
      {playing && run?.hasLetter && (
        <figure className="proxy-letter">
          <figcaption>{localize(language, 'Orven’s letter', 'Письмо Орвена')}</figcaption>
          <blockquote>{localize(language, wizardLetter.message, wizardLetter.messageRu)}</blockquote>
          <p>{localize(language, wizardLetter.signature, 'Орвен')} <span aria-hidden="true">✦</span></p>
        </figure>
      )}
    </section>
  );
}
