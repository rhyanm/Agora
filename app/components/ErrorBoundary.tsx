'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md font-mono bg-zinc-100 dark:bg-zinc-900 px-4 py-3 rounded-xl">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
          >
            Go back home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
