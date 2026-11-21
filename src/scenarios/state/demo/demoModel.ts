import { getConfiguredLessonIssues, type LessonGraph } from '../../shared/configuredLessonModel';
import { config } from '../config/config';

export type StoryEvent = 'approach' | 'reassure';
export type StateId = 'calm' | 'wary' | 'furious';
export type Reaction = 'quiet' | 'hiss' | 'lunge';
export type Transition = { event: StoryEvent; from: StateId; to: StateId };

interface SnakeState {
  readonly id: StateId;
  nextState(event: StoryEvent): SnakeState;
  react(): Reaction;
}

class CalmState implements SnakeState {
  readonly id = 'calm';

  nextState(event: StoryEvent): SnakeState
  {
    return event === 'approach' ? waryState : this;
  }

  react(): Reaction
  {
    return 'quiet';
  }
}

class WaryState implements SnakeState {
  readonly id = 'wary';

  nextState(event: StoryEvent): SnakeState
  {
    return event === 'approach' ? furiousState : calmState;
  }

  react(): Reaction
  {
    return 'hiss';
  }
}

class FuriousState implements SnakeState {
  readonly id = 'furious';

  nextState(event: StoryEvent): SnakeState
  {
    return event === 'approach' ? this : waryState;
  }

  react(): Reaction
  {
    return 'lunge';
  }
}

const calmState = new CalmState();
const waryState = new WaryState();
const furiousState = new FuriousState();

const states = [calmState, waryState, furiousState];
const storyEvents: readonly StoryEvent[] = ['approach', 'reassure'];

export const stateOrder: readonly StateId[] = states.map(state => state.id);
export const stateTransitions: readonly Transition[] = states.flatMap(state =>
  storyEvents.map(event => ({ event, from: state.id, to: state.nextState(event).id })),
);

class Snake {
  private state: SnakeState = calmState;

  get stateId(): StateId
  {
    return this.state.id;
  }

  handle(event: StoryEvent): Transition
  {
    const from = this.state.id;
    this.state = this.state.nextState(event);
    return { event, from, to: this.state.id };
  }

  react(): Reaction
  {
    return this.state.react();
  }
}

class Jararis {
  constructor(private readonly snake: Snake)
  {
  }

  handle(event: StoryEvent): Transition
  {
    return this.snake.handle(event);
  }
}

export function createSimulation(graph: LessonGraph)
{
  if (getConfiguredLessonIssues(config, graph).length > 0)
  {
    return null;
  }

  const snake = new Snake();
  return { jararis: new Jararis(snake), snake };
}
