import { introArt } from './lessonContent';

export function MediatorIntro()
{
  return (
    <>
      <div className="med-intro">
        <div>
          <p className="med-kicker">
            SCENARIO 02 · BEHAVIORAL PATTERN
          </p>
          <h1 id="mediator-heading">
            Thoughts through the raven <span>Mediator</span>
          </h1>
          <div className="med-story">
            <p>
              The ambush closes around the companions. Everyone is shouting.
              Faelina warns, “Enemy behind you!” Narion calls, “Saerenn is
              bleeding—get her to safety!” Their cries collide. Narion turns
              toward the enemy, while Dre’Kaar rushes to Saerenn—then both
              hesitate, unsure whether to fight or get her to safety.
            </p>
            <p>
              Elvir sends Raven aloft. A mental link joins Raven to every
              companion, so they can send a thought instead of shouting across
              the fight. “Saerenn is bleeding—get her to safety!” Narion thinks.
              Raven knows who can help and directs the request to them. Faelina
              can ask for shelter and Dre’Kaar for cover; Raven routes those
              requests to Saerenn and Narion. The companions stay focused on the
              fight while Raven keeps each request moving to the right person.
            </p>
          </div>
          <p className="med-task">
            <strong>Your task</strong>
            {' '}
            Build a class diagram where companions ask through a Mediator
            interface. Let RavenMediator decide who responds.
          </p>
        </div>

        <figure>
          <img src={introArt.src} alt={introArt.alt} />
          <figcaption>Many requests → one coordinator</figcaption>
        </figure>
      </div>

      <div className="med-steps">
        <span>1 · Add class cards</span>
        <span>2 · Assign members</span>
        <span>3 · Connect & test</span>
      </div>
    </>
  );
}

export function MediatorConcept()
{
  return (
    <div className="med-concept">
      <strong>The main idea</strong>
      <p>
        Keep coordination in the mediator. Participants can cooperate without
        holding references to each other. Changing the raven’s routing rule
        does not require changing the requesters.
      </p>
    </div>
  );
}
