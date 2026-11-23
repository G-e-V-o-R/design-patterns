import { localize, useLanguage } from './language';
import { Panel } from '@xyflow/react';
import { hasHollowRelationshipMarker, relationshipMarkerId, type RelationshipDefinition } from './relationships';

export type RelationshipToolsProps = {
  relationships: readonly RelationshipDefinition[];
  drawing: boolean;
  relationship: string;
  connectionSource: string | null;
  classLabel: (id: string) => string;
  onMoveMode: () => void;
  onSelectRelationship: (type: string) => void;
};

export function RelationshipTools({
  relationships,
  drawing,
  relationship,
  connectionSource,
  classLabel,
  onMoveMode,
  onSelectRelationship,
}: RelationshipToolsProps)
{
  const language = useLanguage();
  let drawingStatus = relationships.length ? localize(language, 'Move cards · choose an arrow to connect', 'Перемещайте карточки или выберите стрелку, чтобы соединить классы') : localize(language, 'Move cards', 'Перемещение карточек');
  if (drawing && connectionSource)
  {
    drawingStatus = localize(language, `From ${classLabel(connectionSource)}: click the second class`, `Первый класс: ${classLabel(connectionSource)}. Нажмите на второй класс`);
  }
  else if (drawing)
  {
    drawingStatus = localize(language, 'Click the first class, then the second class', 'Нажмите на первый класс, затем на второй');
  }

  return (
    <Panel position="bottom-left" className="pattern-arrow-tools nodrag nopan">
      <div role="group" aria-label={localize(language, 'Relationship drawing tools', 'Инструменты для построения связей')}>
        <button type="button" aria-pressed={!drawing} title={localize(language, 'Move cards (Escape)', 'Перемещать карточки (Esc)')} onClick={onMoveMode}>
          ↖ <span>{localize(language, 'Move', 'Перемещение')}</span>
        </button>
        {relationships.map(kind => (
          <button
            key={kind.id}
            type="button"
            aria-label={localize(language, `Draw ${kind.label}`, `Нарисовать связь «${kind.label}»`)}
            title={localize(language, `Draw ${kind.label}`, `Нарисовать связь «${kind.label}»`)}
            aria-pressed={drawing && relationship === kind.id}
            onClick={() => onSelectRelationship(kind.id)}
          >
            <RelationshipIcon appearance={kind.appearance} />
            <span>{kind.toolLabel ?? kind.label}</span>
          </button>
        ))}
      </div>
      <p role="status">{drawingStatus}</p>
    </Panel>
  );
}

export function RelationshipIcon({ appearance }: Pick<RelationshipDefinition, 'appearance'>)
{
  const isImplementation = appearance === 'implementation';
  return (
    <svg width="38" height="18" viewBox="0 0 38 18" aria-hidden="true">
      <path
        d="M2 9 H26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray={isImplementation ? '4 3' : undefined}
      />
      <path
        d="M25 3 L35 9 L25 15 Z"
        fill={hasHollowRelationshipMarker(appearance) ? 'none' : 'currentColor'}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function RelationshipMarkers({
  relationships,
  namespace,
}: {
  relationships: readonly RelationshipDefinition[];
  namespace: string;
})
{
  const markedRelationships = relationships.filter(kind => hasHollowRelationshipMarker(kind.appearance));

  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {markedRelationships.flatMap(kind => [false, true].map(invalid => (
          <marker
            key={`${kind.id}-${invalid}`}
            id={relationshipMarkerId(namespace, kind.id, invalid)}
            viewBox="0 0 12 12"
            refX="11"
            refY="6"
            markerWidth="12"
            markerHeight="12"
            orient="auto"
          >
            <path d="M1,1 L11,6 L1,11 Z" fill="#102019" stroke={invalid ? '#ef9a87' : '#a7bba4'} strokeWidth="1" />
          </marker>
        )))}
      </defs>
    </svg>
  );
}
