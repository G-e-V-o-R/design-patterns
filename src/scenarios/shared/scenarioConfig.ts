import type { ClassImage, IntroContent, MemberDefinition, MemberVisibility, PresentedClass } from './lessonTypes.ts';
import type { DiagramRelationship } from './connections.ts';
import type { RelationshipDefinition } from './relationships.ts';

export type ConfigMember = { id: string; label: string; description?: string; visibility?: MemberVisibility };
type ClassPosition = { x: number; y: number };
type SolutionPosition = ClassPosition & { anchorY?: 'center' };

export type ScenarioConfig = {
  id: string;
  title: string;
  pattern: string;
  number?: string;
  intro: {
    category?: string;
    paragraphs: string[];
    image: string;
    imageAlt?: string;
    caption?: string;
    task: string;
    concept?: string;
    steps?: string[];
  };
  classes: {
    id: string;
    label: string;
    kind: 'class' | 'interface';
    description?: string;
    image?: string;
    imageAlt?: string;
    imageFraming?: number;
    imageHeight?: number;
    position?: ClassPosition;
    solutionPosition?: SolutionPosition;
    fields?: ConfigMember[];
    methods?: ConfigMember[];
    relationships?: { type: string; target: string }[];
  }[];
  relationshipTypes?: RelationshipDefinition[];
  hints?: string[];
};

export type CompiledScenario = {
  id: string;
  title: string;
  pattern: string;
  number?: string;
  intro: IntroContent;
  classes: PresentedClass[];
  members: MemberDefinition[];
  memberOwners: Record<string, string>;
  expectedEdges: DiagramRelationship[];
  positions: Record<string, ClassPosition>;
  solutionPositions: Record<string, SolutionPosition>;
  relationships: RelationshipDefinition[];
  hints: string[];
};

const defaultRelationships: readonly RelationshipDefinition[] = [
  { id: 'implements', label: 'implements', appearance: 'implementation' },
  { id: 'uses', label: 'uses', appearance: 'solid' },
];

