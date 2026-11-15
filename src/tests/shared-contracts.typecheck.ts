import type { ClassArtwork, ClassDefinition, PresentedClass } from '../scenarios/shared/lessonTypes';
import type { ClassDiagramCardProps } from '../scenarios/shared/ClassDiagramNode';
import type { CardCategory } from '../scenarios/shared/DiagramBuilderPanel';
import { withClassArtwork } from '../scenarios/shared/classArtwork';

const classes = [
  { id: 'worker', label: 'Worker', kind: 'worker', variant: 'class', description: 'Works' },
  { id: 'contract', label: 'Contract', kind: 'contract', variant: 'interface', description: 'Defines work' },
] as const satisfies readonly ClassDefinition[];

const artwork = { worker: { src: '/worker.png', alt: 'Worker at work' } } satisfies ClassArtwork<typeof classes>;
withClassArtwork(classes, artwork);

// @ts-expect-error Конкретный класс требует изображение в карте ресурсов.
const missingArtwork: ClassArtwork<typeof classes> = {};
// @ts-expect-error Нельзя расширить тип классов, чтобы обойти обязательное изображение.
withClassArtwork(classes, {});
// @ts-expect-error Изображение интерфейса не заменяет изображение конкретного класса.
withClassArtwork(classes, { contract: artwork.worker });

const interfaceCard: PresentedClass = classes[1];
const concreteCard: PresentedClass = { ...classes[0], artwork: artwork.worker };
// @ts-expect-error Представление конкретного класса требует изображение.
const missingCardImage: PresentedClass = classes[0];
// @ts-expect-error Карточка диаграммы сохраняет обязательное изображение конкретного класса.
const missingNodeImage: Pick<ClassDiagramCardProps, 'variant' | 'artwork'> & { variant: 'class'; artwork: undefined } = concreteCard;
// @ts-expect-error Объединённая категория больше не поддерживается.
const combinedCategory: CardCategory = 'members';

void [missingArtwork, interfaceCard, missingCardImage, missingNodeImage, combinedCategory];
