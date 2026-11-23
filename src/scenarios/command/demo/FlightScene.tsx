import { localize, useLanguage, type Language } from '../../shared/language';
import commanderArt from '../resource/7.0.png?url';
import { childBeetleArt } from './childBeetleArt';
import { ReceiverEffect } from './ReceiverEffect';
import { orderDetails, describeReceiverOutcome, type DemoState, type OrderId, type OrderStatus } from './demoModel';

export const orderIds = ['wake', 'traps', 'flank'] as const;

const statusLabels: Record<OrderStatus, { en: string; ru: string }> = {
  pending: { en: 'Queued', ru: 'В очереди' },
  launching: { en: 'Launching', ru: 'Взлетает' },
  'in-flight': { en: 'In flight', ru: 'В полёте' },
  handoff: { en: 'Order received', ru: 'Приказ получен' },
  executed: { en: 'Executed', ru: 'Выполнен' },
  undone: { en: 'Undone', ru: 'Отменён' },
};

const receiverNames = { wake: 'Латве', traps: 'Фаэлина', flank: 'Нарион' } satisfies Record<OrderId, string>;
const handoffNames = { wake: 'Латве', traps: 'Фаэлине', flank: 'Нариону' } satisfies Record<OrderId, string>;

function handoffLabel(id: OrderId, language: Language)
{
  return localize(language, `Child beetle → ${orderDetails[id].receiver}`, `Жук-посыльный → ${handoffNames[id]}`);
}

type RouteCallbacks = {
  onLaunch: () => void;
  onDeliver: () => void;
  onExecute: () => void;
};

function CommandCard({ id, status, onLaunch, onDeliver, onExecute }: RouteCallbacks & { id: OrderId; status: OrderStatus })
{
  const language = useLanguage();
  const { name, method } = orderDetails[id];
  const launching = status === 'launching';
  const handingOff = status === 'handoff';

  return (
    <div className="command-card" onAnimationEnd={event =>
    {
      if (event.target !== event.currentTarget)
      {
        return;
      }
      if (launching && event.animationName === 'command-launch-cue')
      {
        onLaunch();
      }
      else if (status === 'in-flight' && event.animationName === 'command-fly-out')
      {
        onDeliver();
      }
      else if (handingOff && event.animationName === 'command-handoff')
      {
        onExecute();
      }
    }}>
      {(launching || status === 'in-flight' || handingOff) && (
        <span className="command-messenger-frame" aria-hidden="true">
          <img src={childBeetleArt[id]} alt="" draggable={false} />
        </span>
      )}
      <div className="command-card-copy">
        {launching && (
          <div className="command-dialogue" role="status">
            <span>{localize(language, 'Mother Beetle → child', 'Жук-мать → жук-посыльный')}</span>
            <code>execute()</code>
          </div>
        )}
        {handingOff && (
          <div className="command-dialogue" role="status">
            <span>{handoffLabel(id, language)}</span>
            <code>{method}</code>
          </div>
        )}
        {!launching && !handingOff && (
          <>
            <span>{localize(language, 'Command', 'Команда')}</span>
            <strong>{name}</strong>
            <span className="command-order-status">{statusLabels[status][language]}</span>
          </>
        )}
      </div>
    </div>
  );
}

function FlightRoute({ id, order, onLaunch, onDeliver, onExecute }: RouteCallbacks & { id: OrderId; order: DemoState[number] | undefined })
{
  const language = useLanguage();
  const { receiver } = orderDetails[id];
  const status = order?.status;

  return (
    <li className="command-route" data-order={id} data-order-status={status ?? 'unregistered'}>
      <div className="command-track">
        <span className="command-track-line" aria-hidden="true" />
        <span className="command-track-trail" aria-hidden="true" />
        {status && status !== 'pending' && (
          <CommandCard id={id} status={status} onLaunch={onLaunch} onDeliver={onDeliver} onExecute={onExecute} />
        )}
      </div>
      <div className="command-receiver">
        <ReceiverEffect id={id} status={status} />
        <div className="command-receiver-copy">
          <span className="command-action">{localize(language, 'Receiver', 'Получатель')}</span>
          <strong>{localize(language, receiver, receiverNames[id])}</strong>
          <div className="command-receiver-state" aria-live="polite">
            {status === 'undone' && <code>{localize(language, 'undo() · Previous post restored', 'undo() · Возврат на прежний пост')}</code>}
            <span className={status === 'executed' ? 'command-outcome' : undefined}>{describeReceiverOutcome(id, order?.outcome, language)}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

type FlightSceneProps = {
  orders: DemoState;
  active: boolean;
  gathered: number;
  gathering: boolean;
  onGather: () => void;
  onLaunch: (id: OrderId) => void;
  onDeliver: (id: OrderId) => void;
  onExecute: (id: OrderId) => void;
};

export function FlightScene({ orders, active, gathered, gathering, onGather, onLaunch, onDeliver, onExecute }: FlightSceneProps)
{
  const language = useLanguage();
  const flying = orders.filter(order => order.status === 'in-flight').length;
  let commanderStatus = localize(language, 'Waiting for registration', 'Ожидает регистрации жуков');
  if (gathering)
  {
    commanderStatus = localize(language, 'Gathering child beetles', 'Собирает жуков-посыльных');
  }
  else if (gathered === orderIds.length)
  {
    commanderStatus = localize(language, `${gathered} registered beetles`, `Зарегистрировано жуков: ${gathered}`);
  }

  return (
    <div className="command-scene" data-active={active}>
      <figure className="command-source">
        <img className="command-source-art" src={commanderArt} alt="" draggable={false} />
        <div className="command-dock" aria-hidden="true">
          {orderIds.map((id, index) =>
          {
            const phase = index === gathered ? 'approaching' : 'docked';
            return (
              <div key={id} className="command-dock-slot">
                {(index < gathered || (gathering && phase === 'approaching')) && (
                  <img className="command-child" data-phase={phase} src={childBeetleArt[id]} alt="" draggable={false}
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
          <strong>{localize(language, 'Commander Beetle', 'Жук-командир')}</strong>
          <span>{localize(language, 'Invoker', 'Инициатор')} · <code>Command[]</code></span>
          <span>{commanderStatus}</span>
          {flying > 0 && <span>{localize(language, flying === 1 ? '1 copy in flight' : `${flying} copies in flight`, `Копий в полёте: ${flying}`)}</span>}
        </figcaption>
      </figure>
      <ul className="command-routes" aria-label={localize(language, 'Order routes', 'Маршруты приказов')}>
        {orderIds.map(id => <FlightRoute key={id} id={id} order={orders.find(order => order.id === id)} onLaunch={() => onLaunch(id)}
          onDeliver={() => onDeliver(id)} onExecute={() => onExecute(id)} />)}
      </ul>
    </div>
  );
}
