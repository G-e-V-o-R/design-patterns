import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

const latve = { wakeEveryone: () => 'Latve wakes everyone.' };
const faelina = { setTraps: () => 'Faelina sets the traps.' };
const narion = {
  post: 'Narion guards the left flank.',
  holdFlank: () => 'Narion reaches the right lookout. The right advance was a feint. The orcs are attacking on the left.',
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
  wake: { name: 'WakeEveryoneCommand', receiver: 'Latve', method: 'wakeEveryone()', before: 'Everyone is asleep.' },
  traps: { name: 'SetTrapsCommand', receiver: 'Faelina', method: 'setTraps()', before: 'The traps are unset.' },
  flank: { name: 'HoldFlankCommand', receiver: 'Narion', method: 'holdFlank()', before: 'Narion guards the left flank. Dre’Kaar spots orcs approaching on the right.' },
} as const;

export type OrderId = keyof typeof orderDetails;
export type OrderStatus = 'pending' | 'launching' | 'in-flight' | 'handoff' | 'executed' | 'undone';

type Order = {
  id: OrderId;
  command: Command;
  status: OrderStatus;
  outcome?: string;
  execution?: Execution & { sequence: number };
};

export type DemoState = readonly Order[];
export type DemoAction =
  | { type: 'register' }
  | { type: 'dispatch' | 'launch' | 'deliver' | 'execute' | 'undo'; id: OrderId };

export function createSimulation(graph: LessonGraph): DemoState | null
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }
  return [];
}

export function executionHistory(orders: DemoState)
{
  return orders.flatMap(order => order.execution ? [{ ...order, execution: order.execution }] : [])
    .sort((first, second) => first.execution.sequence - second.execution.sequence);
}

export function undoForOrder(orders: DemoState, id: OrderId)
{
  return orders.find(order => order.id === id && order.status === 'executed')?.execution?.undo;
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
        ? { ...order, status: 'launching' }
        : order);
    case 'launch':
      return orders.map(order => order.id === action.id && order.status === 'launching'
        ? { ...order, status: 'in-flight' }
        : order);
    case 'deliver':
      return orders.map(order => order.id === action.id && order.status === 'in-flight'
        ? { ...order, status: 'handoff' }
        : order);
    case 'execute': {
      const sequence = orders.filter(order => order.execution).length;
      return orders.map(order =>
      {
        if (order.id !== action.id || order.status !== 'handoff')
        {
          return order;
        }
        const execution = { ...order.command.execute(), sequence };
        return { ...order, status: 'executed', outcome: execution.outcome, execution };
      });
    }
    case 'undo': {
      const undo = undoForOrder(orders, action.id);
      if (!undo)
      {
        return orders;
      }
      const outcome = undo();
      return orders.map(entry => entry.id === action.id ? { ...entry, status: 'undone', outcome } : entry);
    }
  }
}
