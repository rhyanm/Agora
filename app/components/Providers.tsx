'use client'

import { AuthProvider } from '@/app/context/AuthContext'
import { AppsProvider } from '@/app/context/AppsContext'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppsProvider>
          {children}
        </AppsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
