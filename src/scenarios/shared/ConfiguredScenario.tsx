import { useRef, useState, type ComponentType, type KeyboardEvent } from 'react';
import type { LessonGraph } from './configuredLessonModel';
import type { CompiledScenario } from './scenarioConfig';
import { ConfiguredLessonWorkspace } from './ConfiguredLessonWorkspace';
import { ConceptCallout, StoryIntro } from './StoryIntro';
import { useConfiguredLesson } from './useConfiguredLesson';
import './lesson.css';
import './configuredLesson.css';

export type ConfiguredDemoProps = {
  graph: LessonGraph;
  ready: boolean;
  active: boolean;
};

export type ConfiguredScenarioProps = {
  config: CompiledScenario;
  active?: boolean;
  Demo?: ComponentType<ConfiguredDemoProps>;
};

export function ConfiguredScenario({ config, active = true, Demo }: ConfiguredScenarioProps)
{
  const editor = useConfiguredLesson(config);
  const [view, setView] = useState<'diagram' | 'demo' | 'diagram-after-demo'>('diagram');
  const diagramTab = useRef<HTMLButtonElement>(null);
  const demoTab = useRef<HTMLButtonElement>(null);
  const demoReady = Boolean(Demo && editor.ready);
  const showingDemo = demoReady && view === 'demo';
  const diagramId = `${config.id}-diagram-panel`;
  const demoId = `${config.id}-demo-panel`;
  const demoStatusId = `${config.id}-demo-status`;
  const demoStatus = Demo ? 'Complete the class diagram to unlock the demo.' : 'Demo unavailable for this lesson.';

  if (!demoReady && view !== 'diagram')
  {
    setView('diagram');
  }

  function openDemo()
  {
    if (demoReady)
    {
      setView('demo');
      demoTab.current?.focus();
    }
  }

  function openDiagram()
  {
    if (showingDemo)
    {
      setView('diagram-after-demo');
    }
  }

  function startBuilding()
  {
    openDiagram();
    diagramTab.current?.focus({ preventScroll: true });
    diagramTab.current?.scrollIntoView({ block: 'start' });
  }

  function moveTabFocus(event: KeyboardEvent<HTMLDivElement>)
  {
    switch (event.key)
    {
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        if (event.target === diagramTab.current)
        {
          demoTab.current?.focus();
        }
        else
        {
          diagramTab.current?.focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        diagramTab.current?.focus();
        break;
      case 'End':
        event.preventDefault();
        demoTab.current?.focus();
        break;
    }
  }

  const workspace = (
    <ConfiguredLessonWorkspace
      config={config}
      editor={editor}
      active={active && !showingDemo}
      onRunDemo={demoReady ? openDemo : undefined}
    />
  );

  return (
    <section className="configured-lesson pattern-lesson" aria-labelledby={config.intro.headingId}>
      <StoryIntro content={config.intro} onStart={startBuilding} />
      <div className="configured-lesson-navigation">
        <div className="configured-lesson-tabs" role="tablist" aria-label="Lesson workspace" onKeyDown={moveTabFocus}>
          <button
            ref={diagramTab}
            type="button"
            role="tab"
            id={`${diagramId}-tab`}
            aria-controls={diagramId}
            aria-selected={!showingDemo}
            tabIndex={showingDemo ? -1 : 0}
            onClick={openDiagram}
          >
            Class diagram
          </button>
          <button
            ref={demoTab}
            type="button"
            role="tab"
            id={`${demoId}-tab`}
            aria-controls={demoId}
            aria-selected={showingDemo}
            aria-disabled={!demoReady}
            aria-describedby={demoReady ? undefined : demoStatusId}
            tabIndex={showingDemo ? 0 : -1}
            onClick={openDemo}
          >
            Demo
          </button>
        </div>
        {!demoReady && <p id={demoStatusId}>{demoStatus}</p>}
      </div>
      <div id={diagramId} role="tabpanel" aria-labelledby={`${diagramId}-tab`} hidden={showingDemo}>
        {workspace}
      </div>
      <div id={demoId} role="tabpanel" aria-labelledby={`${demoId}-tab`} hidden={!showingDemo}>
        {Demo && demoReady && view !== 'diagram' && (
          <Demo graph={editor.graph} ready={editor.ready} active={active && showingDemo} />
        )}
      </div>
      {config.intro.concept && <ConceptCallout>{config.intro.concept}</ConceptCallout>}
    </section>
  );
}
