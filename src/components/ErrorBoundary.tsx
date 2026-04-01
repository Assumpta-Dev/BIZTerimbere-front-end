import React from "react";

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFE] px-6">
          <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-3">Something went wrong</p>
            <h1 className="text-xl font-bold text-rose-700 mb-2">App crashed</h1>
            <p className="text-sm text-rose-600 mb-6 font-mono bg-rose-100 rounded-lg px-3 py-2">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-[#0E514F] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
