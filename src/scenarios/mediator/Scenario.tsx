import { useState } from 'react';
import { emptyLesson } from './model';
import { MediatorLesson } from './LessonWorkspace';
import '../shared/artwork.css';
import './styles.css';

type MediatorScenarioProps = {
  active?: boolean;
};

export default function MediatorScenario({
  active = true,
}: MediatorScenarioProps)
{
  const [graph, setGraph] = useState(emptyLesson);

  return (
    <div className="mediator-scenario">
      <MediatorLesson
        active={active}
        graph={graph}
        onChange={setGraph}
      />
    </div>
  );
}
