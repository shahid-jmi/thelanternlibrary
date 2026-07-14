import { Component, type ReactNode } from 'react';
import PageFrame from './PageFrame';
import StatusMessage from './StatusMessage';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { message: string }> {
  state = { message: '' };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'The app hit an unexpected error.' };
  }

  render() {
    if (this.state.message) {
      return (
        <PageFrame compact>
          <StatusMessage tone="error">{this.state.message}</StatusMessage>
        </PageFrame>
      );
    }
    return this.props.children;
  }
}
