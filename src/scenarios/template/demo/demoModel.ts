abstract class SoupRecipe
{
  cookSoup()
  {
    return [
      { method: 'cookMeat()', detail: this.cookMeat() },
      { method: 'addSeasoning()', detail: this.addSeasoning() },
      { method: 'addVegetables()', detail: this.addVegetables() },
    ] as const;
  }

  private cookMeat()
  {
    return 'The meat goes into cold water and simmers to make the broth.';
  }

  protected abstract addSeasoning(): string;

  private addVegetables()
  {
    return 'The vegetables are sautéed until golden and stirred into the soup.';
  }
}

class FaelinaRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return 'Faelina crushes a clove of garlic and adds it to the broth.';
  }
}

class LatveRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return 'Latve adds fresh herbs to the broth.';
  }
}

class DreKaarRecipe extends SoupRecipe
{
  protected override addSeasoning()
  {
    return 'Dre’Kaar adds a pinch of smoked pepper to the broth.';
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
