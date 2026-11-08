import { useState } from 'react';
import { emptyLesson } from './model';
import { ObserverLesson } from './LessonWorkspace';
import '../shared/artwork.css';
import './styles.css';

export default function ObserverScenario({ active = true }: { active?: boolean })
{
  const [lessonGraph, setLessonGraph] = useState(emptyLesson);

  // Сценарий владеет графом и передаёт уроку и текущее значение, и способ его
  // обновить. Так дочерние компоненты остаются отдельными представлениями урока.
  return (
    <div className="observer-scenario">
      <ObserverLesson
        active={active}
        graph={lessonGraph}
        onChange={setLessonGraph}
      />
    </div>
  );
}
