import type { ComponentType } from 'react';
import type { LessonGraph } from './configuredLessonModel';
import type { CompiledScenario } from './scenarioConfig';
import { ConfiguredLessonWorkspace } from './ConfiguredLessonWorkspace';
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

  return (
    <ConfiguredLessonWorkspace config={config} editor={editor} active={active}>
      {Demo && editor.ready && <Demo graph={editor.graph} ready={editor.ready} active={active} />}
    </ConfiguredLessonWorkspace>
  );
}
