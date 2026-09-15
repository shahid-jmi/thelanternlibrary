import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import i18n from '@/i18n';
import PageFrame from '@/app/components/PageFrame';
import { Button } from '@/app/components/ui';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageFrame compact>
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
            <h1 className="text-xl tracking-[0.05em]">{i18n.t('error.boundaryHeading')}</h1>
            <p className="max-w-sm text-sm opacity-70">{i18n.t('error.boundarySubtext')}</p>
            <Button onClick={() => window.location.reload()}>{i18n.t('error.reload')}</Button>
          </div>
        </PageFrame>
      );
    }
    return this.props.children;
  }
}
