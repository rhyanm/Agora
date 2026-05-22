'use client'

import { AuthProvider } from '@/app/context/AuthContext'
import { AppsProvider } from '@/app/context/AppsContext'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppsProvider>
        {children}
      </AppsProvider>
    </AuthProvider>
  )
}
