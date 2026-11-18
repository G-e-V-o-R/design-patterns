import { useEffect, useState, type DragEvent, type MouseEvent, type ReactNode } from 'react';
import { applyNodeChanges, type Connection, type Edge, type EdgeChange, type NodeChange } from '@xyflow/react';
import { ClassDiagramCanvas } from './ClassDiagramCanvas';
import { configuredNodeTypes, type ConfiguredClassNode } from './ConfiguredClassNode';
import { DiagramBuilderPanel, type CardCategory } from './DiagramBuilderPanel';
import { BoardToolbar, LessonStatus, LessonWorkspace, SolutionNotice } from './LessonLayout';
import { RelationshipList } from './RelationshipList';
import { ConceptCallout, StoryIntro } from './StoryIntro';
import { createRelationshipEdge } from './relationships';
import type { CompiledScenario } from './scenarioConfig';
import type { ConfiguredLessonEditor } from './useConfiguredLesson';

type WorkspaceProps = {
  config: CompiledScenario;
  editor: ConfiguredLessonEditor;
  active: boolean;
  children?: ReactNode;
};

type NodePresentation = Pick<ConfiguredClassNode, 'position' | 'selected' | 'measured'>;

export function ConfiguredLessonWorkspace({ config, editor, active, children }: WorkspaceProps)
{
  const [category, setCategory] = useState<CardCategory>('classes');
  const [relationship, setRelationship] = useState(config.relationships[0]?.id ?? '');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [nodeState, setNodeState] = useState<Record<string, NodePresentation>>({});
  const [selectedEdges, setSelectedEdges] = useState<Set<number>>(() => new Set());
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const dragType = `application/x-${config.id}-member`;
  const { graph } = editor;
  const invalidMembers = new Set(editor.issues.flatMap(issue => issue.memberIds));
  const invalidEdges = new Set(editor.issues.flatMap(issue => issue.edgeIndices));
  const emptyDescription = config.relationships.length
    ? 'Add class cards, assign their members, then connect them.'
    : 'Add class cards and assign their members.';

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
      position: config.positions[card.id] ?? { x: 0, y: 0 },
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

  const edges: Edge[] = graph.edges.map((edge, index) =>
  {
    const selected = selectedEdges.has(index);
    return {
      ...createRelationshipEdge(edge, index, config.relationships, config.id, selected, invalidEdges.has(index)),
      reconnectable: selected,
    };
  });

  function changeNodes(changes: NodeChange<ConfiguredClassNode>[])
  {
    const nextNodes = applyNodeChanges(changes, nodes);
    setNodeState(Object.fromEntries(nextNodes.map(node => [node.id, {
      position: node.position,
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
    editor.connect({ source: connectionSource, target: node.id }, relationship);
    setConnectionSource(null);
  }

  function reset()
  {
    editor.reset();
    setNodeState({});
    setDrawing(false);
    endDrag();
  }

  return (
    <section className="configured-lesson pattern-lesson" aria-labelledby={config.intro.headingId} onDragEnd={endDrag}>
      <StoryIntro content={config.intro} />
      <LessonWorkspace
        tray={
          <div className="configured-tray" onDragOver={allowReturn} onDrop={returnMember}>
            <DiagramBuilderPanel
              classes={config.classes}
              members={config.members}
              placedClasses={graph.classes}
              assignments={graph.members}
              hideAssignedMembers
              category={category}
              onCategoryChange={setCategory}
              draggedMemberId={draggedMember}
              hints={config.hints}
              hintIndex={editor.hint}
              onAddClass={editor.addClass}
              onStartDrag={startDrag}
              onEndDrag={endDrag}
              onShowHint={editor.showHint}
              onShowSolution={editor.showSolution}
            />
          </div>
        }
      >
        <BoardToolbar
          placedMembers={Object.keys(graph.members).length}
          totalMembers={config.members.length}
          relationships={graph.edges.length}
          canUndo={editor.canUndo}
          onUndo={editor.undo}
          onReset={reset}
        />
        {editor.worked && <SolutionNotice>Example solution · study how the members and relationships fit together.</SolutionNotice>}
        <ClassDiagramCanvas
          nodes={nodes}
          edges={edges}
          nodeTypes={configuredNodeTypes}
          classKey={graph.classes.join(',')}
          active={active}
          markerNamespace={config.id}
          label={`${config.pattern} class diagram`}
          emptyTitle="Build your class diagram"
          emptyDescription={emptyDescription}
          onNodesChange={changeNodes}
          onEdgesChange={changeEdges}
          onNodesDelete={deleted => editor.removeClasses(deleted.map(node => node.id))}
          onEdgesDelete={deleted => editor.removeEdges(deleted.map(edge => Number(edge.id)))}
          onConnect={connect}
          onReconnect={(edge, connection) => editor.reconnect(Number(edge.id), connection)}
          onNodeClick={clickNode}
          onPaneClick={() => setConnectionSource(null)}
          relationships={config.relationships}
          drawing={drawing}
          relationship={relationship}
          connectionSource={connectionSource}
          classLabel={classLabel}
          onMoveMode={() =>
          {
            setDrawing(false);
            setConnectionSource(null);
          }}
          onSelectRelationship={type =>
          {
            setRelationship(type);
            setDrawing(true);
            setConnectionSource(null);
          }}
        />
        <RelationshipList
          edges={graph.edges}
          relationships={config.relationships}
          classLabel={classLabel}
          invalidEdgeIndices={invalidEdges}
          onRemove={index => editor.removeEdges([index])}
        />
        <ConfiguredLessonStatus editor={editor} />
        {children}
      </LessonWorkspace>
      {config.intro.concept && <ConceptCallout>{config.intro.concept}</ConceptCallout>}
    </section>
  );
}

function ConfiguredLessonStatus({ editor }: { editor: ConfiguredLessonEditor })
{
  return (
    <LessonStatus>
      {editor.message && <p>{editor.message}</p>}
      {editor.ready && <p>Your diagram is complete. All members and relationships are in the correct places.</p>}
      {!editor.ready && (
        <div>
          <p>Complete the diagram:</p>
          <ul>{editor.issues.slice(0, 4).map((issue, index) => <li key={index}>{issue.message}</li>)}</ul>
          {editor.issues.length > 4 && <p>{editor.issues.length - 4} more items to complete.</p>}
        </div>
      )}
    </LessonStatus>
  );
}

