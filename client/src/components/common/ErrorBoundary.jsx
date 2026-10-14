// by claude: if a component crashes, show a friendly screen instead of a blank page
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="max-w-md text-gray-500">
          An unexpected error happened. Please reload the page, and if the
          problem continues try again in a few minutes.
        </p>
        <button
          onClick={() => window.location.assign("/")}
          className="cursor-pointer rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
        >
          Back to home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
