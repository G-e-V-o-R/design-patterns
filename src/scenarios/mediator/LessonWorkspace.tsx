import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type NodeChange,
} from '@xyflow/react';
import {
  classCards,
  memberCards,
  relationshipKinds,
  type MediatorGraph,
} from './model';
import { MediatorConcept, MediatorIntro } from './StoryIntro';
import { MediatorDemo } from './RoutingDemo';
import { MediatorDiagram } from './ClassDiagramCanvas';
import { MediatorTray } from './DiagramBuilderPanel';
import {
  getClassArtwork,
  mediatorDragType,
  positions,
} from './lessonContent';
import { useMediatorLesson } from './useLessonEditor';
import type { ClassNode } from './ClassDiagramNode';
import './styles.css';

type MediatorLessonProps = {
  graph: MediatorGraph;
  onChange: (graph: MediatorGraph) => void;
  active?: boolean;
};

export function MediatorLesson({
  graph,
  onChange,
  active = true,
}: MediatorLessonProps)
{
  const {
    message,
    hint,
    worked,
    result,
    ready,
    canUndo,
    edit,
    assign,
    removeClasses,
    connect,
    run,
    showHint,
    showSolution,
    undo,
    resetLesson,
  } = useMediatorLesson(graph, onChange);

  const [tab, setTab] = useState<'classes' | 'members'>('classes');
  const [relationship, setRelationship] = useState('uses');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const portConnectionSource = useRef<string | null>(null);
  const [nodeState, setNodeState] = useState<Record<string, Partial<ClassNode>>>({});
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  function selectRelationship(type: string)
  {
    setRelationship(type);
    setConnectionSource(null);
    setDrawing(true);
  }

  useEffect(() =>
  {
    function cancelRelationshipDrawing(event: KeyboardEvent)
    {
      if (event.key === 'Escape')
      {
        setConnectionSource(null);
        setDrawing(false);
      }
    }

    window.addEventListener('keydown', cancelRelationshipDrawing);
    return () => window.removeEventListener('keydown', cancelRelationshipDrawing);
  }, []);

  useEffect(() =>
  {
    setConnectionSource(null);
  }, [graph]);

  function startDrag(event: DragEvent, id: string)
  {
    event.dataTransfer.setData(mediatorDragType, id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedMember(id);
  }

  function endDrag()
  {
    setDraggedMember(null);
    setDropTarget(null);
  }

  function handleReset()
  {
    resetLesson();
    setNodeState({});
  }

  const nodes: ClassNode[] = classCards
    .filter(card => graph.classes.includes(card.id))
    .map(card => ({
      id: card.id,
      type: 'mediatorClass',
      position: positions[card.id]!,
      ...nodeState[card.id],
      className: connectionSource === card.id ? 'med-connection-source' : '',
      data: {
        ...card,
        members: memberCards.filter(member =>
          graph.members[member.id] === card.id),
        isDropTarget: dropTarget === card.id,
        artwork: getClassArtwork(card.id),
        onRemove: () => removeClasses([card.id]),
        onAssign: id => assign(id, card.id),
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
    const relationshipKind = relationshipKinds.find(kind =>
      kind.id === edge.type);

    return {
      ...edge,
      id: String(index),
      type: 'smoothstep',
      label: relationshipKind?.label,
      markerEnd: edge.type === 'implements'
        ? 'mediator-implements-arrow'
        : {
          type: MarkerType.ArrowClosed,
          color: '#c6bb8e',
        },
      style: {
        stroke: '#a5b99e',
        strokeWidth: 1.6,
        strokeDasharray: edge.type === 'implements' ? '6 4' : undefined,
      },
    };
  });

  function changeNodes(changes: NodeChange<ClassNode>[])
  {
    const updated = applyNodeChanges(changes, nodes);
    setNodeState(Object.fromEntries(updated.map(node => [node.id, node])));
  }

  function handleNodesDelete(deleted: ClassNode[])
  {
    removeClasses(deleted.map(node => node.id));
  }

  function handleEdgesDelete(deleted: Edge[])
  {
    edit({
      ...graph,
      edges: graph.edges.filter((_, index) =>
        !deleted.some(edge => edge.id === String(index))),
    });
  }

  function handleConnect(connection: Connection)
  {
    const startsAtTarget = portConnectionSource.current === connection.target;
    let source = connection.source;
    let target = connection.target;

    if (startsAtTarget)
    {
      source = connection.target;
      target = connection.source;
    }

    connect(source, target, relationship);
    portConnectionSource.current = null;
    setConnectionSource(null);
  }

  function handleConnectStart(nodeId: string | null)
  {
    portConnectionSource.current = nodeId;
  }

  function handleConnectEnd()
  {
    portConnectionSource.current = null;
  }

  function handleNodeClick(event: ReactMouseEvent, node: ClassNode)
  {
    const clickedInteractiveElement = event.target instanceof Element
      && event.target.closest('button, .react-flow__handle');
    if (!drawing || clickedInteractiveElement)
    {
      return;
    }

    if (!connectionSource)
    {
      setConnectionSource(node.id);
      return;
    }

    connect(connectionSource, node.id, relationship);
    setConnectionSource(null);
  }

  function handleMoveMode()
  {
    setDrawing(false);
    setConnectionSource(null);
  }

  return (
    <section
      className="mediator-lesson"
      aria-labelledby="mediator-heading"
      onDragEnd={endDrag}
    >
      <MediatorIntro />

      <div className="med-workspace">
        <MediatorTray
          graph={graph}
          tab={tab}
          onTabChange={setTab}
          draggedMember={draggedMember}
          hint={hint}
          onAddClass={id => edit({ ...graph, classes: [...graph.classes, id] })}
          onAssign={assign}
          onStartDrag={startDrag}
          onDragEnd={endDrag}
          onShowHint={showHint}
          onShowSolution={showSolution}
        />

        <div className="med-board">
          <header className="med-board-heading">
            <div>
              <h2>Your class diagram</h2>
              <p>
                {Object.keys(graph.members).length}/{memberCards.length} members
                {' · '}
                {graph.edges.length} relationships
              </p>
            </div>
            <div className="med-actions">
              <button disabled={!canUndo} onClick={undo}>Undo</button>
              <button onClick={handleReset}>Reset</button>
            </div>
          </header>

          {worked && (
            <p className="med-worked">
              Example solution · follow how each participant uses the mediator.
            </p>
          )}

          <MediatorDiagram
            nodes={nodes}
            edges={edges}
            classKey={graph.classes.join(',')}
            active={active}
            onNodesChange={changeNodes}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={handleEdgesDelete}
            onConnect={handleConnect}
            drawing={drawing}
            relationship={relationship}
            connectionSource={connectionSource}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onNodeClick={handleNodeClick}
            onPaneClick={() => setConnectionSource(null)}
            onSelectRelationship={selectRelationship}
            onMoveMode={handleMoveMode}
          />

          <div className="med-workspace-status" role="status" aria-live="polite">
            {message}
          </div>
          <MediatorDemo ready={ready} result={result} onRun={run} />
        </div>
      </div>

      <MediatorConcept />
    </section>
  );
}
