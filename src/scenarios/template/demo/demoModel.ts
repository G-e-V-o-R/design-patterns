type StepDetail = { detail: string; detailRu: string };

abstract class SoupRecipe
{
  cookSoup()
  {
    return [
      { method: 'cookMeat()', ...this.cookMeat() },
      { method: 'addSeasoning()', ...this.addSeasoning() },
      { method: 'addVegetables()', ...this.addVegetables() },
    ] as const;
  }

  private cookMeat()
  {
    return {
      detail: 'The meat goes into cold water and simmers to make the broth.',
      detailRu: 'Мясо кладут в холодную воду и варят на слабом огне, чтобы получился бульон.',
    };
  }

  protected abstract addSeasoning(): StepDetail;

  private addVegetables()
  {
    return {
      detail: 'The vegetables are sautéed until golden and stirred into the soup.',
      detailRu: 'Овощи обжаривают до золотистого цвета и добавляют в суп.',
    };
  }
}

class FaelinaRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return {
      detail: 'Faelina crushes a clove of garlic and adds it to the broth.',
      detailRu: 'Фаэлина раздавливает зубчик чеснока и добавляет его в бульон.',
    };
  }
}

class LatveRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return {
      detail: 'Latve adds fresh herbs to the broth.',
      detailRu: 'Латве добавляет в бульон свежую зелень.',
    };
  }
}

class DreKaarRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return {
      detail: 'Dre’Kaar adds a pinch of smoked pepper to the broth.',
      detailRu: 'Дре’Каар добавляет в бульон щепотку копчёного перца.',
    };
  }
}

const recipes = {
  faelina: new FaelinaRecipe(),
  latve: new LatveRecipe(),
  dreKaar: new DreKaarRecipe(),
};

export type CookId = keyof typeof recipes;

export function cookSoup(cook: CookId)
{
  return recipes[cook].cookSoup();
}
