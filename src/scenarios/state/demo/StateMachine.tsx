import { stateOrder, stateTransitions, type StateId, type Transition } from './demoModel';

const stateNames: Record<StateId, string> = {
  calm: 'Calm',
  wary: 'Wary',
  furious: 'Furious',
};

function TransitionArrow({ rule, taken }: { rule: Transition; taken: boolean })
{
  const { from, to, event } = rule;
  const origin = stateOrder.indexOf(from);
  const destination = stateOrder.indexOf(to);
  const stays = origin === destination;
  const eventLabel = event === 'approach' ? 'Approach' : 'Reassure';
  const arrow = origin < destination ? '→' : '←';
  const description = `${eventLabel}: ${stateNames[from]} to ${stateNames[to]}`;

  return (
    <div
      className="state-machine-edge"
      data-taken={taken}
      data-loop={stays}
      role="img"
      aria-label={taken ? `${description}, last transition` : description}
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
  return (
    <section className="state-machine" aria-labelledby="state-machine-title">
      <h3 id="state-machine-title">Snake’s state machine</h3>
      <div className="state-machine-grid">
        {stateOrder.map((id, index) => (
          <div
            key={id}
            className="state-machine-node"
            data-state={id}
            aria-current={current === id ? 'true' : undefined}
            style={{ gridColumn: 2 * index + 1 }}
          >
            <strong>{stateNames[id]}</strong>
            {id === current && <small>Current</small>}
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
