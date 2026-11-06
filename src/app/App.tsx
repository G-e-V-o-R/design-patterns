import { useState } from 'react';
import { emptyLesson } from '../application/observer-lesson';
import { ObserverLesson } from './components/ObserverLesson';
import './observer-lesson.css';

export default function App() {
  const [graph, setGraph] = useState(emptyLesson);
  return <div className="lesson-app">
    <a className="skip-link" href="#lesson-main">Skip to lesson</a>
    <header className="lesson-header"><div className="lesson-brand"><span aria-hidden="true">⌘</span><strong>Pattern Workshop</strong></div><span>LEARN BY BUILDING</span><div className="lesson-number">01 <span>/ Observer</span></div></header>
    <main id="lesson-main" tabIndex={-1}><ObserverLesson graph={graph} onChange={setGraph}/></main>
    <footer className="lesson-footer"><span>One situation. One pattern. Build the idea.</span><span>Progress resets when you reload.</span></footer>
  </div>;
}
