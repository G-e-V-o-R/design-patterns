import { useId, useState } from 'react';
import type { IntroContent } from './lessonTypes';

const defaultSteps = ['Add class cards', 'Add fields & methods', 'Connect & test'];

export function StoryIntro({ content, onStart }: { content: IntroContent; onStart?: () => void })
{
  const storyId = useId();
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const story = (
    <div className="pattern-story">
      {content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </div>
  );

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
          <p className="pattern-goal"><strong>Your task</strong> {content.task}</p>
          {onStart ? (
            <>
              <div className="pattern-intro-actions">
                <button
                  type="button"
                  aria-expanded={isStoryOpen}
                  aria-controls={storyId}
                  onClick={() => setIsStoryOpen((open) => !open)}
                >
                  Read the story
                </button>
                <button type="button" onClick={onStart}>Start building</button>
              </div>
              <div className="pattern-story-disclosure" id={storyId} hidden={!isStoryOpen}>
                {story}
                {content.steps && <StorySteps steps={content.steps} />}
              </div>
            </>
          ) : story}
        </div>
      </div>
      {!onStart && <StorySteps steps={content.steps ?? defaultSteps} />}
    </>
  );
}

function StorySteps({ steps }: { steps: readonly string[] })
{
  return (
    <div className="pattern-steps" aria-label="How to play">
      {steps.map((step, index) => <span key={index}><b>{index + 1}</b> {step}</span>)}
    </div>
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
