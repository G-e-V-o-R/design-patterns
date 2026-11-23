import { defaultOrientationSteps, type CompiledScenario } from './scenarioConfig.ts';
import type { PresentedClass } from './lessonTypes.ts';

const defaultRussianSteps = ['Добавьте карточки классов', 'Распределите поля и методы', 'Соедините классы на диаграмме'];
const builtinRelationships: Record<string, string> = { implements: 'реализует', uses: 'использует' };

export function localizeScenario(config: CompiledScenario, input: unknown, path: string): CompiledScenario
{
  function fail(field: string, description: string): never
  {
    throw new Error(`${path}: ${field}: ${description}`);
  }

  function record(value: unknown, field: string, keys: readonly string[]): Record<string, unknown>
  {
    if (!value || typeof value !== 'object' || Array.isArray(value))
    {
      return fail(field, 'Expected an object.');
    }
    for (const key of Object.keys(value))
    {
      if (!keys.includes(key))
      {
        fail(`${field}.${key}`, 'Unknown translation field.');
      }
    }
    return value as Record<string, unknown>;
  }

  function string(value: unknown, field: string): string
  {
    if (typeof value !== 'string' || !value.trim())
    {
      return fail(field, 'Expected a non-empty translation.');
    }
    return value.trim();
  }

  function optional(value: unknown, field: string, required = false): string | undefined
  {
    if (value === undefined && !required)
    {
      return undefined;
    }
    return string(value, field);
  }

  function strings(value: unknown, field: string, length: number): string[]
  {
    if (!Array.isArray(value) || value.length !== length)
    {
      return fail(field, `Expected ${length} translated entries.`);
    }
    return value.map((item, index) => string(item, `${field}[${index}]`));
  }

  const translation = record(input, 'scenario', ['title', 'pattern', 'intro', 'classes', 'members', 'relationships']);
  const title = string(translation.title, 'title');
  const pattern = string(translation.pattern, 'pattern');
  const intro = record(translation.intro, 'intro', ['category', 'caption', 'imageAlt', 'paragraphs', 'task', 'steps']);
  const classes = record(translation.classes, 'classes', config.classes.map(card => card.id));
  const members = record(translation.members, 'members', config.members.map(member => member.id));
  const customRelationships = config.relationships.filter(relationship => !Object.hasOwn(builtinRelationships, relationship.id));
  const relationships = record(translation.relationships ?? {}, 'relationships', customRelationships.map(relationship => relationship.id));
  const hasCustomSteps = config.intro.steps !== undefined && config.intro.steps !== defaultOrientationSteps;

  return {
    ...config,
    title,
    pattern,
    intro: {
      ...config.intro,
      title,
      pattern,
      category: optional(intro.category, 'intro.category', Boolean(config.intro.category)),
      caption: optional(intro.caption, 'intro.caption', config.intro.caption !== config.title) ?? title,
      artwork: {
        ...config.intro.artwork,
        alt: optional(intro.imageAlt, 'intro.imageAlt', config.intro.artwork.alt !== config.title) ?? title,
      },
      paragraphs: strings(intro.paragraphs, 'intro.paragraphs', config.intro.paragraphs.length),
      task: string(intro.task, 'intro.task'),
      steps: intro.steps !== undefined || hasCustomSteps
        ? strings(intro.steps, 'intro.steps', config.intro.steps?.length ?? 0)
        : defaultRussianSteps,
    },
    classes: config.classes.map((card): PresentedClass =>
    {
      const field = `classes.${card.id}`;
      const entry = record(classes[card.id] ?? {}, field, ['label', 'description', 'imageAlt']);
      const label = optional(entry.label, `${field}.label`) ?? card.label;
      const description = optional(entry.description, `${field}.description`, Boolean(card.description)) ?? '';
      if (!card.artwork)
      {
        if (entry.imageAlt !== undefined)
        {
          fail(`${field}.imageAlt`, 'This card has no artwork.');
        }
        return { ...card, label, description };
      }
      const alt = optional(entry.imageAlt, `${field}.imageAlt`, card.artwork.alt !== card.label) ?? label;
      return { ...card, label, description, artwork: { ...card.artwork, alt } };
    }),
    members: config.members.map(member =>
    {
      const field = `members.${member.id}`;
      const entry = record(members[member.id] ?? {}, field, ['label', 'description']);
      return {
        ...member,
        label: optional(entry.label, `${field}.label`) ?? member.label,
        description: optional(entry.description, `${field}.description`, Boolean(member.description)),
      };
    }),
    relationships: config.relationships.map(relationship =>
    {
      if (Object.hasOwn(builtinRelationships, relationship.id))
      {
        return { ...relationship, label: builtinRelationships[relationship.id]! };
      }
      const field = `relationships.${relationship.id}`;
      const entry = record(relationships[relationship.id], field, ['label', 'toolLabel']);
      return {
        ...relationship,
        label: string(entry.label, `${field}.label`),
        toolLabel: optional(entry.toolLabel, `${field}.toolLabel`, Boolean(relationship.toolLabel)),
      };
    }),
  };
}
