import { useEffect, useState } from 'react';
import { scenarios } from '../scenarios/registry';
import { LanguageContext, localize, type Language } from '../scenarios/shared/language';
import { ScenarioBoundary } from './ScenarioBoundary';
import './shell.css';

const languageStorageKey = 'pattern-workshop-language';

function readLanguage(): Language
{
  try
  {
    return window.localStorage.getItem(languageStorageKey) === 'ru' ? 'ru' : 'en';
  }
  catch
  {
    return 'en';
  }
}

export default function App()
{
  const [language, setLanguage] = useState(readLanguage);
  const [activeId, setActiveId] = useState<string>(scenarios[0]!.id);
  const [visited, setVisited] = useState<string[]>([scenarios[0]!.id]);
  const nextLanguage = language === 'en' ? 'ru' : 'en';
  const navigation = scenarios.map(scenario => ({
    ...scenario,
    ...language === 'ru' && scenario.russian,
  }));

  useEffect(() =>
  {
    document.documentElement.lang = language;
    document.title = localize(language, 'Pattern Workshop · Design patterns', 'Мастерская паттернов · Паттерны проектирования');
    document.querySelector('meta[name="description"]')?.setAttribute('content', localize(language,
      'Learn design patterns through independent scenarios, class diagrams, and interactive demonstrations.',
      'Изучайте паттерны проектирования на примерах с диаграммами классов и интерактивными демонстрациями.',
    ));
  }, [language]);

  function switchLanguage()
  {
    setLanguage(nextLanguage);
    try
    {
      window.localStorage.setItem(languageStorageKey, nextLanguage);
    }
    catch
    {
      // Язык можно переключать и при отключённом локальном хранилище.
    }
  }

  function selectScenario(id: string)
  {
    setActiveId(id);
    setVisited(ids => ids.includes(id) ? ids : [...ids, id]);
  }

  return (
    <LanguageContext.Provider value={language}>
      <div className="workshop-app">
        <a className="skip-link" href="#lesson-main">{localize(language, 'Skip to lesson', 'Перейти к уроку')}</a>
        <header className="workshop-header">
          <div className="workshop-brand">
            <span aria-hidden="true">⌘</span>
            <strong>{localize(language, 'Pattern Workshop', 'Мастерская паттернов')}</strong>
          </div>
          <div className="workshop-header-controls">
            <label className="scenario-picker">
              {localize(language, 'Scenario', 'Сценарий')}
              <select value={activeId} onChange={event => selectScenario(event.target.value)}>
                {navigation.map(scenario => <option key={scenario.id} value={scenario.id}>{scenario.pattern}</option>)}
              </select>
            </label>
            <button type="button" className="language-switch" lang={nextLanguage} onClick={switchLanguage}>
              {nextLanguage === 'ru' ? 'Русский' : 'English'}
            </button>
          </div>
        </header>
        <nav className="scenario-navigation" aria-label={localize(language, 'Scenarios', 'Сценарии')}>
          {navigation.map(scenario => (
            <button
              key={scenario.id}
              aria-current={activeId === scenario.id ? 'page' : undefined}
              aria-controls={`scenario-${scenario.id}`}
              onClick={() => selectScenario(scenario.id)}
            >
              <strong>{scenario.pattern}</strong>
              <span>{scenario.title}</span>
            </button>
          ))}
        </nav>
        <main id="lesson-main" tabIndex={-1}>
          {navigation.filter(scenario => visited.includes(scenario.id)).map(({ id, title, Component }) => (
            <section key={id} id={`scenario-${id}`} hidden={id !== activeId} aria-label={title}>
              <ScenarioBoundary name={title}><Component active={id === activeId} /></ScenarioBoundary>
            </section>
          ))}
        </main>
        <footer className="workshop-footer">
          <span>{localize(language, 'One situation. One pattern. Build the idea.', 'Одна ситуация. Один паттерн. Попробуйте применить его на практике.')}</span>
          <span>{localize(language, 'Switch freely. Progress resets when you reload.', 'Переключайтесь между сценариями. Прогресс сбрасывается при перезагрузке страницы.')}</span>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
