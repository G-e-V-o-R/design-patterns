export type Artwork = { src: string; alt: string };
export type ClassImage = Artwork & { framing?: number; height?: number };

export type IntroContent = {
  number: string;
  category?: string;
  title: string;
  pattern: string;
  headingId: string;
  artwork: Artwork;
  caption: string;
  paragraphs: readonly string[];
  task: string;
  concept: string;
  steps?: readonly string[];
};

export type MemberKind = 'field' | 'method';
export type MemberVisibility = 'public' | 'protected' | 'private';
export type ClassVariant = 'class' | 'interface';

export type ClassDefinition = {
  id: string;
  label: string;
  kind: string;
  description: string;
  variant: ClassVariant;
};

export type MemberDefinition = {
  id: string;
  label: string;
  kind: MemberKind;
  description?: string;
  visibility?: MemberVisibility;
};

export type ClassAppearance =
  | { variant: 'class'; artwork: ClassImage }
  | { variant: 'interface'; artwork?: ClassImage };

export type PresentedClass = Omit<ClassDefinition, 'variant'> & ClassAppearance;

export type ClassArtwork<Classes extends readonly ClassDefinition[]> =
  Record<Extract<Classes[number], { variant: 'class' }>['id'], ClassImage>
  & Partial<Record<Extract<Classes[number], { variant: 'interface' }>['id'], ClassImage>>;
