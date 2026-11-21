import commanderArt from '../resource/7.0.png?url';
import messengerArt from '../resource/7.1.png?url';
import faelinaArt from '../resource/faelina.webp?url';
import latveArt from '../resource/latve.webp?url';
import narionArt from '../resource/narion.webp?url';
import { orderDetails, type DemoState, type OrderId, type OrderStatus } from './demoModel';

const portraits = {
  wake: latveArt,
  traps: faelinaArt,
  flank: narionArt,
};

export const orderIds = ['wake', 'traps', 'flank'] as const;

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Queued',
  'in-flight': 'In flight',
  canceled: 'Canceled',
  executed: 'Executed',
  undone: 'Undone',
};

function CommandCard({ id, status, onDeliver }: { id: OrderId; status: OrderStatus; onDeliver: () => void })
{
  const { name, receiver } = orderDetails[id];

  return (
    <div className="command-card" onAnimationEnd={event =>
    {
      if (status === 'in-flight' && event.target === event.currentTarget && event.animationName === 'command-fly-out')
      {
        onDeliver();
      }
    }}>
      <span className="command-messenger-frame" aria-hidden="true">
        <img src={messengerArt} alt="" draggable={false} />
      </span>
      <div className="command-card-copy">
        <strong>{name}</strong>
        <span>{receiver} · <code>{status === 'undone' ? 'undo()' : 'execute()'}</code></span>
        <span className="command-order-status">{statusLabels[status]}</span>
      </div>
    </div>
  );
}

function FlightRoute({ id, order, onDeliver }: { id: OrderId; order: DemoState[number] | undefined; onDeliver: () => void })
{
  const { receiver, before } = orderDetails[id];
  const status = order?.status;

  return (
    <li className="command-route" data-order={id} data-order-status={status ?? 'unregistered'}>
      <div className="command-track">
        <span className="command-track-line" aria-hidden="true" />
        <span className="command-track-trail" aria-hidden="true" />
        {order && order.status !== 'pending' && <CommandCard id={id} status={order.status} onDeliver={onDeliver} />}
      </div>
      <div className="command-receiver">
        <img src={portraits[id]} alt="" draggable={false} />
        <div className="command-receiver-copy">
          <strong>{receiver}</strong>
          <div className="command-receiver-state" data-completed={status === 'executed'}>
            <span className="command-before" aria-hidden={status === 'executed'}>{status === 'undone' ? order?.outcome : before}</span>
            {status === 'executed' && <span className="command-outcome">{order?.outcome}</span>}
          </div>
          {status === 'canceled' && <span className="command-action">Order recalled</span>}
          {status === 'undone' && <span className="command-action">Previous post restored</span>}
        </div>
      </div>
    </li>
  );
}

type FlightSceneProps = {
  orders: DemoState;
  active: boolean;
  gathered: number;
  onGather: () => void;
  onDeliver: (id: OrderId) => void;
};

export function FlightScene({ orders, active, gathered, onGather, onDeliver }: FlightSceneProps)
{
  const queued = orders.filter(order => order.status === 'pending').length;
  const flying = orders.filter(order => order.status === 'in-flight').length;
  let commanderStatus = 'Gathering child beetles';

  if (flying > 0)
  {
    commanderStatus = flying === 1 ? '1 beetle in flight' : `${flying} beetles in flight`;
  }
  else if (queued > 0)
  {
    commanderStatus = queued === 1 ? '1 order saved' : `${queued} orders saved`;
  }
  else if (orders.length > 0)
  {
    commanderStatus = 'All orders resolved';
  }

  return (
    <div className="command-scene" data-active={active}>
      <figure className="command-source">
        <img className="command-source-art" src={commanderArt} alt="" draggable={false} />
        <div className="command-dock" aria-hidden="true">
          {orderIds.map((id, index) =>
          {
            const order = orders.find(entry => entry.id === id);
            const phase = index === gathered ? 'approaching' : 'docked';
            return (
              <div key={id} className="command-dock-slot">
                {index <= gathered && (!order || order.status === 'pending') && (
                  <img className="command-child" data-phase={phase} src={messengerArt} alt="" draggable={false}
                    onAnimationEnd={event =>
                    {
                      if (phase === 'approaching' && event.animationName === 'command-fly-in')
                      {
                        onGather();
                      }
                    }} />
                )}
              </div>
            );
          })}
        </div>
        <figcaption>
          <strong>Commander Beetle</strong>
          <span>Invoker · <code>Command[]</code></span>
          <span>{commanderStatus}</span>
        </figcaption>
      </figure>
      <ul className="command-routes" aria-label="Order routes">
        {orderIds.map(id => <FlightRoute key={id} id={id} order={orders.find(order => order.id === id)} onDeliver={() => onDeliver(id)} />)}
      </ul>
    </div>
  );
}
