import { localize, useLanguage } from './language';
import { useId, useState } from 'react';
import type { IntroContent } from './lessonTypes';

const defaultSteps = {
  en: ['Add class cards', 'Add fields & methods', 'Connect & test'],
  ru: ['Добавьте карточки классов', 'Добавьте поля и методы', 'Соедините классы и проверьте диаграмму'],
};

export function StoryIntro({ content, onStart }: { content: IntroContent; onStart?: () => void })
{
  const language = useLanguage();
  const storyId = useId();
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const story = <StoryParagraphs content={content} />;

  return (
    <>
      <div className="pattern-intro">
        <figure>
          <img src={content.artwork.src} alt={content.artwork.alt} />
          <figcaption>{content.caption}</figcaption>
        </figure>
        <div className="pattern-intro-copy">
          <p className="pattern-kicker">{localize(language, 'SCENARIO', 'СЦЕНАРИЙ')} {content.number} <span>{content.category ?? localize(language, 'BEHAVIORAL PATTERN', 'ПОВЕДЕНЧЕСКИЙ ПАТТЕРН')}</span></p>
          <h1 id={content.headingId}>{content.title}<span>{content.pattern}</span></h1>
          <p className="pattern-goal"><strong>{localize(language, 'Your task', 'Ваша задача')}</strong> {content.task}</p>
          {onStart ? (
            <>
              <div className="pattern-intro-actions">
                <button
                  type="button"
                  aria-expanded={isStoryOpen}
                  aria-controls={storyId}
                  onClick={() => setIsStoryOpen((open) => !open)}
                >
                  {localize(language, 'Read the story', 'Читать историю')}
                </button>
                <button type="button" onClick={onStart}>{localize(language, 'Start building', 'Начать построение')}</button>
              </div>
              <div className="pattern-story-disclosure" id={storyId} hidden={!isStoryOpen}>
                {story}
                {content.steps && <StorySteps steps={content.steps} />}
              </div>
            </>
          ) : story}
        </div>
      </div>
      {!onStart && <StorySteps steps={content.steps ?? defaultSteps[language]} />}
    </>
  );
}

function StoryParagraphs({ content }: { content: IntroContent })
{
  return (
    <div className="pattern-story">
      {content.paragraphs.map((paragraph, index) =>
      {
        const portrait = content.paragraphPortraits?.[index];
        if (!portrait)
        {
          return <p key={index}>{paragraph}</p>;
        }
        return (
          <p key={index} className="pattern-story-dialogue">
            <img
              className="pattern-story-avatar"
              src={portrait.src}
              alt=""
              loading="lazy"
              style={{ objectPosition: `50% ${portrait.framing ?? 50}%` }}
            />
            <span>{paragraph}</span>
          </p>
        );
      })}
    </div>
  );
}

function StorySteps({ steps }: { steps: readonly string[] })
{
  const language = useLanguage();
  return (
    <div className="pattern-steps" aria-label={localize(language, 'How to play', 'Как работать с уроком')}>
      {steps.map((step, index) => <span key={index}><b>{index + 1}</b> {step}</span>)}
    </div>
  );
}
