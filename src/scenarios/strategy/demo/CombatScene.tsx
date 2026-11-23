import { preload } from 'react-dom';
import { localize, useLanguage } from '../../shared/language';
import bearFight from '../resource/bear-fight.webp';
import warrior from '../resource/mask-warrior-and-fallen-troll.png';
import orc from '../resource/orc.webp';
import owlFight from '../resource/owl-fight.webp';
import snakeFight from '../resource/snake-fight.webp';
import troll from '../resource/troll.webp';
import type { Mask } from './demoModel';

const fightScenes = {
  bear: {
    image: bearFight,
    alt: 'The bear-masked fighter pushes an armored troll back into the smithy.',
    altRu: 'Воин в медвежьей маске оттесняет бронированного тролля в кузницу.',
  },
  snake: {
    image: snakeFight,
    alt: 'The snake-masked fighter summons a shadow that coils around the troll.',
    altRu: 'Воин в змеиной маске призывает тень, которая обвивает тролля.',
  },
  owl: {
    image: owlFight,
    alt: 'The owl-masked fighter emerges from the shadows to surprise an axe-wielding orc.',
    altRu: 'Воин в совиной маске выходит из тени и застаёт врасплох орка с топором.',
  },
} satisfies Record<Mask, { image: string; alt: string; altRu: string }>;

type CombatSceneProps = {
  mask?: Mask;
  maskImage?: string;
  fought: boolean;
  playing: boolean;
};

export default function CombatScene({ mask, maskImage, fought, playing }: CombatSceneProps)
{
  const language = useLanguage();
  const scene = mask && fightScenes[mask];

  if (scene && fought)
  {
    return (
      <div className="strategy-arena strategy-fight-scene" data-mask={mask} data-playing={playing}>
        <img src={scene.image} alt={localize(language, scene.alt, scene.altRu)} draggable={false} />
      </div>
    );
  }

  if (scene)
  {
    preload(scene.image, { as: 'image' });
  }

  const facesOrc = mask === 'owl';
  const opponent = facesOrc
    ? localize(language, 'Orc', 'Орк')
    : localize(language, 'Troll', 'Тролль');

  return (
    <div className="strategy-arena strategy-ready-scene" data-mask={mask}>
      <figure className="strategy-fighter">
        <div className="strategy-portrait">
          <img className="strategy-character" src={warrior} alt="" draggable={false} />
          {maskImage && <img className="strategy-equipped-mask" src={maskImage} alt="" draggable={false} />}
        </div>
        <figcaption>{localize(language, 'Masked warrior', 'Воин в маске')}</figcaption>
      </figure>
      <figure className="strategy-fighter strategy-opponent">
        <div className="strategy-portrait">
          <img className="strategy-character" src={facesOrc ? orc : troll} alt="" draggable={false} />
        </div>
        <figcaption>{opponent}</figcaption>
      </figure>
    </div>
  );
}
