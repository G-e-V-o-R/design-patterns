import { useState } from 'react';
import { scenarios } from '../scenarios/registry';
import { ScenarioBoundary } from './ScenarioBoundary';
import './shell.css';
export default function App() {
  const [activeId, setActiveId] = useState<string>(scenarios[0].id);
  const [visited, setVisited] = useState<string[]>([scenarios[0].id]);
  const active = scenarios.find(scenario => scenario.id === activeId)!;
  return <div className="workshop-app">
    <a className="skip-link" href="#lesson-main">Skip to lesson</a>
    <header className="workshop-header"><div className="workshop-brand"><span aria-hidden="true">⌘</span><strong>Pattern Workshop</strong></div><span>LEARN BY BUILDING</span><div className="workshop-number">{active.number} <span>/ {active.pattern}</span></div></header>
    <nav className="scenario-navigation" aria-label="Scenarios">
      {scenarios.map(scenario => <button key={scenario.id} aria-current={activeId === scenario.id ? 'page' : undefined} aria-controls={`scenario-${scenario.id}`} onClick={() => {
        setActiveId(scenario.id);
        setVisited(ids => ids.includes(scenario.id) ? ids : [...ids, scenario.id]);
      }}><span>{scenario.number} / {scenario.pattern}</span><strong>{scenario.title}</strong></button>)}
      <p>Each scenario has its own workspace.</p>
    </nav>
    <main id="lesson-main" tabIndex={-1}>
      {scenarios.filter(scenario => visited.includes(scenario.id)).map(({id, title, Component}) => <section key={id} id={`scenario-${id}`} hidden={id !== activeId} aria-label={title}>
        <ScenarioBoundary name={title}><Component/></ScenarioBoundary>
      </section>)}
    </main>
    <footer className="workshop-footer"><span>One situation. One pattern. Build the idea.</span><span>Switch freely. Progress resets when you reload.</span></footer>
  </div>;
}
