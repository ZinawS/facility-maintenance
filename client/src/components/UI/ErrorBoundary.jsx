import React from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          An unexpected error occurred. Try reloading the page — if it keeps happening, please contact us.
        </p>
        <Button
          onClick={() => window.location.assign("/")}
          className="bg-primary text-white px-6 py-3 rounded-full font-semibold"
        >
          Back to Home
        </Button>
      </div>
    );
  }
}

export default ErrorBoundary;
