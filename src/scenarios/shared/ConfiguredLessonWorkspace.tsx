import { localize, useLanguage, type Language } from './language';
import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { applyNodeChanges, type Connection, type Edge, type EdgeChange, type NodeChange } from '@xyflow/react';
import { ClassDiagramCanvas } from './ClassDiagramCanvas';
import { configuredNodeTypes, type ConfiguredClassNode } from './ConfiguredClassNode';
import { facingConnectionHandles } from './connections';
import { DiagramBuilderPanel, type CardCategory } from './DiagramBuilderPanel';
import { BoardToolbar, LessonWorkspace } from './LessonLayout';
import { RelationshipList } from './RelationshipList';
import { parallelRelationshipEdgeTypes, spaceParallelRelationships } from './ParallelRelationshipEdge';
import { createRelationshipEdge } from './relationships';
import type { CompiledScenario } from './scenarioConfig';
import type { ConfiguredLessonEditor } from './useConfiguredLesson';

type WorkspaceProps = {
  config: CompiledScenario;
  editor: ConfiguredLessonEditor;
  active: boolean;
  onOpenExample: () => void;
  onRunDemo?: () => void;
};

type NodePresentation = Pick<ConfiguredClassNode, 'selected' | 'measured'>;

export function ConfiguredLessonWorkspace({ config, editor, active, onOpenExample, onRunDemo }: WorkspaceProps)
{
  const language = useLanguage();
  const [category, setCategory] = useState<CardCategory>('classes');
  const [relationship, setRelationship] = useState(config.relationships[0]?.id ?? '');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [nodeState, setNodeState] = useState<Record<string, NodePresentation>>({});
  const [selectedEdges, setSelectedEdges] = useState<Set<number>>(() => new Set());
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const cardsDialog = useRef<HTMLDialogElement>(null);
  const cardsDialogId = `${config.id}-cards-title`;
  const dragType = `application/x-${config.id}-member`;
  const { graph, layout } = editor;
  const invalidMembers = new Set(editor.issues.flatMap(issue => issue.memberIds));
  const invalidEdges = new Set(editor.issues.flatMap(issue => issue.edgeIndices));
  const firstClass = config.classes[0];
  const correctMembers = Object.keys(graph.members).filter(id => !invalidMembers.has(id)).length;
  const progress = [
    { label: localize(language, 'Classes', 'Классы'), correct: graph.classes.length, total: config.classes.length },
    { label: localize(language, 'Members', 'Поля и методы'), correct: correctMembers, total: config.members.length },
    { label: localize(language, 'Relationships', 'Связи'), correct: graph.edges.length - invalidEdges.size, total: config.expectedEdges.length },
  ].filter(item => item.total > 0);
  const status = editor.message || diagramStatus(language, config, editor, correctMembers, invalidEdges.size);

  useEffect(() =>
  {
    const dialog = cardsDialog.current;
    if (!active)
    {
      dialog?.close();
      return;
    }

    const mobile = window.matchMedia('(max-width: 720px)');
    function closeOnDesktop(event: MediaQueryListEvent)
    {
      if (!event.matches)
      {
        dialog?.close();
      }
    }
    mobile.addEventListener('change', closeOnDesktop);
    return () => mobile.removeEventListener('change', closeOnDesktop);
  }, [active]);

  useEffect(() =>
  {
    setConnectionSource(null);
    setSelectedEdges(new Set());
  }, [graph]);

  useEffect(() =>
  {
    if (!active)
    {
      return;
    }
    function cancelDrawing(event: KeyboardEvent)
    {
      if (event.key === 'Escape')
      {
        setDrawing(false);
        setConnectionSource(null);
      }
    }
    window.addEventListener('keydown', cancelDrawing);
    return () => window.removeEventListener('keydown', cancelDrawing);
  }, [active]);

  function classLabel(id: string)
  {
    return config.classes.find(card => card.id === id)?.label ?? id;
  }

  function startDrag(event: DragEvent, id: string)
  {
    event.dataTransfer.setData(dragType, id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedMember(id);
  }

  function endDrag()
  {
    setDraggedMember(null);
    setDropTarget(null);
  }

  function returnMember(event: DragEvent<HTMLDivElement>)
  {
    if (!event.dataTransfer.types.includes(dragType))
    {
      return;
    }
    event.preventDefault();
    editor.assign(event.dataTransfer.getData(dragType), '');
    endDrag();
  }

  function allowReturn(event: DragEvent<HTMLDivElement>)
  {
    if (event.dataTransfer.types.includes(dragType))
    {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }

  const nodes: ConfiguredClassNode[] = config.classes
    .filter(card => graph.classes.includes(card.id))
    .map(card => ({
      id: card.id,
      type: 'configuredClass',
      ariaLabel: card.label,
      domAttributes: language === 'ru' ? { 'aria-roledescription': 'карточка класса' } : undefined,
      position: layout.positions[card.id] ?? config.positions[card.id] ?? { x: 0, y: 0 },
      ...nodeState[card.id],
      className: connectionSource === card.id ? 'pattern-connection-source' : '',
      data: {
        ...card,
        dragType,
        members: config.members.filter(member => graph.members[member.id] === card.id),
        invalidMemberIds: invalidMembers,
        isDropTarget: dropTarget === card.id,
        draggedMemberId: draggedMember,
        onStartMemberDrag: startDrag,
        onEndMemberDrag: endDrag,
        onRemove: () => editor.removeClasses([card.id]),
        onAssign: id => editor.assign(id, card.id),
        onDragHover: hovered =>
        {
          setDropTarget(current =>
          {
            if (hovered)
            {
              return card.id;
            }
            if (current === card.id)
            {
              return null;
            }
            return current;
          });
        },
      },
    }));

  const edges = spaceParallelRelationships(graph.edges.map((edge, index) =>
  {
    const selected = selectedEdges.has(index);
    const relationshipEdge = createRelationshipEdge(edge, index, config.relationships, config.id, selected, invalidEdges.has(index));
    return {
      ...relationshipEdge,
      ...language === 'ru' && {
        ariaLabel: `${classLabel(edge.source)} → ${relationshipEdge.label} → ${classLabel(edge.target)}`,
        domAttributes: { 'aria-roledescription': 'связь' },
      },
      reconnectable: selected,
    };
  }));

  function changeNodes(changes: NodeChange<ConfiguredClassNode>[])
  {
    const positions = Object.fromEntries(changes.flatMap(change =>
      change.type === 'position' && change.position ? [[change.id, change.position]] : [],
    ));
    if (Object.keys(positions).length)
    {
      editor.moveClasses(positions);
    }
    const nextNodes = applyNodeChanges(changes, nodes);
    setNodeState(Object.fromEntries(nextNodes.map(node => [node.id, {
      selected: node.selected,
      measured: node.measured,
    }])));
  }

  function changeEdges(changes: EdgeChange<Edge>[])
  {
    setSelectedEdges(current =>
    {
      const next = new Set(current);
      for (const change of changes)
      {
        if (change.type !== 'select')
        {
          continue;
        }
        if (change.selected)
        {
          next.add(Number(change.id));
        }
        else
        {
          next.delete(Number(change.id));
        }
      }
      return next;
    });
  }

  function connect(connection: Connection)
  {
    editor.connect(connection, relationship);
    setConnectionSource(null);
  }

  function clickNode(event: MouseEvent, node: ConfiguredClassNode)
  {
    const isControl = event.target instanceof Element
      && event.target.closest('button, .pattern-assigned-method, .react-flow__handle');
    if (!drawing || isControl)
    {
      return;
    }
    if (!connectionSource)
    {
      setConnectionSource(node.id);
      return;
    }
    const source = nodes.find(card => card.id === connectionSource);
    if (source)
    {
      const handles = facingConnectionHandles(source.position, node.position);
      editor.connect({ source: source.id, target: node.id, ...handles }, relationship);
    }
    setConnectionSource(null);
  }

  function reset()
  {
    editor.reset();
    setNodeState({});
    setDrawing(false);
    endDrag();
  }

  function addClassFromDrawer(id: string)
  {
    editor.addClass(id);
    cardsDialog.current?.close();
  }

  function assignFromDrawer(memberId: string, owner: string)
  {
    editor.assign(memberId, owner);
    cardsDialog.current?.close();
  }

  const cardPanelProps = {
    classes: config.classes,
    members: config.members,
    placedClasses: graph.classes,
    assignments: graph.members,
    category,
    onCategoryChange: setCategory,
    draggedMemberId: draggedMember,
    onStartDrag: startDrag,
    onEndDrag: endDrag,
  };

  return (
    <LessonWorkspace
      onDragEnd={endDrag}
      tray={
        <div className="configured-tray" onDragOver={allowReturn} onDrop={returnMember}>
          <DiagramBuilderPanel
            {...cardPanelProps}
            hideAssignedMembers
            onAddClass={editor.addClass}
          />
        </div>
      }
    >
      <BoardToolbar
        progress={progress}
        status={status}
        canUndo={editor.canUndo}
        onUndo={editor.undo}
        onReset={reset}
        onOpenCards={() => cardsDialog.current?.showModal()}
        onOpenExample={onOpenExample}
        onRunDemo={onRunDemo}
      />
      <dialog ref={cardsDialog} className="configured-cards-dialog" aria-labelledby={cardsDialogId}>
        <header className="configured-cards-dialog-header">
          <h2 id={cardsDialogId}>{localize(language, 'Add or assign cards', 'Добавление и распределение карточек')}</h2>
          <button type="button" onClick={() => cardsDialog.current?.close()}>{localize(language, 'Close', 'Закрыть')}</button>
        </header>
        <DiagramBuilderPanel {...cardPanelProps} onAddClass={addClassFromDrawer} onAssign={assignFromDrawer} />
      </dialog>
      <ClassDiagramCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={configuredNodeTypes}
        edgeTypes={parallelRelationshipEdgeTypes}
        classKey={`${editor.fitRevision}:${graph.classes.join(',')}`}
        active={active}
        markerNamespace={config.id}
        label={localize(language, `${config.pattern} class diagram`, `Диаграмма классов · ${config.pattern}`)}
        emptyTitle={localize(language, 'Start your diagram', 'Начните построение диаграммы')}
        emptyAction={firstClass && { label: localize(language, `Add ${firstClass.label}`, `Добавить ${firstClass.label}`), onClick: () => editor.addClass(firstClass.id) }}
        onNodesChange={changeNodes}
        onEdgesChange={changeEdges}
        onNodesDelete={deleted => editor.removeClasses(deleted.map(node => node.id))}
        onEdgesDelete={deleted => editor.removeEdges(deleted.map(edge => Number(edge.id)))}
        onConnect={connect}
        onReconnect={(edge, connection) => editor.reconnect(Number(edge.id), connection)}
        onNodeClick={clickNode}
        onPaneClick={() => setConnectionSource(null)}
        relationships={config.relationships}
        relationshipTools={{
          drawing,
          relationship,
          connectionSource,
          classLabel,
          onMoveMode: () =>
          {
            setDrawing(false);
            setConnectionSource(null);
          },
          onSelectRelationship: type =>
          {
            setRelationship(type);
            setDrawing(true);
            setConnectionSource(null);
          },
        }}
      />
      <RelationshipList
        edges={graph.edges}
        relationships={config.relationships}
        classLabel={classLabel}
        invalidEdgeIndices={invalidEdges}
        onRemove={index => editor.removeEdges([index])}
      />
    </LessonWorkspace>
  );
}

function diagramStatus(language: Language, config: CompiledScenario, editor: ConfiguredLessonEditor, correctMembers: number, invalidEdges: number)
{
  if (editor.ready)
  {
    return localize(language, 'Your diagram is complete.', 'Ваша диаграмма готова.');
  }
  if (invalidEdges > 0 || correctMembers < Object.keys(editor.graph.members).length)
  {
    return localize(language, 'Review the highlighted members or relationships.', 'Проверьте выделенные поля, методы и связи.');
  }
  if (editor.graph.classes.length < config.classes.length)
  {
    return localize(language, 'Add class and interface cards to the canvas.', 'Добавьте на диаграмму карточки классов и интерфейсов.');
  }
  if (correctMembers < config.members.length)
  {
    return localize(language, 'Place the remaining fields and methods.', 'Распределите оставшиеся поля и методы.');
  }
  return localize(language, 'Draw the remaining relationships.', 'Нарисуйте оставшиеся связи.');
}

