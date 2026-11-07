import { useState } from 'react';
import { emptyLesson } from './model';
import { ObserverLesson } from './ObserverLesson';
import './observer.css';
export default function ObserverScenario() {
  const [graph, setGraph] = useState(emptyLesson);
  return <div className="observer-scenario"><ObserverLesson graph={graph} onChange={setGraph}/></div>;
}
