import type { IntroContent } from './lessonTypes';

const defaultSteps = ['Add class cards', 'Add fields & methods', 'Connect & test'];

export function StoryIntro({ content }: { content: IntroContent })
{
  return (
    <>
      <div className="pattern-intro">
        <figure>
          <img src={content.artwork.src} alt={content.artwork.alt} />
          <figcaption>{content.caption}</figcaption>
        </figure>
        <div className="pattern-intro-copy">
          <p className="pattern-kicker">SCENARIO {content.number} <span>{content.category ?? 'BEHAVIORAL PATTERN'}</span></p>
          <h1 id={content.headingId}>{content.title}<span>{content.pattern}</span></h1>
          <div className="pattern-story">
            {content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <p className="pattern-goal"><strong>Your task</strong> {content.task}</p>
        </div>
      </div>
      <div className="pattern-steps" aria-label="How to play">
        {(content.steps ?? defaultSteps).map((step, index) => (
          <span key={step}><b>{index + 1}</b> {step}</span>
        ))}
      </div>
    </>
  );
}

export function ConceptCallout({ children }: { children: string })
{
  return (
    <div className="pattern-concept">
      <strong>The main idea</strong>
      <p>{children}</p>
    </div>
  );
}
