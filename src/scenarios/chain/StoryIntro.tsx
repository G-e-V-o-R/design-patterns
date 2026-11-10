import { introArt } from './lessonContent';

export function ChainIntro()
{
  return (
    <>
      <div className="chain-intro">
        <div className="chain-intro-copy">
          <p className="chain-kicker">SCENARIO 03 <span>BEHAVIORAL PATTERN</span></p>
          <h1 id="chain-heading">
            Silk in the wind <span>Chain of Responsibility</span>
          </h1>
          <div className="chain-story">
            <p>
              Faelina unwraps a white silk pouch and releases a line of spiders. Each one
              smells a different trail: blood, footsteps, iron. A request moves from one to
              the next until a spider decides that the trail is its own and stops the chain.
            </p>
            <p>
              The signal is always the same. What changes is which spider reacts, because the
              chain knows only one rule: pass it forward until someone handles it. No caller has to
              know which spider will answer, and each spider only cares about its own trigger.
            </p>
          </div>
          <p className="chain-task">
            <strong>Your task</strong> Build a chain where a request passes through a shared
            handler interface and stops at the first spider that recognizes it.
          </p>
        </div>

        <figure>
          <img src={introArt.src} alt={introArt.alt} />
          <figcaption>One signal, many handlers, one stop</figcaption>
        </figure>
      </div>

      <div className="chain-steps" aria-label="How to play">
        <span><b>1</b> Add class cards</span>
        <span><b>2</b> Add fields &amp; methods</span>
        <span><b>3</b> Connect &amp; test</span>
      </div>
    </>
  );
}

export function ChainConcept()
{
  return (
    <div className="chain-concept">
      <strong>The main idea</strong>
      <p>
        The chain allows each handler to accept a request or pass it on. This keeps the caller
        independent from the actual decision route while still letting the signal find the correct
        responder.
      </p>
    </div>
  );
}
