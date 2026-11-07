import type { LessonIssue } from './model';

export function ObserverActions({ onCheck, onRun, message, issues, worked }: {
  onCheck: () => void;
  onRun: () => void;
  message: string;
  issues: LessonIssue[] | null;
  worked: boolean;
}) {
  return <>
    <div className="lesson-actions"><button className="primary" onClick={onCheck}>Check diagram</button><button onClick={onRun}>Run discovery →</button><span>Are all fields and methods in the right place?</span></div>
    <div aria-live="polite" className="lesson-result">{message && <p>{message}</p>}{issues && (issues.length ? <div className="lesson-feedback"><h3>Keep building</h3><p>Look for “Fix this” on the cards and arrows.</p><ul>{issues.map((issue,index) => <li key={index}>{issue.message}</li>)}</ul></div> : <div className="lesson-feedback success"><h3>{worked ? 'This is a complete Observer diagram' : 'Your Observer diagram works'}</h3><p>The publisher uses the Subscriber interface. Each subscriber decides what to do with the message. A new subscriber can join without changes to the fox.</p></div>)}</div>
  </>;
}
