import { Component, type ReactNode } from 'react';
import { ErrorState } from './States';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  // TODO: report to monitoring once one is chosen (componentDidCatch). Never log tokens.
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="mx-auto max-w-xl p-6"><ErrorState message="The page hit an unexpected problem." onRetry={() => window.location.reload()} /></div>;
  }
}