export function compileScenarioConfig(
  input: unknown,
  sourcePath: string,
  resolveAsset: (relativePath: string) => string,
  resolveSection?: (relativePath: string) => unknown,
): CompiledScenario
{
  const sectionSources: Record<string, string> = {};
  function fail(path: string, message: string): never
  {
    const section = path.split(/[.\[]/)[0]!;
    throw new Error(`${sectionSources[section] ?? sourcePath}: ${path}: ${message}`);
  }

  function record(value: unknown, path: string, keys: string[]): Record<string, unknown>
  {
    if (!value || typeof value !== 'object' || Array.isArray(value))
    {
      return fail(path, 'Expected an object.');
    }
    for (const key of Object.keys(value))
    {
      if (!keys.includes(key))
      {
        fail(`${path}.${key}`, 'Unknown configuration field.');
      }
    }
    return value as Record<string, unknown>;
  }

  function string(value: unknown, path: string): string
  {
    if (typeof value !== 'string' || !value.trim())
    {
      return fail(path, 'Expected a non-empty string.');
    }
    return value.trim();
  }

  function optionalString(value: unknown, path: string): string | undefined
  {
    return value === undefined ? undefined : string(value, path);
  }

  function identifier(value: unknown, path: string): string
  {
    const id = string(value, path);
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)
      || ['constructor', 'prototype', '__proto__'].includes(id))
    {
      fail(path, 'Use an ID beginning with a letter, followed by letters, digits, underscores, or hyphens.');
    }
    return id;
  }

  function array(value: unknown, path: string, optional = false): unknown[]
  {
    if (optional && value === undefined)
    {
      return [];
    }
    if (!Array.isArray(value))
    {
      return fail(path, 'Expected an array.');
    }
    return value;
  }

  function strings(value: unknown, path: string, optional = false): string[]
  {
    return array(value, path, optional).map((item, index) => string(item, `${path}[${index}]`));
  }

  function artwork(value: unknown, alt: unknown, path: string, fallbackAlt: string)
  {
    const imagePath = string(value, `${path}.image`);
    if (!/^(?:\.\/|shared\/)?resource\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_ .-]+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(imagePath)
      || imagePath.split('/').some(part => part === '..'))
    {
      fail(`${path}.image`, 'Use an image path such as ./resource/card.png or shared/resource/portraits/narion.png.');
    }
    let src: string;
    try
    {
      src = resolveAsset(imagePath);
      if (!src)
      {
        throw new Error('Image was not found.');
      }
    }
    catch (error)
    {
      return fail(`${path}.image`, `Cannot resolve "${imagePath}": ${error instanceof Error ? error.message : String(error)}`);
    }
    return { src, alt: optionalString(alt, `${path}.imageAlt`) ?? fallbackAlt };
  }

  function classArtwork(card: Record<string, unknown>, path: string, label: string): ClassImage
  {
    const image = artwork(card.image, card.imageAlt, path, label);
    const framing = card.imageFraming;
    const height = card.imageHeight;
    if (framing !== undefined && (typeof framing !== 'number' || !Number.isFinite(framing) || framing < 0 || framing > 100))
    {
      return fail(`${path}.imageFraming`, 'Use a vertical crop position from 0 to 100.');
    }
    if (height !== undefined && (typeof height !== 'number' || !Number.isFinite(height) || height <= 0))
    {
      return fail(`${path}.imageHeight`, 'Use a positive height in pixels.');
    }
    return { ...image, framing, height };
  }

  const root = { ...record(input, 'scenario', ['id', 'title', 'pattern', 'number', 'intro', 'classes', 'relationshipTypes', 'hints']) };
  for (const section of ['intro', 'classes', 'relationshipTypes', 'hints'])
  {
    const reference = root[section];
    if (typeof reference !== 'string')
    {
      continue;
    }
    if (!/^\.\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.json$/.test(reference)
      || reference === './scenario.json')
    {
      fail(section, 'Use a local JSON section path such as ./intro.json.');
    }
    if (!resolveSection)
    {
      fail(section, `Cannot load "${reference}" without a JSON section resolver.`);
    }
    try
    {
      root[section] = resolveSection(reference);
      if (root[section] === undefined)
      {
        throw new Error('Section file was not found.');
      }
    }
    catch (error)
    {
      fail(section, `Cannot load "${reference}": ${error instanceof Error ? error.message : String(error)}`);
    }
    sectionSources[section] = `${sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1)}${reference.slice(2)}`;
  }
  const id = identifier(root.id, 'id');
  if (!/^[a-z][a-z0-9-]*$/.test(id))
  {
    fail('id', 'Scenario IDs use lowercase letters, digits, and hyphens.');
  }
  const title = string(root.title, 'title');
  const pattern = string(root.pattern, 'pattern');
  const number = optionalString(root.number, 'number');
  if (number !== undefined && !/^\d+$/.test(number))
  {
    fail('number', 'Expected a numeric string such as "04".');
  }
  const intro = record(root.intro, 'intro', ['category', 'paragraphs', 'image', 'imageAlt', 'caption', 'task', 'concept', 'steps']);
  const category = optionalString(intro.category, 'intro.category');
  const paragraphs = strings(intro.paragraphs, 'intro.paragraphs');
  if (paragraphs.length === 0)
  {
    fail('intro.paragraphs', 'Include at least one story paragraph.');
  }
  const steps = intro.steps === undefined ? undefined : strings(intro.steps, 'intro.steps');
  if (steps && steps.length !== 3)
  {
    fail('intro.steps', 'Provide exactly three orientation steps.');
  }
  const relationships = defaultRelationships.map(relationship => ({ ...relationship }));
  const relationshipIds = new Set(relationships.map(relationship => relationship.id));
  array(root.relationshipTypes, 'relationshipTypes', true).forEach((value, index) =>
  {
    const path = `relationshipTypes[${index}]`;
    const relationship = record(value, path, ['id', 'label', 'toolLabel', 'appearance']);
    const relationshipId = identifier(relationship.id, `${path}.id`);
    if (relationshipIds.has(relationshipId))
    {
      fail(`${path}.id`, `Relationship "${relationshipId}" is already defined (implements and uses are built in).`);
    }
    const appearance = relationship.appearance ?? 'solid';
    if (appearance !== 'solid' && appearance !== 'implementation' && appearance !== 'inheritance')
    {
      fail(`${path}.appearance`, 'Expected solid, implementation, or inheritance.');
    }
    relationships.push({
      id: relationshipId,
      label: string(relationship.label, `${path}.label`),
      toolLabel: optionalString(relationship.toolLabel, `${path}.toolLabel`),
      appearance,
    });
    relationshipIds.add(relationshipId);
  });

  const classes: PresentedClass[] = [];
  const members: MemberDefinition[] = [];
  const memberOwners: Record<string, string> = {};
  const positions: Record<string, ClassPosition> = {};
  const solutionPositions: Record<string, SolutionPosition> = {};
  function classPosition({ x, y }: Record<string, unknown>, path: string): ClassPosition
  {
    if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y))
    {
      return fail(path, 'x and y must be finite numbers.');
    }
    return { x, y };
  }

  const pendingEdges: { edge: DiagramRelationship; path: string }[] = [];
  const classIds = new Set<string>();
  const memberIds = new Set<string>();
  const classValues = array(root.classes, 'classes');
  if (classValues.length === 0)
  {
    fail('classes', 'Include at least one class or interface.');
  }
  classValues.forEach((value, index) =>
  {
    const path = `classes[${index}]`;
    const card = record(value, path, ['id', 'label', 'kind', 'description', 'image', 'imageAlt', 'imageFraming', 'imageHeight', 'position', 'solutionPosition', 'fields', 'methods', 'relationships']);
    const classId = identifier(card.id, `${path}.id`);
    if (classIds.has(classId))
    {
      fail(`${path}.id`, `Duplicate class ID "${classId}".`);
    }
    classIds.add(classId);
    const label = string(card.label, `${path}.label`);
    if (card.kind !== 'class' && card.kind !== 'interface')
    {
      fail(`${path}.kind`, 'Expected class or interface.');
    }
    const definition = { id: classId, label, kind: card.kind, description: optionalString(card.description, `${path}.description`) ?? '' };
    if (card.kind === 'class')
    {
      classes.push({ ...definition, variant: 'class', artwork: classArtwork(card, path, label) });
    }
    else
    {
      if (card.image === undefined)
      {
        for (const field of ['imageAlt', 'imageFraming', 'imageHeight'])
        {
          if (card[field] !== undefined)
          {
            fail(`${path}.${field}`, `Provide image alongside ${field}.`);
          }
        }
      }
      classes.push({ ...definition, variant: 'interface', artwork: card.image === undefined ? undefined : classArtwork(card, path, label) });
    }

    const position = card.position === undefined
      ? { x: (index % 3) * 380, y: Math.floor(index / 3) * 780 }
      : classPosition(record(card.position, `${path}.position`, ['x', 'y']), `${path}.position`);
    positions[classId] = position;
    solutionPositions[classId] = position;
    if (card.solutionPosition !== undefined)
    {
      const solutionPath = `${path}.solutionPosition`;
      const solution = record(card.solutionPosition, solutionPath, ['x', 'y', 'anchorY']);
      const coordinates = classPosition(solution, solutionPath);
      if (solution.anchorY !== undefined && solution.anchorY !== 'center')
      {
        fail(`${solutionPath}.anchorY`, 'Expected center.');
      }
      solutionPositions[classId] = solution.anchorY === 'center'
        ? { ...coordinates, anchorY: solution.anchorY }
        : coordinates;
    }

    for (const [property, kind] of [['fields', 'field'], ['methods', 'method']] as const)
    {
      array(card[property], `${path}.${property}`, true).forEach((memberValue, memberIndex) =>
      {
        const memberPath = `${path}.${property}[${memberIndex}]`;
        const member = record(memberValue, memberPath, ['id', 'label', 'description', 'visibility']);
        const memberId = identifier(member.id, `${memberPath}.id`);
        if (memberIds.has(memberId))
        {
          fail(`${memberPath}.id`, `Duplicate member ID "${memberId}". Member IDs must be unique across the lesson.`);
        }
        memberIds.add(memberId);
        const visibility = member.visibility;
        if (visibility !== undefined && visibility !== 'public' && visibility !== 'protected' && visibility !== 'private')
        {
          return fail(`${memberPath}.visibility`, 'Expected public, protected, or private.');
        }
        members.push({
          id: memberId,
          label: string(member.label, `${memberPath}.label`),
          kind,
          description: optionalString(member.description, `${memberPath}.description`),
          ...(visibility && { visibility }),
        });
        memberOwners[memberId] = classId;
      });
    }
    array(card.relationships, `${path}.relationships`, true).forEach((edgeValue, edgeIndex) =>
    {
      const edgePath = `${path}.relationships[${edgeIndex}]`;
      const edge = record(edgeValue, edgePath, ['type', 'target']);
      pendingEdges.push({
        path: edgePath,
        edge: { source: classId, target: identifier(edge.target, `${edgePath}.target`), type: identifier(edge.type, `${edgePath}.type`) },
      });
    });
  });

  const edgeKeys = new Set<string>();
  const usedRelationshipIds = new Set<string>();
  for (const { edge, path } of pendingEdges)
  {
    if (!classIds.has(edge.target))
    {
      fail(`${path}.target`, `Unknown class "${edge.target}".`);
    }
    if (edge.source === edge.target)
    {
      fail(`${path}.target`, 'A relationship must connect two different classes.');
    }
    if (!relationshipIds.has(edge.type))
    {
      fail(`${path}.type`, `Unknown relationship type "${edge.type}". Add it to relationshipTypes.`);
    }
    const key = JSON.stringify([edge.source, edge.type, edge.target]);
    if (edgeKeys.has(key))
    {
      fail(path, 'Duplicate expected relationship.');
    }
    edgeKeys.add(key);
    usedRelationshipIds.add(edge.type);
  }

  return {
    id,
    title,
    pattern,
    number,
    intro: {
      number: number ?? '',
      title,
      pattern,
      ...(category === undefined ? {} : { category }),
      headingId: `${id}-heading`,
      artwork: artwork(intro.image, intro.imageAlt, 'intro', title),
      caption: optionalString(intro.caption, 'intro.caption') ?? title,
      paragraphs,
      task: string(intro.task, 'intro.task'),
      concept: optionalString(intro.concept, 'intro.concept') ?? `Build the classes and relationships that express ${pattern}.`,
      steps: steps ?? ['Add class cards', 'Assign fields & methods', 'Connect & check'],
    },
    classes,
    members,
    memberOwners,
    expectedEdges: pendingEdges.map(({ edge }) => edge),
    positions,
    solutionPositions,
    relationships: relationships.filter(relationship => usedRelationshipIds.has(relationship.id)),
    hints: strings(root.hints, 'hints', true),
  };
}
