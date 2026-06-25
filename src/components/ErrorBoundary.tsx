import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render-time crashes so an API/parse bug shows a fallback, not a blank page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fallback">
          <h1>Something broke</h1>
          <p>The profile card hit an unexpected error.</p>
          <button onClick={() => location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
