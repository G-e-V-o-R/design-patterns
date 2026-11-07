import foxArt from '../../../docs/hobbit/scenarios/1.1.png?url';

export function ObserverIntro() {
  return <>
    <div className="lesson-intro"><div><p className="lesson-kicker">SCENARIO 01 <span>BEHAVIORAL PATTERN</span></p><h1>The fox’s discovery<span>Observer</span></h1><p className="lesson-situation">Before they enter the forest, Narion shows the group some magic bracelets. “My fox will go ahead and check the path,” he says. “It can send us a message about what it sees. It only sends a message when there is danger. When the path is safe, it keeps looking and sends nothing.”</p><p className="lesson-situation">“Put on a bracelet to subscribe and get its messages. Take it off to unsubscribe. Then you will get no more messages. The fox will still do its job, and everyone who still wears a bracelet will still get messages.”</p><p className="lesson-situation">Narion and Dre’Kaar put on their bracelets. Soon, the fox sees danger and sends both of them the same message. Narion plans a safer path. Dre’Kaar gets ready to protect the group. Each person chooses what to do. Later, Narion takes off his bracelet. The next time the fox sees danger, only Dre’Kaar gets its message.</p><p className="lesson-goal"><strong>Your task</strong> Build a class diagram. Let the fox notify each Subscriber through the Subscriber interface. The fox does not need to know their concrete classes.</p></div><figure><img src={foxArt} alt="The fox scouting with Narion in the forest"/><figcaption>One publisher → many subscribers</figcaption></figure></div>
    <div className="lesson-steps" aria-label="How to play"><span><b>1</b> Add class cards</span><span><b>2</b> Add fields & methods</span><span><b>3</b> Connect & test</span></div>
  </>;
}

export function ObserverConcept() {
  return <div className="lesson-concept"><strong>The main idea</strong><p><b>Publisher</b> keeps a list of subscribers and sends them messages. <b>Subscriber</b> is an interface with an <code>update()</code> method. Each concrete subscriber implements this method and decides what to do with the message.</p></div>;
}
