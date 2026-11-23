import { localize, useLanguage } from './language';
import { useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from 'react';
import { solutionConfiguredLesson, type LessonGraph } from './configuredLessonModel';
import type { CompiledScenario } from './scenarioConfig';
import { ConfiguredLessonWorkspace } from './ConfiguredLessonWorkspace';
import { ConfiguredWorkedExample } from './ConfiguredWorkedExample';
import { StoryIntro } from './StoryIntro';
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
  graphConfig?: CompiledScenario;
  active?: boolean;
  Demo?: ComponentType<ConfiguredDemoProps>;
};

export function ConfiguredScenario({ config, graphConfig = config, active = true, Demo }: ConfiguredScenarioProps)
{
  const language = useLanguage();
  const editor = useConfiguredLesson(config);
  const [view, setView] = useState<'diagram' | 'example' | 'demo' | 'demo-preview'>('diagram');
  const [hasOpenedDemo, setHasOpenedDemo] = useState(false);
  const exampleGraph = useMemo(() => solutionConfiguredLesson(graphConfig), [graphConfig]);
  const diagramTab = useRef<HTMLButtonElement>(null);
  const demoTab = useRef<HTMLButtonElement>(null);
  const showingExample = view === 'example';
  const previewingDemo = import.meta.env.DEV && view === 'demo-preview';
  const showingDemo = view === 'demo' || previewingDemo;
  const demoGraphReady = editor.ready || previewingDemo;
  const demoReady = Boolean(Demo && demoGraphReady && !showingExample);
  const showDemoStatus = !showingExample && !demoReady;
  const diagramId = `${config.id}-diagram-panel`;
  const demoId = `${config.id}-demo-panel`;
  const demoStatusId = `${config.id}-demo-status`;
  const demoStatus = Demo
    ? localize(language, 'Finish your diagram to run its demo.', 'Завершите диаграмму, чтобы запустить демонстрацию.')
    : localize(language, 'Demo unavailable for this lesson.', 'Для этого урока демонстрация недоступна.');

  function openDemo()
  {
    if (demoReady && !showingDemo)
    {
      setHasOpenedDemo(true);
      setView('demo');
      demoTab.current?.focus();
    }
  }

  function openDiagram()
  {
    setView('diagram');
  }

  function returnToDiagram()
  {
    openDiagram();
    diagramTab.current?.focus();
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

  return (
    <section className="configured-lesson pattern-lesson" aria-labelledby={config.intro.headingId}>
      <StoryIntro content={config.intro} onStart={startBuilding} />
      <div className="configured-lesson-navigation">
        <div className="configured-lesson-tabs" role="tablist" aria-label={localize(language, 'Lesson workspace', 'Рабочая область урока')} onKeyDown={moveTabFocus}>
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
            {localize(language, 'Class diagram', 'Диаграмма классов')}
          </button>
          <button
            ref={demoTab}
            type="button"
            role="tab"
            id={`${demoId}-tab`}
            aria-controls={demoId}
            aria-selected={showingDemo}
            aria-disabled={!demoReady}
            aria-describedby={showDemoStatus ? demoStatusId : undefined}
            tabIndex={showingDemo ? 0 : -1}
            onClick={openDemo}
          >
            {localize(language, 'Demo', 'Демонстрация')}
          </button>
        </div>
        {showDemoStatus && <p id={demoStatusId}>{demoStatus}</p>}
        {import.meta.env.DEV && Demo && view === 'diagram' && !editor.ready && (
          <button
            type="button"
            onClick={() =>
            {
              setView('demo-preview');
              demoTab.current?.focus();
            }}
          >
            {localize(language, 'Run demo (dev)', 'Запустить демо (режим разработки)')}
          </button>
        )}
      </div>
      <div id={diagramId} role="tabpanel" aria-labelledby={`${diagramId}-tab`} hidden={showingDemo}>
        <div hidden={showingExample}>
          <ConfiguredLessonWorkspace
            config={config}
            editor={editor}
            active={active && view === 'diagram'}
            onOpenExample={() => setView('example')}
            onRunDemo={Demo && editor.ready ? openDemo : undefined}
          />
        </div>
        {showingExample && (
          <ConfiguredWorkedExample
            config={config}
            graph={exampleGraph}
            active={active}
            onReturn={returnToDiagram}
          />
        )}
      </div>
      <div id={demoId} role="tabpanel" aria-labelledby={`${demoId}-tab`} hidden={!showingDemo}>
        {Demo && (hasOpenedDemo || previewingDemo) && demoGraphReady && (
          <Demo
            graph={previewingDemo ? exampleGraph : editor.graph}
            ready={demoGraphReady}
            active={active && showingDemo}
          />
        )}
      </div>
    </section>
  );
}
