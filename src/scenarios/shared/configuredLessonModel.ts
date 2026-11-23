import { createDiagramRelationship, facingConnectionHandles, type DiagramRelationship } from './connections';
import { localize, type Language } from './language';
import type { CompiledScenario } from './scenarioConfig';

export type LessonGraph = {
  classes: string[];
  members: Record<string, string>;
  edges: DiagramRelationship[];
};

export type LessonIssue = {
  message: string;
  classIds: string[];
  memberIds: string[];
  edgeIndices: number[];
};

export function emptyConfiguredLesson(): LessonGraph
{
  return { classes: [], members: {}, edges: [] };
}

export function solutionConfiguredLesson(scenario: CompiledScenario): LessonGraph
{
  return {
    classes: scenario.classes.map(card => card.id),
    members: { ...scenario.memberOwners },
    edges: scenario.expectedEdges.map(edge =>
    {
      const handles = facingConnectionHandles(scenario.solutionPositions[edge.source]!, scenario.solutionPositions[edge.target]!);
      return createDiagramRelationship({ ...edge, ...handles }, edge.type);
    }),
  };
}

function edgeKey(edge: DiagramRelationship)
{
  return JSON.stringify([edge.source, edge.type, edge.target]);
}

export function getConfiguredLessonIssues(scenario: CompiledScenario, graph: LessonGraph, language: Language = 'en'): LessonIssue[]
{
  const issues: LessonIssue[] = [];
  const knownClasses = new Set(scenario.classes.map(card => card.id));
  const placedClasses = new Set(graph.classes);
  const knownMembers = new Set(scenario.members.map(member => member.id));
  const expectedEdges = new Set(scenario.expectedEdges.map(edgeKey));
  const actualEdges = new Set(graph.edges.map(edgeKey));
  const classLabel = (id: string) => scenario.classes.find(card => card.id === id)?.label ?? id;
  const relationshipLabel = (id: string) => scenario.relationships.find(relationship => relationship.id === id)?.label ?? id;

  function issue(message: string, classIds: string[] = [], memberIds: string[] = [], edgeIndices: number[] = [])
  {
    issues.push({ message, classIds: [...new Set(classIds)], memberIds, edgeIndices });
  }

  for (const card of scenario.classes)
  {
    if (!placedClasses.has(card.id))
    {
      issue(localize(language, `Add ${card.label} to the diagram.`, `Добавьте ${card.label} на диаграмму.`), [card.id]);
    }
  }
  const seenClasses = new Set<string>();
  for (const id of graph.classes)
  {
    if (!knownClasses.has(id))
    {
      issue(localize(language, `Remove unknown class ${id}.`, `Удалите неизвестный класс ${id}.`), [id]);
    }
    if (seenClasses.has(id))
    {
      issue(localize(language, `Remove the duplicate ${classLabel(id)} class.`, `Удалите дубликат класса ${classLabel(id)}.`), [id]);
    }
    seenClasses.add(id);
  }

  for (const member of scenario.members)
  {
    const expectedOwner = scenario.memberOwners[member.id]!;
    const owner = graph.members[member.id];
    if (!owner)
    {
      issue(localize(language, `Assign ${member.label} to ${classLabel(expectedOwner)}.`,
        `Добавьте ${member.label} в ${classLabel(expectedOwner)}.`), [expectedOwner], [member.id]);
    }
    else if (owner !== expectedOwner)
    {
      issue(localize(language, `Move ${member.label} from ${classLabel(owner)} to ${classLabel(expectedOwner)}.`,
        `Перенесите ${member.label} из ${classLabel(owner)} в ${classLabel(expectedOwner)}.`), [owner, expectedOwner], [member.id]);
    }
    else if (!placedClasses.has(owner))
    {
      issue(localize(language, `Add ${classLabel(owner)} before assigning ${member.label}.`,
        `Добавьте ${classLabel(owner)} на диаграмму, прежде чем назначать ${member.label}.`), [owner], [member.id]);
    }
  }
  for (const [memberId, owner] of Object.entries(graph.members))
  {
    if (!knownMembers.has(memberId))
    {
      issue(localize(language, `Remove unknown member ${memberId}.`, `Удалите неизвестное поле или метод ${memberId}.`), [owner], [memberId]);
    }
  }

  const firstEdgeIndices = new Map<string, number>();
  graph.edges.forEach((edge, index) =>
  {
    const endpoints = [edge.source, edge.target];
    const key = edgeKey(edge);
    const duplicateIndex = firstEdgeIndices.get(key);
    if (duplicateIndex !== undefined)
    {
      issue(localize(language, 'Remove the duplicate relationship.', 'Удалите дубликат связи.'), endpoints, [], [duplicateIndex, index]);
    }
    else
    {
      firstEdgeIndices.set(key, index);
    }
    if (edge.source === edge.target)
    {
      issue(localize(language, 'An arrow must connect two different classes.', 'Стрелка должна соединять два разных класса.'), endpoints, [], [index]);
    }
    else if (endpoints.some(id => !knownClasses.has(id) || !placedClasses.has(id)))
    {
      issue(localize(language, 'Both arrow endpoints must be classes in the diagram.', 'Оба класса, соединённые стрелкой, должны быть на диаграмме.'), endpoints, [], [index]);
    }
    else if (!expectedEdges.has(key))
    {
      const reversed = edgeKey({ ...edge, source: edge.target, target: edge.source });
      if (expectedEdges.has(reversed))
      {
        issue(localize(language, `Reverse the ${edge.type} arrow: ${classLabel(edge.target)} → ${classLabel(edge.source)}.`,
          `Разверните стрелку «${relationshipLabel(edge.type)}»: ${classLabel(edge.target)} → ${classLabel(edge.source)}.`), endpoints, [], [index]);
      }
      else
      {
        issue(localize(language, `Remove the unexpected ${edge.type} arrow from ${classLabel(edge.source)} to ${classLabel(edge.target)}.`,
          `Удалите лишнюю стрелку «${relationshipLabel(edge.type)}» от ${classLabel(edge.source)} к ${classLabel(edge.target)}.`), endpoints, [], [index]);
      }
    }
  });
  for (const edge of scenario.expectedEdges)
  {
    if (!actualEdges.has(edgeKey(edge)))
    {
      issue(localize(language, `Connect ${classLabel(edge.source)} → ${edge.type} → ${classLabel(edge.target)}.`,
        `Соедините классы: ${classLabel(edge.source)} → ${relationshipLabel(edge.type)} → ${classLabel(edge.target)}.`), [edge.source, edge.target]);
    }
  }
  return issues;
}
