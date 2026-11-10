import type { DragEvent, ReactNode } from 'react';
import { classCards, memberCards, type LessonGraph } from './model';
import { hints } from './lessonContent';

// Это объединение строковых литералов: CardCategory может быть только одним
// из этих трёх значений. По смыслу похоже на enum, но значения — строки.
type CardCategory = 'classes' | 'fields' | 'methods';

// Инструкции для блока CategoryControls.
const classHelpText = 'Add class cards to your diagram.';
const fieldHelpText = 'A field stores data. Drag a field onto a class. To move it, drag it to another class. To take it out, drag it to an empty area.';
const methodHelpText = 'A method does a job. Drag a method onto a class or interface. To move it, drag it to another class. To take it out, drag it to an empty area.';

// Контракт входных данных компонента (props). React-компоненты получают данные
// и функции от родителя, а не читают и не изменяют состояние приложения напрямую.
type CardTrayInputs = {
  // Граф диаграммы и активная вкладка: это данные, которые компонент отображает.
  lessonGraph: LessonGraph;
  selectedCategory: CardCategory;
  // Функции-обработчики. Запись (аргументы) => результат — тип функции;
  // например, (category: CardCategory) => void близко к std::function<void(CardCategory)> в C++.
  // Компонент вызывает эти функции, а состояние изменяет родитель.
  onCategoryChange: (category: CardCategory) => void;
  // ID карточки, которую сейчас тащат мышью; null означает, что перетаскивания нет.
  draggedMemberId: string | null;
  // Индекс текущей подсказки; отрицательное значение означает «ещё не выбрана».
  hintIndex: number;
  // Действия пользователя, которые панель просит выполнить родителя.
  onAddClassToDiagram: (id: string) => void;
  // DragEvent — событие браузера при перетаскивании мышью.
  onStartMemberDrag: (event: DragEvent, id: string) => void;
  onShowNextHint: () => void;
  onLoadSolution: () => void;
};

// Панель получает текущее состояние и функции-обработчики от родительского компонента;
// сама она не хранит состояние урока.
// Запись параметров в фигурных скобках извлекает одноимённые поля из объекта props.
export function ObserverDiagramBuilderPanel({
  lessonGraph,
  selectedCategory,
  onCategoryChange,
  draggedMemberId,
  hintIndex,
  onAddClassToDiagram,
  onStartMemberDrag,
  onShowNextHint,
  onLoadSolution,
}: CardTrayInputs)
{
  // ReactNode — любой узел, который React может показать. Здесь заранее выбираем,
  // какую группу карточек показать; JSX ниже просто вставит выбранный результат.
  let cardContent: ReactNode;
  if (selectedCategory === 'classes')
  {
    cardContent = (
      <ClassCards
        lessonGraph={lessonGraph}
        onAddClassToDiagram={onAddClassToDiagram}
      />
    );
  }
  else
  {
    cardContent = (
      <MemberCards
        lessonGraph={lessonGraph}
        selectedCategory={selectedCategory}
        draggedMemberId={draggedMemberId}
        onStartMemberDrag={onStartMemberDrag}
      />
    );
  }

  return (
    <aside className="lesson-tray">
      {/* JSX описывает разметку; выражения в фигурных скобках подставляют значения кода. */}
      <div className="lesson-section-title">
        <h2>Your cards</h2>
        {/* Счётчик берёт количество добавленных классов из текущего графа. */}
        <span>{lessonGraph.classes.length}/4 classes</span>
      </div>
      <CategoryControls
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
      {/* Для классов нужны кнопки добавления, а поля и методы назначаются перетаскиванием. */}
      {cardContent}
      <HintControls
        hintIndex={hintIndex}
        onShowNextHint={onShowNextHint}
        onLoadSolution={onLoadSolution}
      />
    </aside>
  );
}

// Вкладки выбирают тип карточек. Инструкция рядом меняется вместе с выбором.
type CategoryControlsInputs = {
  selectedCategory: CardCategory;
  onCategoryChange: (category: CardCategory) => void;
};

function CategoryControls({
  selectedCategory,
  onCategoryChange,
}: CategoryControlsInputs)
{
  // Тип CardCategory гарантирует, что switch обработает все возможные категории.
  let categoryHelpText: string;
  switch (selectedCategory) {
    case 'classes':
      categoryHelpText = classHelpText;
      break;
    case 'fields':
      categoryHelpText = fieldHelpText;
      break;
    case 'methods':
      categoryHelpText = methodHelpText;
      break;
  }

  return (
    <>
      <div className="lesson-tabs" role="group" aria-label="Card category">
        {/* aria-pressed сообщает вспомогательным технологиям, какая вкладка выбрана. */}
        {/* При нажатии передаём родителю новое значение вкладки; он обновит состояние. */}
        <button
          aria-pressed={selectedCategory === 'classes'}
          onClick={() => onCategoryChange('classes')}
        >
          Classes & interface
        </button>
        <button
          aria-pressed={selectedCategory === 'fields'}
          onClick={() => onCategoryChange('fields')}
        >
          Fields
        </button>
        <button
          aria-pressed={selectedCategory === 'methods'}
          onClick={() => onCategoryChange('methods')}
        >
          Methods
        </button>
      </div>
      <p className="lesson-help">{categoryHelpText}</p>
    </>
  );
}

