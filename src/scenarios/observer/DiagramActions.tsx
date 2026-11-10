type ObserverActionsProps = {
  onRun: () => void;
  message: string;
  ready: boolean;
};

export function ObserverActions({ onRun, message, ready }: ObserverActionsProps)
{
  return (
    <>
      <div className="lesson-actions">
        <button disabled={!ready} onClick={onRun}>Run discovery →</button>
        <span>Explore how the publisher notifies its subscribers.</span>
      </div>
      <div aria-live="polite" className="lesson-result">
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
