import { stateOrder, stateTransitions, type StateId, type Transition } from './demoModel';
import { localize, useLanguage, type Language } from '../../shared/language';

const stateNames = {
  calm: { en: 'Calm', ru: 'Спокойствие' },
  wary: { en: 'Wary', ru: 'Настороженность' },
  furious: { en: 'Furious', ru: 'Ярость' },
} satisfies Record<StateId, Record<Language, string>>;

export function getStateName(id: StateId, language: Language): string
{
  return stateNames[id][language];
}

function TransitionArrow({ rule, taken }: { rule: Transition; taken: boolean })
{
  const language = useLanguage();
  const { from, to, event } = rule;
  const origin = stateOrder.indexOf(from);
  const destination = stateOrder.indexOf(to);
  const stays = origin === destination;
  const eventLabel = event === 'approach'
    ? localize(language, 'Approach', 'Приближение')
    : localize(language, 'Reassure', 'Успокоение');
  const arrow = origin < destination ? '→' : '←';
  const description = localize(language,
    `${eventLabel}: ${stateNames[from].en} to ${stateNames[to].en}`,
    `${eventLabel}: «${stateNames[from].ru}» → «${stateNames[to].ru}»`);

  return (
    <div
      className="state-machine-edge"
      data-taken={taken}
      data-loop={stays}
      role="img"
      aria-label={taken ? localize(language, `${description}, last transition`, `${description}, последний переход`) : description}
      style={{
        gridColumn: stays ? 2 * origin + 1 : 2 * Math.max(origin, destination),
        gridRow: stays ? 3 : event === 'approach' ? 1 : 2,
      }}
    >
      <span aria-hidden="true">{eventLabel}</span>
      <span className="state-machine-arrow" aria-hidden="true">{stays ? '↻' : arrow}</span>
    </div>
  );
}

export function StateMachine({ current, transition }: { current: StateId; transition: Transition | null })
{
  const language = useLanguage();
  return (
    <section className="state-machine" aria-labelledby="state-machine-title">
      <h3 id="state-machine-title">{localize(language, 'Snake’s state machine', 'Автомат состояний змеи')}</h3>
      <div className="state-machine-grid">
        {stateOrder.map((id, index) => (
          <div
            key={id}
            className="state-machine-node"
            data-state={id}
            aria-current={current === id ? 'true' : undefined}
            style={{ gridColumn: 2 * index + 1 }}
          >
            <strong>{getStateName(id, language)}</strong>
            {id === current && <small>{localize(language, 'Current', 'Текущее')}</small>}
          </div>
        ))}
        {stateTransitions.map(rule => (
          <TransitionArrow
            key={`${rule.from}-${rule.event}`}
            rule={rule}
            taken={rule.from === transition?.from && rule.event === transition.event}
          />
        ))}
      </div>
    </section>
  );
}
