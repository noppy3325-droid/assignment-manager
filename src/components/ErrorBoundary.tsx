import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen grid place-items-center p-6"><div className="m3-card max-w-md space-y-5">
      <h1 className="text-xl font-bold">画面を読み込めませんでした</h1><p>保存済みの課題は保持されています。再読み込みしてもう一度お試しください。</p>
      <button className="m3-button-primary" onClick={() => location.reload()}>再読み込み</button>
    </div></main>;
    return this.props.children;
  }
}
