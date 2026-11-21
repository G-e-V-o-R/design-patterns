import type { CSSProperties } from 'react';
import cauldron from '../resource/transparent-cauldrone.png?url';
import garlic from '../resource/garlic-cutout.webp?url';
import herbs from '../resource/herbs-cutout.webp?url';
import meat from '../resource/meat-cutout.webp?url';
import smokedPepper from '../resource/smoked-pepper-cutout.webp?url';
import vegetables from '../resource/vegetables-cutout.webp?url';
import type { cookSoup, CookId } from './demoModel';

const seasoning: Record<CookId, string> = {
  faelina: garlic,
  latve: herbs,
  dreKaar: smokedPepper,
};

type CookingSceneProps = {
  cook: CookId | undefined;
  method: ReturnType<typeof cookSoup>[number]['method'] | undefined;
  duration: number | undefined;
  finished: boolean;
};

export function CookingScene({ cook, method, duration, finished }: CookingSceneProps)
{
  const preparingBroth = method === 'cookMeat()';
  let ingredient: string | undefined;
  if (preparingBroth)
  {
    ingredient = meat;
  }
  else if (method === 'addSeasoning()' && cook)
  {
    ingredient = seasoning[cook];
  }
  else if (method === 'addVegetables()')
  {
    ingredient = vegetables;
  }

  return (
    <div className="template-hearth" aria-hidden="true">
      <div
        className="template-pot"
        data-preparing-broth={preparingBroth}
        style={{ '--template-scene-duration': `${duration ?? 0}ms` } as CSSProperties}
      >
        <div className="template-fire">
          <i /><i /><i />
        </div>
        <img className="template-cauldron" src={cauldron} alt="" draggable={false} />
        {!method && !finished && <img src={meat} alt="" hidden />}
        {cook && preparingBroth && (
          <div hidden>
            <img src={seasoning[cook]} alt="" />
            <img src={vegetables} alt="" />
          </div>
        )}
        {(method || finished) && (
          <div className="template-steam">
            <i /><i /><i />
          </div>
        )}
        {method && (
          <div className="template-bubbles">
            <i /><i /><i />
          </div>
        )}
        {ingredient && (
          <div className="template-addition" key={method} data-garnish={method === 'addVegetables()'}>
            <div className="template-splash"><i /><i /><i /></div>
            <img className="template-ingredient" src={ingredient} alt="" draggable={false} />
          </div>
        )}
        {finished && <div className="template-soup-garnish" />}
      </div>
    </div>
  );
}
