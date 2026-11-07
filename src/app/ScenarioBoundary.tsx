import { Component, type ReactNode } from 'react';
/** A failed lesson cannot take down the navigation or its neighboring lessons. */
export class ScenarioBoundary extends Component<{ children: ReactNode; name: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="scenario-error" role="alert">
      <h2>{this.props.name} could not be displayed</h2>
      <p>You can still open another scenario. Retrying starts this lesson again.</p>
      <button onClick={() => this.setState({ failed: false })}>Retry this scenario</button>
    </div>;
    return this.props.children;
  }
}
