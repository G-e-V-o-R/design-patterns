import { localize, useLanguage } from '../../shared/language';
import wakeBefore from '../resource/wake-before.webp?url';
import wakeAfter from '../resource/wake-after.webp?url';
import trapsBefore from '../resource/traps-before.webp?url';
import trapsAfter from '../resource/traps-after.webp?url';
import campMap from '../resource/flank-map.webp?url';
import narionPortrait from '../../shared/resource/portraits/narion.png?url';
import type { OrderId, OrderStatus } from './demoModel';

const receiverScenes = {
  wake: { before: wakeBefore, after: wakeAfter },
  traps: { before: trapsBefore, after: trapsAfter },
};

function FlankMap({ status }: { status: OrderStatus | undefined })
{
  const language = useLanguage();
  const rightPost = status === 'executed';
  const feintRevealed = rightPost || status === 'undone';

  return (
    <div className="command-flank-map" data-right-post={rightPost} data-feint-revealed={feintRevealed} aria-hidden="true">
      <img className="command-camp-art" src={campMap} alt="" draggable={false} />
      <span className="command-flank-threat command-flank-threat-right">{localize(language, 'Orc advance', 'Наступление орков')}</span>
      <span className="command-flank-threat command-flank-threat-left">{localize(language, 'Real attack', 'Основная атака')}</span>
      <span className="command-flank-label command-flank-label-left">{localize(language, 'Left flank', 'Левый фланг')}</span>
      <span className="command-flank-label command-flank-label-right">{localize(language, 'Right flank', 'Правый фланг')}</span>
      <span className="command-narion-marker">
        <img src={narionPortrait} alt="" draggable={false} />
      </span>
    </div>
  );
}

export function ReceiverEffect({ id, status }: { id: OrderId; status: OrderStatus | undefined })
{
  if (id === 'flank')
  {
    return <FlankMap status={status} />;
  }

  const { before, after } = receiverScenes[id];

  return (
    <div className="command-effect" data-completed={status === 'executed'} aria-hidden="true">
      <img src={before} alt="" draggable={false} />
      <img className="command-effect-after" src={after} alt="" draggable={false} />
    </div>
  );
}
