import { localize, useLanguage } from './language';
import type { DragEventHandler, ReactNode } from 'react';

export function LessonWorkspace({ tray, children, onDragEnd }: {
  tray: ReactNode;
  children: ReactNode;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
})
{
  return (
    <div className="pattern-workspace" onDragEnd={onDragEnd}>
      {tray}
      <div className="pattern-board">{children}</div>
    </div>
  );
}

export function BoardToolbar({ progress, status, canUndo, onUndo, onReset, onOpenCards, onOpenExample, onRunDemo }: {
  progress: readonly { label: string; correct: number; total: number }[];
  status: string;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onOpenCards: () => void;
  onOpenExample: () => void;
  onRunDemo?: () => void;
})
{
  const language = useLanguage();
  return (
    <header className="pattern-board-toolbar">
      <div>
        <h2>{localize(language, 'Your class diagram', 'Ваша диаграмма классов')}</h2>
        <ul className="configured-board-progress" aria-label={localize(language, 'Correct placements', 'Прогресс построения')}>
          {progress.map(({ label, correct, total }) => (
            <li key={label} className={correct === total ? 'is-complete' : undefined}>
              {label} <strong>{correct}/{total}</strong>
            </li>
          ))}
        </ul>
        <p className="configured-board-status" role="status">{status}</p>
      </div>
      <div className="configured-board-actions">
        <button className="pattern-open-cards" type="button" aria-haspopup="dialog" onClick={onOpenCards}>{localize(language, 'Add cards', 'Добавить карточки')}</button>
        <button type="button" disabled={!canUndo} onClick={onUndo}>{localize(language, 'Undo', 'Отменить')}</button>
        <button type="button" onClick={onReset}>{localize(language, 'Reset', 'Сбросить')}</button>
        <button className="configured-example-action" type="button" onClick={onOpenExample}>{localize(language, 'View worked example', 'Посмотреть готовый пример')}</button>
        {onRunDemo && <button className="configured-demo-action" type="button" onClick={onRunDemo}>{localize(language, 'Run demo', 'Запустить демонстрацию')}</button>}
      </div>
    </header>
  );
}
