import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  MarkerType,
  type Connection,
  type Edge,
  type NodeChange,
} from '@xyflow/react';
import {
  classCards,
  memberCards,
  relationshipKinds,
  type ChainGraph,
} from './model';
import { ChainConcept, ChainIntro } from './StoryIntro';
import { ChainDemo } from './ChainDemo';
import { ChainDiagram } from './ClassDiagramCanvas';
import { ChainTray } from './DiagramBuilderPanel';
import { chainDragType, compactPositions, positions } from './lessonContent';
import { useChainLesson } from './useLessonEditor';
import type { ClassNode } from './ClassDiagramNode';
import './styles.css';

type ChainLessonProps = {
  graph: ChainGraph;
  onChange: (graph: ChainGraph) => void;
  active?: boolean;
};

type NodeLayout = {
  id: 'compact' | 'wide';
  positions: Record<string, ClassNode['position']>;
};

export function ChainLesson({
  graph,
  onChange,
  active = true,
}: ChainLessonProps)
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
  } = useChainLesson(graph, onChange);

  const [tab, setTab] = useState<'classes' | 'members'>('classes');
  const [compactLayout, setCompactLayout] = useState(
    () => window.matchMedia('(max-width: 520px)').matches,
  );
  const compactLayoutRef = useRef(compactLayout);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [relationship, setRelationship] = useState('next');
  const [drawing, setDrawing] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const portConnectionSource = useRef<string | null>(null);
  const [nodeLayout, setNodeLayout] = useState<NodeLayout>(() => ({
    id: compactLayout ? 'compact' : 'wide',
    positions: {},
  }));
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() =>
  {
    const workspace = workspaceRef.current;
    if (!workspace)
    {
      return;
    }

    const breakpoint = window.matchMedia('(max-width: 520px)');
    function updateLayout()
    {
      const isCompact = breakpoint.matches;
      if (isCompact === compactLayoutRef.current)
      {
        return;
      }

      compactLayoutRef.current = isCompact;
      setCompactLayout(isCompact);
      setNodeLayout({ id: isCompact ? 'compact' : 'wide', positions: {} });
    }

    const observer = new ResizeObserver(updateLayout);
    observer.observe(workspace);
    breakpoint.addEventListener('change', updateLayout);
    return () =>
    {
      observer.disconnect();
      breakpoint.removeEventListener('change', updateLayout);
    };
  }, []);

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
    event.dataTransfer.setData(chainDragType, id);
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
    setNodeLayout({
      id: compactLayout ? 'compact' : 'wide',
      positions: {},
    });
  }

  const layoutId = compactLayout ? 'compact' : 'wide';
  const layoutPositions = compactLayout ? compactPositions : positions;
  const nodes: ClassNode[] = classCards
    .filter(card => graph.classes.includes(card.id))
    .map(card => ({
      id: card.id,
      type: 'chainClass',
      position: (nodeLayout.id === layoutId ? nodeLayout.positions[card.id] : undefined)
        ?? layoutPositions[card.id]!,
      className: connectionSource === card.id ? 'chain-connection-source' : '',
      data: {
        ...card,
        members: memberCards.filter(member => graph.members[member.id] === card.id),
        isDropTarget: dropTarget === card.id,
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
    const relationshipKind = relationshipKinds.find(kind => kind.id === edge.type);

    return {
      ...edge,
      id: String(index),
      type: 'smoothstep',
      label: relationshipKind?.label,
      markerEnd: MarkerType.ArrowClosed,
      style: {
        stroke: '#a5b99e',
        strokeWidth: 1.6,
      },
    };
  });

  function changeNodes(changes: NodeChange<ClassNode>[])
  {
    if (!changes.some(change => change.type === 'position' && change.dragging !== undefined))
    {
      return;
    }

    setNodeLayout(previousLayout =>
    {
      const nextPositions = previousLayout.id === layoutId
        ? { ...previousLayout.positions }
        : {};

      for (const change of changes)
      {
        if (change.type === 'position' && change.position && change.dragging !== undefined)
        {
          nextPositions[change.id] = change.position;
        }
      }

      return { id: layoutId, positions: nextPositions };
    });
  }

  function handleNodesDelete(deleted: ClassNode[])
  {
    removeClasses(deleted.map(node => node.id));
  }

  function handleEdgesDelete(deleted: Edge[])
  {
    edit({
      ...graph,
      edges: graph.edges.filter((_, index) => !deleted.some(edge => edge.id === String(index))),
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

  function handleNodeClick(event: ReactMouseEvent, node: ClassNode)
  {
    if (!drawing)
    {
      return;
    }

    if (!connectionSource)
    {
      setConnectionSource(node.id);
      return;
    }

    if (connectionSource !== node.id)
    {
      connect(connectionSource, node.id, relationship);
    }

    setConnectionSource(null);
    setDrawing(false);
  }

  return (
    <div className="chain-workspace" ref={workspaceRef}>
      <ChainIntro />

      <div className="chain-layout">
        <ChainTray
          graph={graph}
          tab={tab}
          onTabChange={setTab}
          draggedMember={draggedMember}
          hint={hint}
          onAddClass={id =>
          {
            if (!graph.classes.includes(id))
            {
              edit({ ...graph, classes: [...graph.classes, id] });
            }
          }}
          onAssign={assign}
          onStartDrag={startDrag}
          onDragEnd={endDrag}
          onShowHint={showHint}
          onShowSolution={showSolution}
        />

        <div className="chain-diagram-column">
          <ChainDiagram
            nodes={nodes}
            edges={edges}
            classKey={`${graph.classes.join('-')}-${compactLayout ? 'compact' : 'wide'}`}
            compactLayout={compactLayout}
            active={active}
            drawing={drawing}
            relationship={relationship}
            connectionSource={connectionSource}
            onNodesChange={changeNodes}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={handleEdgesDelete}
            onConnect={handleConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={() => setConnectionSource(null)}
            onNodeClick={handleNodeClick}
            onPaneClick={() =>
            {
              setConnectionSource(null);
              setDrawing(false);
            }}
            onSelectRelationship={type => selectRelationship(type)}
            onMoveMode={() =>
            {
              setDrawing(false);
              setConnectionSource(null);
            }}
          />

          <div className="chain-actions">
            <div className="chain-status" aria-live="polite">
              {message || (ready ? 'Diagram ready.' : 'Build the handler chain to continue.')}
            </div>

            <div className="chain-buttons">
              <button onClick={() => run('blood')} disabled={!ready}>Test blood</button>
              <button onClick={() => run('step')} disabled={!ready}>Test step</button>
              <button onClick={() => run('iron')} disabled={!ready}>Test iron</button>
              <button onClick={() => run('safe')} disabled={!ready}>No-op</button>
              <button onClick={undo} disabled={!canUndo}>Undo</button>
              <button onClick={handleReset}>Reset</button>
            </div>

            {result && (
              <div className="chain-demo-panel">
                <ChainDemo ready={ready} result={result} onRun={run} />
              </div>
            )}

            <div className="chain-feedback">
              {worked && 'Worked example loaded.'}
            </div>
          </div>
        </div>
      </div>

      <ChainConcept />
    </div>
  );
}
