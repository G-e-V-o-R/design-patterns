import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

const latve = { wakeEveryone: () => 'Latve wakes everyone.' };
const faelina = { setTraps: () => 'Faelina sets the traps.' };
const narion = {
  post: 'Narion is at the hill post.',
  holdFlank: () => 'Narion guards the flank.',
  returnTo: (previousPost: string) => previousPost,
};

type Execution = {
  outcome: string;
  undo?: () => string;
};

interface Command {
  execute(): Execution;
}

class WakeEveryoneCommand implements Command {
  constructor(private readonly receiver: typeof latve)
  {
  }

  execute()
  {
    return { outcome: this.receiver.wakeEveryone() };
  }
}

class SetTrapsCommand implements Command {
  constructor(private readonly receiver: typeof faelina)
  {
  }

  execute()
  {
    return { outcome: this.receiver.setTraps() };
  }
}

class HoldFlankCommand implements Command {
  constructor(private readonly receiver: typeof narion)
  {
  }

  execute()
  {
    const previousPost = this.receiver.post;
    return {
      outcome: this.receiver.holdFlank(),
      undo: () => this.receiver.returnTo(previousPost),
    };
  }
}

export const orderDetails = {
  wake: { name: 'WakeEveryoneCommand', receiver: 'Latve', before: 'Everyone is asleep.' },
  traps: { name: 'SetTrapsCommand', receiver: 'Faelina', before: 'The traps are unset.' },
  flank: { name: 'HoldFlankCommand', receiver: 'Narion', before: narion.post },
} as const;

export type OrderId = keyof typeof orderDetails;
export type OrderStatus = 'pending' | 'in-flight' | 'canceled' | 'executed' | 'undone';

type Order = {
  id: OrderId;
  command: Command;
  status: OrderStatus;
  outcome?: string;
  execution?: Execution & { sequence: number };
};

export type DemoState = readonly Order[];
export type DemoAction =
  | { type: 'register' | 'undo-last' }
  | { type: 'dispatch' | 'deliver' | 'cancel'; id: OrderId };

export function createSimulation(graph: LessonGraph): DemoState | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }
  return [];
}

export function canCancel(status: OrderStatus | undefined)
{
  return status === 'pending' || status === 'in-flight';
}

export function executionHistory(orders: DemoState)
{
  return orders.flatMap(order => order.execution ? [{ ...order, execution: order.execution }] : [])
    .sort((first, second) => first.execution.sequence - second.execution.sequence);
}

export function lastExecution(orders: DemoState)
{
  return executionHistory(orders).filter(order => order.status === 'executed').at(-1);
}

export function changeOrders(orders: DemoState, action: DemoAction): DemoState
{
  switch (action.type)
  {
    case 'register':
      if (orders.length > 0)
      {
        return orders;
      }
      return [
        { id: 'wake', command: new WakeEveryoneCommand(latve), status: 'pending' },
        { id: 'traps', command: new SetTrapsCommand(faelina), status: 'pending' },
        { id: 'flank', command: new HoldFlankCommand(narion), status: 'pending' },
      ];
    case 'dispatch':
      return orders.map(order => order.id === action.id && order.status === 'pending'
        ? { ...order, status: 'in-flight' }
        : order);
    case 'cancel':
      return orders.map(order => order.id === action.id && canCancel(order.status)
        ? { ...order, status: 'canceled' }
        : order);
    case 'deliver': {
      const sequence = orders.filter(order => order.execution).length;
      return orders.map(order =>
      {
        if (order.id !== action.id || order.status !== 'in-flight')
        {
          return order;
        }
        const execution = { ...order.command.execute(), sequence };
        return { ...order, status: 'executed', outcome: execution.outcome, execution };
      });
    }
    case 'undo-last': {
      const order = lastExecution(orders);
      if (!order?.execution?.undo)
      {
        return orders;
      }
      const outcome = order.execution.undo();
      return orders.map(entry => entry.id === order.id ? { ...entry, status: 'undone', outcome } : entry);
    }
  }
}
