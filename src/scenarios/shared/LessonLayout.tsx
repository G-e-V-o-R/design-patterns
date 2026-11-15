import type { ReactNode } from 'react';

export function LessonWorkspace({ tray, children }: { tray: ReactNode; children: ReactNode })
{
  return (
    <div className="pattern-workspace">
      {tray}
      <div className="pattern-board">{children}</div>
    </div>
  );
}

export function BoardToolbar({ placedMembers, totalMembers, relationships, canUndo, onUndo, onReset }: {
  placedMembers: number;
  totalMembers: number;
  relationships: number;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
})
{
  return (
    <header className="pattern-board-toolbar">
      <div>
        <h2>Your class diagram</h2>
        <p>{placedMembers}/{totalMembers} member cards placed · {relationships} relationships</p>
      </div>
      <div>
        <button disabled={!canUndo} onClick={onUndo}>Undo</button>
        <button onClick={onReset}>Reset</button>
      </div>
    </header>
  );
}

export function SolutionNotice({ children }: { children: ReactNode })
{
  return (
    <div className="pattern-worked">{children}</div>
  );
}

export function LessonStatus({ children }: { children: ReactNode })
{
  return <div className="pattern-status" role="status" aria-live="polite">{children}</div>;
}

export function LessonAction({ label, description, ready, onRun }: {
  label: string;
  description: string;
  ready: boolean;
  onRun: () => void;
})
{
  return (
    <div className="pattern-actions">
      <button disabled={!ready} onClick={onRun}>{label}</button>
      <span>{description}</span>
    </div>
  );
}
