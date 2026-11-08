import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import {
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import {
  classCards,
  getLessonIssues,
  memberCards,
  normalizeConnectionHandle,
  removeLessonEdgesAtIndices,
  relationshipKinds,
  type LessonGraph,
} from './model';
import { ObserverActions } from './DiagramActions';
import { ObserverConcept, ObserverIntro } from './StoryIntro';
import { ObserverDemo } from './NotificationDemo';
import { ObserverDiagram } from './ClassDiagramCanvas';
import { ObserverRelations } from './RelationshipList';
import { ObserverDiagramBuilderPanel } from './DiagramBuilderPanel';
import { classArtwork, methodDragType, positions } from './lessonContent';
import { useObserverLesson } from './useLessonEditor';
import type { ObserverClassNode } from './ClassDiagramNode';
import './styles.css';

type CardCategory = 'classes' | 'fields' | 'methods';

export function ObserverLesson({
  graph,
  onChange,
  active = true,
}: {
  graph: LessonGraph;
  onChange: (graph: LessonGraph) => void;
  active?: boolean;
})
{
  const {
    issues,
    message,
    hint,
    worked,
    narionSubscribed,
    demoRun,
    demoReady,
    issueClassIds,
    issueMemberIds,
    misplacedMemberIds,
    issueEdgeIndices,
    canUndo,
    edit,
    assignMethod,
    removeClasses,
    connect,
    check,
    startDemo,
    toggleBracelet,
    showHint,
    showSolution,
    undo,
    resetLesson,
  } = useObserverLesson(graph, onChange);

  const [dropTargetClassId, setDropTargetClassId] = useState<string | null>(null);
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('classes');
  const [relationshipType, setRelationshipType] = useState('stores');
  const [isDrawingRelationship, setIsDrawingRelationship] = useState(false);
  const [connectionSourceClassId, setConnectionSourceClassId] = useState<string | null>(null);
  const portConnectionSourceClassId = useRef<string | null>(null);
  const [nodeState, setNodeState] = useState<Record<string, Partial<ObserverClassNode>>>({});
  const [selectedEdgeIndices, setSelectedEdgeIndices] = useState<Set<number>>(
    () => new Set(),
  );
  const demoContainer = useRef<HTMLDivElement>(null);

  function selectRelationship(type: string)
  {
    setRelationshipType(type);
    setConnectionSourceClassId(null);
    setIsDrawingRelationship(true);
  }

  useEffect(() =>
  {
    function cancelRelationshipDrawing(event: KeyboardEvent)
    {
      if (event.key === 'Escape')
      {
        setConnectionSourceClassId(null);
        setIsDrawingRelationship(false);
      }
    }

    window.addEventListener('keydown', cancelRelationshipDrawing);
    return () => window.removeEventListener('keydown', cancelRelationshipDrawing);
  }, []);

  useEffect(() =>
  {
    setConnectionSourceClassId(null);
    setSelectedEdgeIndices(new Set());
  }, [graph]);

  function endMemberDrag()
  {
    setDropTargetClassId(null);
    setDraggedMemberId(null);
  }

  function startMemberDrag(event: DragEvent, memberId: string)
  {
    event.stopPropagation();
    event.dataTransfer.setData(methodDragType, memberId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedMemberId(memberId);
  }

  function isEmptyCanvasDrop(event: DragEvent)
  {
    return event.dataTransfer.types.includes(methodDragType)
      && event.target instanceof Element
      && event.target.matches('.react-flow__pane');
  }

  // Узлы собираются из модели и локального состояния холста; пользовательские
  // действия передаются узлу как callbacks, чтобы изменения оставались здесь.
  const nodes: ObserverClassNode[] = classCards
    .filter(classCard => graph.classes.includes(classCard.id))
    .map(classCard =>
    {
      let nodeClassName = '';
      if (connectionSourceClassId === classCard.id)
      {
        nodeClassName = 'lesson-connection-source';
      }

      return {
        id: classCard.id,
        type: 'lessonClass',
        position: positions[classCard.id]!,
        ...nodeState[classCard.id],
        className: nodeClassName,
        data: {
          ...classCard,
          classHasValidationIssue: issueClassIds.has(classCard.id),
          memberIdsWithIssues: issueMemberIds,
          misplacedMemberIds,
          draggedMemberId,
          onStartMemberDrag: startMemberDrag,
          onEndMemberDrag: endMemberDrag,
          isMemberDropTarget: dropTargetClassId === classCard.id,
          onMemberDragHover: isHovering =>
          {
            setDropTargetClassId(currentTargetClassId =>
            {
              if (isHovering)
              {
                return classCard.id;
              }

              if (currentTargetClassId === classCard.id)
              {
                return null;
              }

              return currentTargetClassId;
            });
          },
          onDropMember: memberId => assignMethod(memberId, classCard.id),
          artwork: classArtwork[classCard.id],
          members: memberCards.filter(memberCard =>
            graph.members[memberCard.id] === classCard.id),
          onRemoveClass: () => removeClasses([classCard.id]),
        },
      };
    });

  const currentEdgeIssueIndices = new Set(
    getLessonIssues(graph).flatMap(issue => issue.edgeIndices),
  );
  const edges: Edge[] = graph.edges.map((lessonEdge, edgeIndex) =>
  {
    const sourceHandle = normalizeConnectionHandle(lessonEdge.sourceHandle) ?? 'bottom';
    const targetHandle = normalizeConnectionHandle(lessonEdge.targetHandle) ?? 'top';
    const hasValidationIssue = issueEdgeIndices.has(edgeIndex)
      || currentEdgeIssueIndices.has(edgeIndex);
    const isSelected = selectedEdgeIndices.has(edgeIndex);
    let edgeLabel: string | undefined;
    let markerEnd: Edge['markerEnd'] = {
      type: MarkerType.ArrowClosed,
      color: '#b6c9b1',
    };
    let strokeColor = '#a7bba4';
    let strokeWidth = isSelected ? 4 : 1.6;
    let strokeDasharray: string | undefined;

    if (lessonEdge.type === 'implements')
    {
      markerEnd = 'lesson-implements-arrow';
      strokeDasharray = '6 4';
    }

    const matchingRelationship = relationshipKinds.find(kind =>
      kind.id === lessonEdge.type);
    if (matchingRelationship)
    {
      edgeLabel = matchingRelationship.label;
    }
    else
    {
      edgeLabel = lessonEdge.type
        ? `Unknown relationship: ${lessonEdge.type}`
        : 'Unknown relationship type';
    }

    if (hasValidationIssue)
    {
      strokeColor = '#ff6b5c';
      strokeWidth = isSelected ? 4.5 : 3;
      if (lessonEdge.type === 'implements')
      {
        markerEnd = 'lesson-implements-arrow-error';
      }
      else
      {
        markerEnd = {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        };
      }
    }

    let edgeClassName = '';
    if (hasValidationIssue)
    {
      edgeClassName = 'lesson-edge-error';
    }

    return {
      ...lessonEdge,
      sourceHandle,
      targetHandle,
      id: String(edgeIndex),
      selected: isSelected,
      type: 'smoothstep',
      className: edgeClassName,
      label: edgeLabel,
      markerEnd,
      style: {
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray,
      },
    };
  });

  function changeNodes(changes: NodeChange<ObserverClassNode>[])
  {
    const changedNodes = applyNodeChanges(changes, nodes);
    setNodeState(Object.fromEntries(changedNodes.map(node => [node.id, node])));
  }

  function changeEdges(changes: EdgeChange<Edge>[])
  {
    const selectionChanges = changes.filter(change => change.type === 'select');
    if (selectionChanges.length === 0)
    {
      return;
    }

    setSelectedEdgeIndices(current =>
    {
      const next = new Set(current);
      for (const change of selectionChanges)
      {
        const edgeIndex = Number(change.id);
        if (!Number.isInteger(edgeIndex) || String(edgeIndex) !== change.id)
        {
          continue;
        }

        if (change.selected)
        {
          next.add(edgeIndex);
        }
        else
        {
          next.delete(edgeIndex);
        }
      }

      return next;
    });
  }

  function handleNodesDelete(deletedNodes: ObserverClassNode[])
  {
    removeClasses(deletedNodes.map(node => node.id));
  }

  function handleEdgesDelete(deletedEdges: Edge[])
  {
    const edgeIndices = deletedEdges.flatMap(edge =>
    {
      const edgeIndex = Number(edge.id);
      if (Number.isInteger(edgeIndex) && String(edgeIndex) === edge.id)
      {
        return [edgeIndex];
      }

      return [];
    });
    edit(removeLessonEdgesAtIndices(graph, edgeIndices));
  }

  function handleConnect(connection: Connection)
  {
    // React Flow сохраняет source/target по типу handle, а не по направлению drag.
    const startsAtTarget = portConnectionSourceClassId.current === connection.target;
    let sourceClassId = connection.source;
    let targetClassId = connection.target;
    let sourceHandle = connection.sourceHandle;
    let targetHandle = connection.targetHandle;

    if (startsAtTarget)
    {
      sourceClassId = connection.target;
      targetClassId = connection.source;
      sourceHandle = connection.targetHandle;
      targetHandle = connection.sourceHandle;
    }

    connect(
      sourceClassId,
      targetClassId,
      relationshipType,
      sourceHandle,
      targetHandle,
    );
    portConnectionSourceClassId.current = null;
    setConnectionSourceClassId(null);
  }

  function handleConnectStart(nodeId: string | null)
  {
    portConnectionSourceClassId.current = nodeId;
  }

  function handleConnectEnd()
  {
    portConnectionSourceClassId.current = null;
  }

  function handleNodeClick(event: MouseEvent, node: ObserverClassNode)
  {
    const clickedInteractiveElement = event.target instanceof Element
      && event.target.closest('button, .lesson-assigned-method, .react-flow__handle');
    if (!isDrawingRelationship || clickedInteractiveElement)
    {
      return;
    }

    if (!connectionSourceClassId)
    {
      setConnectionSourceClassId(node.id);
      return;
    }

    connect(connectionSourceClassId, node.id, relationshipType);
    setConnectionSourceClassId(null);
  }

  function handleCheck(runDemo = false)
  {
    const diagramIsReady = check(runDemo);
    if (runDemo && diagramIsReady)
    {
      demoContainer.current?.scrollIntoView({ block: 'nearest' });
    }
  }

  function handleReset()
  {
    resetLesson();
    setNodeState({});
  }

  function removeEdge(edgeIndexToRemove: number)
  {
    edit(removeLessonEdgesAtIndices(graph, [edgeIndexToRemove]));
  }

  function handleCanvasDragOver(event: DragEvent<HTMLDivElement>)
  {
    if (!isEmptyCanvasDrop(event))
    {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTargetClassId(null);
  }

  function handleCanvasDrop(event: DragEvent<HTMLDivElement>)
  {
    if (!isEmptyCanvasDrop(event))
    {
      return;
    }

    event.preventDefault();
    assignMethod(event.dataTransfer.getData(methodDragType), '');
    endMemberDrag();
  }

  function handleMoveMode()
  {
    setIsDrawingRelationship(false);
    setConnectionSourceClassId(null);
  }

  function addClassToDiagram(classId: string)
  {
    edit({ ...graph, classes: [...graph.classes, classId] });
  }

  let visibleDemoRun: typeof demoRun = null;
  if (demoRun?.graph === graph)
  {
    visibleDemoRun = demoRun;
  }

  // Эти дочерние представления получают состояние и обработчики от урока;
  // владелец графа и последовательности изменений остаётся в родителе.
  return (
    <section className="observer-lesson" onDragEnd={endMemberDrag}>
      <ObserverIntro />

      <div className="lesson-workspace">
        <ObserverDiagramBuilderPanel
          lessonGraph={graph}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          draggedMemberId={draggedMemberId}
          classIdsWithIssues={issueClassIds}
          memberIdsWithIssues={issueMemberIds}
          hintIndex={hint}
          onAddClassToDiagram={addClassToDiagram}
          onStartMemberDrag={startMemberDrag}
          onShowNextHint={showHint}
          onLoadSolution={showSolution}
        />

        <div className="lesson-board">
          <LessonBoardToolbar
            graph={graph}
            canUndo={canUndo}
            onUndo={undo}
            onReset={handleReset}
          />
          {worked && (
            <div className="lesson-worked">
              Example solution · see what each class does.
            </div>
          )}

          <ObserverDiagram
            nodes={nodes}
            edges={edges}
            classKey={graph.classes.join(',')}
            active={active}
            drawing={isDrawingRelationship}
            relationship={relationshipType}
            connectionSource={connectionSourceClassId}
            onNodesChange={changeNodes}
            onEdgesChange={changeEdges}
            onNodesDelete={handleNodesDelete}
            onEdgesDelete={handleEdgesDelete}
            onConnect={handleConnect}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onNodeClick={handleNodeClick}
            onPaneClick={() => setConnectionSourceClassId(null)}
            onSelectRelationship={selectRelationship}
            onMoveMode={handleMoveMode}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          />

          <ObserverRelations
            edges={graph.edges}
            issueEdgeIndices={issueEdgeIndices}
            onRemoveEdge={removeEdge}
          />

          <ObserverActions
            onCheck={() => handleCheck()}
            onRun={() => handleCheck(true)}
            message={message}
            issues={issues}
            worked={worked}
          />

          <div ref={demoContainer}>
            <ObserverDemo
              ready={demoReady}
              narionSubscribed={narionSubscribed}
              onToggleBracelet={toggleBracelet}
              onRun={startDemo}
              run={visibleDemoRun}
            />
          </div>
        </div>
      </div>

      <ObserverConcept />
    </section>
  );
}

function LessonBoardToolbar({
  graph,
  canUndo,
  onUndo,
  onReset,
}: {
  graph: LessonGraph;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
})
{
  const placedMemberCount = Object.keys(graph.members).length;
  return (
    <div className="lesson-board-toolbar">
      <div>
        <h2>Your class diagram</h2>
        <p>
          {placedMemberCount}/{memberCards.length} member cards placed ·{' '}
          {graph.edges.length} relationships
        </p>
      </div>
      <div>
        <button disabled={!canUndo} onClick={onUndo}>Undo</button>
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}
