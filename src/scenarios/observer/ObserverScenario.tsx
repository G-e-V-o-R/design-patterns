import { useState } from 'react';
import { emptyLesson } from './model';
import { ObserverLesson } from './ObserverLesson';
import './observer.css';
export default function ObserverScenario({ active = true }: { active?: boolean }) {
  const [graph, setGraph] = useState(emptyLesson);
  return <div className="observer-scenario"><ObserverLesson active={active} graph={graph} onChange={setGraph}/></div>;
}
