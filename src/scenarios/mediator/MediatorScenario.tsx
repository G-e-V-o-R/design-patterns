import { useState } from 'react';
import { emptyLesson } from './model';
import { MediatorLesson } from './MediatorLesson';
import '../shared/artwork.css';
import './mediator.css';

export default function MediatorScenario({ active = true }: { active?: boolean }) {
  const [graph, setGraph] = useState(emptyLesson);
  return <div className="mediator-scenario"><MediatorLesson active={active} graph={graph} onChange={setGraph}/></div>;
}