// Управляет показом подсказки и загрузкой готового решения.
type HintControlsInputs = {
  hintIndex: number;
  onShowNextHint: () => void;
  onLoadSolution: () => void;
};

function HintControls({
  hintIndex,
  onShowNextHint,
  onLoadSolution,
}: HintControlsInputs)
{
  return (
    <div className="lesson-hints">
      {/* hintIndex — индекс текущей подсказки; -1 означает, что её ещё не показывали.
          На последней подсказке кнопку отключаем, чтобы индекс не вышел за пределы списка. */}
      <button onClick={onShowNextHint} disabled={hintIndex === hints.length - 1}>
        Show hint {Math.min(hintIndex + 2, 3)} / 3
      </button>
      {/* Условие && показывает абзац только после выбора хотя бы одной подсказки. */}
      {hintIndex >= 0 && <p>{hints[hintIndex]}</p>}
      <button className="lesson-text-button" onClick={onLoadSolution}>
        Show solution
      </button>
    </div>
  );
}

// Показывает классы и интерфейсы, которые можно добавить в диаграмму.
// Props описывают данные и действие добавления, которые получает этот дочерний компонент.
type ClassCardsInputs = {
  lessonGraph: LessonGraph;
  onAddClassToDiagram: (id: string) => void;
};

function ClassCards({
  lessonGraph,
  onAddClassToDiagram,
}: ClassCardsInputs)
{
  return (
    <div className="lesson-card-list">
      {/* map превращает каждую запись модели classCards в отдельную карточку интерфейса. */}
      {classCards.map(card =>
      {
        const isAlreadyInDiagram = lessonGraph.classes.includes(card.id);
        let buttonLabel = '+ Add to diagram';
        if (isAlreadyInDiagram)
        {
          buttonLabel = '✓ In diagram';
        }

        // key — стабильный ID, по которому React сопоставляет эту карточку
        // с предыдущим элементом списка при обновлении интерфейса.
        return (
          <article className="lesson-tray-card" key={card.id}>
            <small>{card.kind}</small>
            <h3>{card.label}</h3>
            <p>{card.description}</p>
            {/* Стрелочная функция запоминает ID этой карточки и передаёт его при нажатии. */}
            <button disabled={isAlreadyInDiagram} onClick={() => onAddClassToDiagram(card.id)}>
              {buttonLabel}
            </button>
          </article>
        );
      })}
    </div>
  );
}

// Показывает поля или методы; карточку можно перетащить на класс на диаграмме.
// draggedMemberId содержит ID перетаскиваемой карточки или null, если перетаскивания нет.
type MemberCardsInputs = {
  lessonGraph: LessonGraph;
  selectedCategory: CardCategory;
  draggedMemberId: string | null;
  onStartMemberDrag: (event: DragEvent, id: string) => void;
};

function MemberCards({
  lessonGraph,
  selectedCategory,
  draggedMemberId,
  onStartMemberDrag,
}: MemberCardsInputs)
{
  // Оставляем только карточки выбранной категории: поля либо методы.
  const visibleMembers = memberCards.filter(member =>
  {
    if (lessonGraph.members[member.id])
    {
      return false;
    }

    if (selectedCategory === 'fields')
    {
      return member.kind === 'field';
    }

    return member.kind === 'method';
  });

  return (
    <div className="lesson-card-list">
      {visibleMembers.length === 0
        ? <p className="lesson-method-description">
            {selectedCategory === 'fields'
              ? 'All fields are already in the diagram.'
              : 'All methods are already in the diagram.'}
          </p>
        : visibleMembers.map(member =>
      {
        const isBeingDragged = draggedMemberId === member.id;
        const className = [
          'lesson-member-card',
          isBeingDragged && 'is-dragging',
        ].filter(Boolean).join(' ');

        return (
          <article
            className={className}
            key={member.id}
            draggable
            onDragStart={event => onStartMemberDrag(event, member.id)}
          >
            {/* draggable включает перетаскивание; обработчик выше передаёт родителю
                событие и ID карточки, чтобы родитель мог управлять её переносом. */}
            <span className="lesson-drag-hint" aria-hidden="true">⠿ Drag to a class</span>
            <code>{member.label}</code>
            <p className="lesson-method-description">{member.description}</p>
          </article>
        );
      })}
    </div>
  );
}
