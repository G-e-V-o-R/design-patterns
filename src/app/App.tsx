import { useState } from 'react';
import { scenarios } from '../scenarios/registry';
import { ScenarioBoundary } from './ScenarioBoundary';
import './shell.css';
export default function App()
{
  const [activeId, setActiveId] = useState<string>(scenarios[0]!.id);
  const [visited, setVisited] = useState<string[]>([scenarios[0]!.id]);

  function selectScenario(id: string)
  {
    setActiveId(id);
    setVisited(ids => ids.includes(id) ? ids : [...ids, id]);
  }

  return <div className="workshop-app">
    <a className="skip-link" href="#lesson-main">Skip to lesson</a>
    <header className="workshop-header">
      <div className="workshop-brand"><span aria-hidden="true">⌘</span><strong>Pattern Workshop</strong></div>
      <label className="scenario-picker">
        Scenario
        <select value={activeId} onChange={event => selectScenario(event.target.value)}>
          {scenarios.map(scenario => <option key={scenario.id} value={scenario.id}>{scenario.pattern}</option>)}
        </select>
      </label>
    </header>
    <nav className="scenario-navigation" aria-label="Scenarios">
      {scenarios.map(scenario => (
        <button
          key={scenario.id}
          aria-current={activeId === scenario.id ? 'page' : undefined}
          aria-controls={`scenario-${scenario.id}`}
          onClick={() => selectScenario(scenario.id)}
        >
          <strong>{scenario.pattern}</strong>
          <span>{scenario.title}</span>
        </button>
      ))}
    </nav>
    <main id="lesson-main" tabIndex={-1}>
      {scenarios.filter(scenario => visited.includes(scenario.id)).map(({id, title, Component}) => <section key={id} id={`scenario-${id}`} hidden={id !== activeId} aria-label={title}>
        <ScenarioBoundary name={title}><Component active={id === activeId}/></ScenarioBoundary>
      </section>)}
    </main>
    <footer className="workshop-footer"><span>One situation. One pattern. Build the idea.</span><span>Switch freely. Progress resets when you reload.</span></footer>
  </div>;
}
