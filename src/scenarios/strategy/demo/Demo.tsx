import { useState } from 'react';
import type { ConfiguredDemoProps } from '../../shared/ConfiguredScenario';
import { localize, useLanguage } from '../../shared/language';
import bearMask from '../resource/bear-mask.png';
import owlMask from '../resource/owl-mask.png';
import serpentMask from '../resource/serpent-mask.png';
import { describeFight, fightWithMask, type Mask } from './demoModel';
import './styles.css';

const maskOptions = [
  { id: 'bear', label: 'Bear mask', labelRu: 'Медвежья маска', className: 'BearMask', image: bearMask },
  { id: 'serpent', label: 'Serpent mask', labelRu: 'Змеиная маска', className: 'SerpentMask', image: serpentMask },
  { id: 'owl', label: 'Owl mask', labelRu: 'Совиная маска', className: 'OwlMask', image: owlMask },
] as const;

type Encounter = {
  graph: ConfiguredDemoProps['graph'];
  mask: Mask;
  result: string | null;
};

export default function Demo({ graph, ready, active }: ConfiguredDemoProps)
{
  const language = useLanguage();
  const [encounter, setEncounter] = useState<Encounter | null>(null);

  if (encounter && encounter.graph !== graph)
  {
    setEncounter(null);
  }

  const equipped = maskOptions.find(option => option.id === encounter?.mask);
  const enabled = ready && active;
  let status = localize(language, 'Choose a mask to begin.', 'Выберите маску.');
  if (equipped && encounter?.result)
  {
    status = language === 'ru' ? describeFight(equipped.id, language) : encounter.result;
  }
  else if (equipped)
  {
    status = localize(language, `${equipped.label} equipped.`, `${equipped.labelRu} надета.`);
  }

  function fight()
  {
    if (!enabled || !encounter)
    {
      return;
    }

    setEncounter({ ...encounter, result: fightWithMask(graph, encounter.mask) });
  }

  return (
    <section className="strategy-demo" aria-labelledby="strategy-demo-title">
      <header>
        <h2 id="strategy-demo-title">{localize(language, 'Face the troll', 'Сразитесь с троллем')}</h2>
        <p>{localize(language,
          'Equip a mask, then fight. Swap masks and repeat to see the same fighter change tactics.',
          'Наденьте маску и вступите в бой. Затем смените маску и посмотрите, как изменится тактика воина.')}</p>
      </header>
      <div className="strategy-masks" role="group" aria-label={localize(language, 'Choose a mask', 'Выбор маски')}>
        {maskOptions.map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === equipped?.id}
            disabled={!enabled}
            onClick={() => setEncounter({ graph, mask: option.id, result: null })}
          >
            <img src={option.image} alt="" />
            <span>{localize(language, option.label, option.labelRu)}</span>
          </button>
        ))}
      </div>
      <div className="strategy-encounter">
        <button type="button" disabled={!enabled || !equipped} onClick={fight}>{localize(language, 'Fight', 'В бой')}</button>
        <p role="status" aria-atomic="true">{status}</p>
        {equipped && encounter?.result && (
          <code>{`MaskBearer.fight() → ${equipped.className}.fight()`}</code>
        )}
      </div>
    </section>
  );
}
