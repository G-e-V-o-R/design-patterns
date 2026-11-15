import type { Artwork, ClassArtwork, ClassDefinition, PresentedClass } from './lessonTypes';

export function requireClassArtwork(artwork: Artwork | undefined, label: string): Artwork
{
  if (!artwork?.src.trim() || !artwork.alt.trim())
  {
    throw new Error(`Class "${label}" requires an image and alternative text.`);
  }
  return artwork;
}

export function withClassArtwork<const Classes extends readonly ClassDefinition[]>(
  classes: Classes,
  artwork: ClassArtwork<NoInfer<Classes>>,
): PresentedClass[]
{
  const images: Partial<Record<string, Artwork>> = artwork;
  return classes.map(card =>
  {
    if (card.variant === 'interface')
    {
      return { ...card, variant: 'interface', artwork: images[card.id] };
    }
    return { ...card, variant: 'class', artwork: requireClassArtwork(images[card.id], card.label) };
  });
}
