import { localize, useLanguage } from '../../shared/language';
import { useEffect, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { changeOrders, createSimulation, executionHistory, orderDetails, undoForOrder } from './demoModel';
import type { DemoAction, OrderId } from './demoModel';
import { FlightScene, orderIds } from './FlightScene';
import { childBeetleArt } from './childBeetleArt';
import './styles.css';

const commandLabels: Record<OrderId, { en: string; ru: string }> = {
  wake: { en: 'Wake everyone', ru: 'Разбудить всех' },
  traps: { en: 'Set traps', ru: 'Расставить ловушки' },
  flank: { en: 'Move to right flank', ru: 'Перейти на правый фланг' },
};

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const language = useLanguage();
  const [session, setSession] = useState(() => ({
    graph, orders: createSimulation(graph), gathered: 0, registrationStarted: false, runId: 0,
  }));
  const enabled = ready && active;

  useEffect(() =>
  {
    if (!enabled || !session.orders)
    {
      return;
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function settleWithoutMotion()
    {
      if (motion.matches)
      {
        setSession(current =>
        {
          if (!current.orders || current.graph !== graph || current.runId !== session.runId)
          {
            return current;
          }
          if (current.registrationStarted && current.gathered < orderIds.length)
          {
            return { ...current, gathered: orderIds.length, orders: changeOrders(current.orders, { type: 'register' }) };
          }
          const arriving = current.orders.filter(order => order.status === 'launching' || order.status === 'in-flight' || order.status === 'handoff');
          if (arriving.length === 0)
          {
            return current;
          }
          const orders = arriving.reduce((orders, { id }) =>
          {
            const launched = changeOrders(orders, { type: 'launch', id });
            const delivered = changeOrders(launched, { type: 'deliver', id });
            return changeOrders(delivered, { type: 'execute', id });
          }, current.orders);
          return { ...current, orders };
        });
      }
    }

    settleWithoutMotion();
    motion.addEventListener('change', settleWithoutMotion);
    return () => motion.removeEventListener('change', settleWithoutMotion);
  }, [enabled, graph, session]);

  if (session.graph !== graph)
  {
    setSession({ graph, orders: createSimulation(graph), gathered: 0, registrationStarted: false, runId: session.runId + 1 });
  }

  const { orders, gathered, registrationStarted, runId } = session;
  if (!orders)
  {
    return null;
  }

  const gathering = registrationStarted && gathered < orderIds.length;
  const history = executionHistory(orders);
  const canUndo = Boolean(undoForOrder(orders, 'flank'));

  function run(action: DemoAction)
  {
    if (enabled)
    {
      setSession(current =>
      {
        if (!current.orders || current.graph !== graph || current.runId !== runId)
        {
          return current;
        }
        return { ...current, orders: changeOrders(current.orders, action) };
      });
    }
  }

  function finishGatheringFlight()
  {
    if (enabled)
    {
      setSession(current =>
      {
        if (!current.orders || current.graph !== graph || current.runId !== runId || current.gathered !== gathered || !current.registrationStarted || !gathering)
        {
          return current;
        }
        const arrived = current.gathered + 1;
        return {
          ...current,
          gathered: arrived,
          orders: arrived === orderIds.length ? changeOrders(current.orders, { type: 'register' }) : current.orders,
        };
      });
    }
  }

  return (
    <section className="command-demo" aria-labelledby="command-demo-title">
      <header className="command-demo-header">
        <h2 id="command-demo-title">{localize(language, 'Send the beetles', 'Отправьте жуков-посыльных')}</h2>
        <p>{localize(language, 'Register the child beetles, then choose an order. The Commander sends a copy and keeps the registered beetle.', 'Зарегистрируйте жуков-посыльных, затем выберите приказ. Командир отправит копию жука, а зарегистрированный жук останется у него.')}</p>
      </header>
      <FlightScene key={runId} orders={orders} active={enabled} gathered={gathered} gathering={gathering}
        onGather={finishGatheringFlight} onLaunch={id => run({ type: 'launch', id })}
        onDeliver={id => run({ type: 'deliver', id })}
        onExecute={id => run({ type: 'execute', id })} />
      <div className="command-controls" role="group" aria-label={localize(language, 'Order controls', 'Управление приказами')}>
        {!registrationStarted && (
          <button type="button" disabled={!enabled} onClick={() =>
          {
            setSession(current => ({ ...current, registrationStarted: true }));
          }}>
            {localize(language, 'Register', 'Зарегистрировать')}
          </button>
        )}
        {gathering && (
          <p role="status">{localize(language, `${gathered} of ${orderIds.length} child beetles registered.`, `Зарегистрировано жуков: ${gathered} из ${orderIds.length}.`)}</p>
        )}
        {orders.map(order => (
          <button key={order.id} className="command-launch" type="button" disabled={!enabled || order.status !== 'pending'}
            onClick={() => run({ type: 'dispatch', id: order.id })}>
            <img src={childBeetleArt[order.id]} alt="" draggable={false} />
            {commandLabels[order.id][language]}
          </button>
        ))}
        <button type="button" disabled={!enabled || !canUndo} onClick={() => run({ type: 'undo', id: 'flank' })}>
          {localize(language, 'Undo Narion’s order', 'Отменить приказ Нариону')}
        </button>
        <button className="command-reset" type="button" disabled={!enabled} onClick={() =>
        {
          setSession({ graph, orders: [], gathered: 0, registrationStarted: false, runId: runId + 1 });
        }}>
          {localize(language, 'Start over', 'Начать заново')}
        </button>
      </div>
      <p className="command-status">{localize(language, 'Execute Narion’s order to reveal the feint. Undo Narion’s order to return him to the left flank.', 'Выполните приказ Нариону, чтобы раскрыть обманный манёвр. Отмените приказ, чтобы вернуть его на левый фланг.')}</p>
      <section className="command-history" aria-labelledby="command-history-title" aria-live="polite">
        <h3 id="command-history-title">{localize(language, 'Execution history', 'История выполнения')}</h3>
        {history.length === 0 && <p>{localize(language, 'No orders executed yet.', 'Пока ни один приказ не выполнен.')}</p>}
        {history.length > 0 && (
          <ol>
            {history.map(order => (
              <li key={order.id}>
                <code>{orderDetails[order.id].name}</code>
                <span>{order.status === 'undone' ? localize(language, 'undo() · Undone', 'undo() · Отменён') : localize(language, 'execute() · Executed', 'execute() · Выполнен')}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
