import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050B16] px-6 text-center">
          <div>
            <p className="eyebrow mb-4">Godavari Wave Technologies</p>
            <h1 className="font-display text-3xl font-bold text-white">Something went wrong</h1>
            <button
              data-testid="error-reload-button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-6 py-3 font-semibold text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
