import { localize, useLanguage } from './language';
import { ClassDiagramCanvas } from './ClassDiagramCanvas';
import { configuredNodeTypes, type ConfiguredClassNode } from './ConfiguredClassNode';
import type { LessonGraph } from './configuredLessonModel';
import { parallelRelationshipEdgeTypes, spaceParallelRelationships } from './ParallelRelationshipEdge';
import { RelationshipList } from './RelationshipList';
import { createRelationshipEdge } from './relationships';
import type { CompiledScenario } from './scenarioConfig';

type WorkedExampleProps = {
  config: CompiledScenario;
  graph: LessonGraph;
  active: boolean;
  onReturn: () => void;
};

function focusHeading(heading: HTMLHeadingElement | null)
{
  heading?.focus();
}

export function ConfiguredWorkedExample({ config, graph, active, onReturn }: WorkedExampleProps)
{
  const language = useLanguage();
  const namespace = `${config.id}-worked-example`;
  const classLabel = (id: string) => config.classes.find(card => card.id === id)?.label ?? id;
  const nodes: ConfiguredClassNode[] = config.classes.map(card =>
  {
    const position = config.solutionPositions[card.id]!;
    return {
      id: card.id,
      type: 'configuredClass',
      ariaLabel: card.label,
      domAttributes: language === 'ru' ? { 'aria-roledescription': 'карточка класса' } : undefined,
      position,
      origin: position.anchorY === 'center' ? [0, 0.5] : undefined,
      data: {
        ...card,
        showArtwork: false,
        members: config.members.filter(member => graph.members[member.id] === card.id),
      },
    };
  });
  const edges = spaceParallelRelationships(graph.edges.map((edge, index) =>
  {
    const relationshipEdge = createRelationshipEdge(edge, index, config.relationships, namespace);
    return {
      ...relationshipEdge,
      ...language === 'ru' && {
        ariaLabel: `${classLabel(edge.source)} → ${relationshipEdge.label} → ${classLabel(edge.target)}`,
        domAttributes: { 'aria-roledescription': 'связь' },
      },
      type: 'straight',
    };
  }));

  return (
    <div className="pattern-board configured-worked-example">
      <header className="pattern-board-toolbar">
        <h2 ref={focusHeading} tabIndex={-1}>{localize(language, 'Worked example', 'Готовый пример')}</h2>
        <div className="configured-board-actions">
          <button type="button" onClick={onReturn}>{localize(language, 'Back to your diagram', 'Вернуться к своей диаграмме')}</button>
        </div>
      </header>
      <ClassDiagramCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={configuredNodeTypes}
        edgeTypes={parallelRelationshipEdgeTypes}
        classKey={namespace}
        active={active}
        compact
        markerNamespace={namespace}
        relationships={config.relationships}
        label={localize(language, `${config.pattern} worked example diagram`, `Диаграмма готового примера · ${config.pattern}`)}
      />
      <RelationshipList
        edges={graph.edges}
        relationships={config.relationships}
        classLabel={classLabel}
      />
    </div>
  );
}
