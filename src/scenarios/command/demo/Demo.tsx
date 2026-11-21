import { useEffect, useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { changeOrders, createSimulation, executionHistory, lastExecution, orderDetails } from './demoModel';
import type { DemoAction, OrderId } from './demoModel';
import { FlightScene, orderIds } from './FlightScene';
import './styles.css';

const commandLabels: Record<OrderId, string> = {
  wake: 'Wake everyone',
  traps: 'Set traps',
  flank: 'Guard the flank',
};

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const [session, setSession] = useState(() => ({
    graph, orders: createSimulation(graph), gathered: 0, runId: 0,
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
          if (current.gathered < orderIds.length)
          {
            return { ...current, gathered: orderIds.length, orders: changeOrders(current.orders, { type: 'register' }) };
          }
          const inFlight = current.orders.filter(order => order.status === 'in-flight');
          if (inFlight.length === 0)
          {
            return current;
          }
          const orders = inFlight.reduce((orders, order) => changeOrders(orders, { type: 'deliver', id: order.id }), current.orders);
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
    setSession({ graph, orders: createSimulation(graph), gathered: 0, runId: session.runId + 1 });
  }

  const { orders, gathered, runId } = session;
  if (!orders)
  {
    return null;
  }

  const gathering = gathered < orderIds.length;
  const history = executionHistory(orders);
  const canUndo = Boolean(lastExecution(orders)?.execution?.undo);

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
        if (!current.orders || current.graph !== graph || current.runId !== runId || current.gathered !== gathered || !gathering)
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
        <h2 id="command-demo-title">Send the beetles</h2>
        <p>Watch the three child beetles gather, then choose an order. Its beetle flies to the receiver and the command runs on arrival.</p>
      </header>
      <FlightScene key={runId} orders={orders} active={enabled} gathered={gathered}
        onGather={finishGatheringFlight} onDeliver={id => run({ type: 'deliver', id })} />
      {gathering ? (
        <p className="command-status" role="status">{gathered} of {orderIds.length} child beetles at the Commander Beetle.</p>
      ) : (
        <div className="command-controls command-launches" role="group" aria-label="Run a command">
          {orders.map(order => (
            <button key={order.id} type="button" disabled={!enabled || order.status !== 'pending'}
              onClick={() => run({ type: 'dispatch', id: order.id })}>
              {commandLabels[order.id]}
            </button>
          ))}
        </div>
      )}
      <div className="command-controls" role="group" aria-label="Order controls">
        {orders.filter(order => order.status === 'in-flight').map(order => (
          <button key={order.id} className="command-recall" type="button" disabled={!enabled}
            onClick={() => run({ type: 'cancel', id: order.id })}>
            Recall {orderDetails[order.id].receiver}’s order
          </button>
        ))}
        <button type="button" disabled={!enabled || !canUndo} onClick={() => run({ type: 'undo-last' })}>
          Undo last execution
        </button>
        <button className="command-reset" type="button" disabled={!enabled} onClick={() =>
        {
          setSession({ graph, orders: [], gathered: 0, runId: runId + 1 });
        }}>
          Start over
        </button>
      </div>
      <section className="command-history" aria-labelledby="command-history-title" aria-live="polite">
        <h3 id="command-history-title">Execution history</h3>
        {history.length === 0 && <p>No orders executed yet.</p>}
        {history.length > 0 && (
          <ol>
            {history.map(order => (
              <li key={order.id}>
                <code>{orderDetails[order.id].name}</code>
                <span>{order.status === 'undone' ? 'undo() · Undone' : 'execute() · Executed'}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
