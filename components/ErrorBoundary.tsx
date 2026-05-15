"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 bg-white rounded-xl border border-zinc-200">
            <div className="text-xl font-black text-red-600">Algo deu errado</div>
            <div className="text-sm text-zinc-500 mt-2 text-center max-w-md">
              Ocorreu um erro ao calcular compatibilidade. Recarregue a página ou limpe a configuração e tente novamente.
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-5 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

