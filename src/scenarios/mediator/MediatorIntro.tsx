import { introArt } from './lessonContent';

export function MediatorIntro() {
  return <>
    <div className="med-intro"><div><p className="med-kicker">SCENARIO 02 · BEHAVIORAL PATTERN</p><h1 id="mediator-heading">Thoughts through the raven <span>Mediator</span></h1><p>An ambush scatters the group. Elvir sends his raven to coordinate their requests. Dre’Kaar needs cover; Faelina needs shelter. The raven knows who can help and passes each request to the right companion.</p><p className="med-task"><strong>Your task</strong> Build a class diagram where companions ask through a Mediator interface. Let RavenMediator decide who responds.</p></div><figure><img src={introArt.src} alt={introArt.alt}/><figcaption>Many requests → one coordinator</figcaption></figure></div>
    <div className="med-steps"><span>1 · Add class cards</span><span>2 · Assign members</span><span>3 · Connect & test</span></div>
  </>;
}

export function MediatorConcept() {
  return <div className="med-concept"><strong>The main idea</strong><p>Keep coordination in the mediator. Participants can cooperate without holding references to each other. Changing the raven’s routing rule does not require changing the requesters.</p></div>;
}
