import { useState } from 'react';
import { emptyLesson } from './model';
import { ChainLesson } from './LessonWorkspace';
import '../shared/artwork.css';
import './styles.css';

export default function ChainScenario({ active = true }: { active?: boolean })
{
  const [graph, setGraph] = useState(emptyLesson);

  return (
    <div className="chain-scenario">
      <ChainLesson
        active={active}
        graph={graph}
        onChange={setGraph}
      />
    </div>
  );
}
