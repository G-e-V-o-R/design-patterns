import { Component, type ReactNode } from 'react';
import { LanguageContext, localize, type Language } from '../scenarios/shared/language';

export class ScenarioBoundary extends Component<{ children: ReactNode; name: string }, { failed: boolean }>
{
  static contextType = LanguageContext;
  declare context: Language;
  state = { failed: false };

  static getDerivedStateFromError()
  {
    return { failed: true };
  }

  render()
  {
    if (this.state.failed)
    {
      const { name } = this.props;
      return (
        <div className="scenario-error" role="alert">
          <h2>{localize(this.context, `${name} could not be displayed`, `Не удалось открыть сценарий «${name}»`)}</h2>
          <p>{localize(this.context, 'You can still open another scenario. Retrying starts this lesson again.',
            'Вы можете открыть другой сценарий. Если повторить попытку, урок начнётся заново.')}</p>
          <button onClick={() => this.setState({ failed: false })}>
            {localize(this.context, 'Retry this scenario', 'Повторить попытку')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
