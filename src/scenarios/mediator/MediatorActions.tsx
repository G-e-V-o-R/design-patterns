import type { MediatorIssue } from './model';

export function MediatorActions({ onCheck, message, issues }: {
  onCheck: () => void;
  message: string;
  issues: MediatorIssue[] | null;
}) {
  return <>
    <div className="med-actions med-check"><button className="med-primary" onClick={onCheck}>Check diagram</button><span>Does coordination belong to the raven?</span></div>
    <div className="med-feedback" aria-live="polite">{message && <p>{message}</p>}{issues && (issues.length ? <div><h3>Keep building</h3><p>Look for “Fix this” on the cards and arrows.</p><ul>{issues.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul></div> : <div className="med-success"><h3>Your Mediator diagram works</h3><p>Participants depend on the Mediator contract. The raven coordinates requests; each companion owns its own action.</p></div>)}</div>
  </>;
}
