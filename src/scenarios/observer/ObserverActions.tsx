import type { LessonIssue } from './model';

type ObserverActionsProps = {
  onCheck: () => void;
  onRun: () => void;
  message: string;
  issues: LessonIssue[] | null;
  worked: boolean;
};

export function ObserverActions({
  onCheck,
  onRun,
  message,
  issues,
  worked,
}: ObserverActionsProps)
{
  return (
    <>
      <ActionButtons onCheck={onCheck} onRun={onRun} />
      <LessonResult message={message} issues={issues} worked={worked} />
    </>
  );
}

function ActionButtons({
  onCheck,
  onRun,
}: {
  onCheck: () => void;
  onRun: () => void;
})
{
  return (
    <div className="lesson-actions">
      <button className="primary" onClick={onCheck}>Check diagram</button>
      <button onClick={onRun}>Run discovery →</button>
      <span>Are all fields and methods in the right place?</span>
    </div>
  );
}

function LessonResult({
  message,
  issues,
  worked,
}: {
  message: string;
  issues: LessonIssue[] | null;
  worked: boolean;
})
{
  return (
    <div aria-live="polite" className="lesson-result">
      {message && <p>{message}</p>}
      {issues && (
        <ValidationFeedback issues={issues} worked={worked} />
      )}
    </div>
  );
}

function ValidationFeedback({
  issues,
  worked,
}: {
  issues: LessonIssue[];
  worked: boolean;
})
{
  if (issues.length > 0)
  {
    return <IncompleteFeedback issues={issues} />;
  }

  return <SuccessFeedback worked={worked} />;
}

function IncompleteFeedback({ issues }: { issues: LessonIssue[] })
{
  return (
    <div className="lesson-feedback">
      <h3>Keep building</h3>
      <p>Look for “Fix this” on the cards and arrows.</p>
      <ul>
        {issues.map((issue, issueIndex) => (
          <li key={issueIndex}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}

function SuccessFeedback({ worked }: { worked: boolean })
{
  let heading = 'Your Observer diagram works';
  if (worked)
  {
    heading = 'This is a complete Observer diagram';
  }

  return (
    <div className="lesson-feedback success">
      <h3>{heading}</h3>
      <p>
        The publisher uses the Subscriber interface. Each subscriber decides
        what to do with the message. A new subscriber can join without changes
        to the fox.
      </p>
    </div>
  );
}
