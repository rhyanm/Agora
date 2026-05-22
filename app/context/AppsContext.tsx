'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface CustomApp {
  id: string
  name: string
  icon: string
  tagline: string
  description: string
  systemPrompt: string
  createdAt: string
  userId: string
}

interface AppsContextType {
  customApps: CustomApp[]
  saveApp: (app: Omit<CustomApp, 'id' | 'createdAt' | 'userId'>) => CustomApp | null
  deleteApp: (id: string) => void
}

const AppsContext = createContext<AppsContextType>({
  customApps: [],
  saveApp: () => null,
  deleteApp: () => {},
})

export function AppsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [customApps, setCustomApps] = useState<CustomApp[]>([])

  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(`agora_apps_${user.id}`)
        if (stored) setCustomApps(JSON.parse(stored))
        else setCustomApps([])
      } catch { setCustomApps([]) }
    } else {
      setCustomApps([])
    }
  }, [user])

  function saveApp(app: Omit<CustomApp, 'id' | 'createdAt' | 'userId'>) {
    if (!user) return null
    const newApp: CustomApp = {
      ...app,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      userId: user.id,
    }
    const updated = [...customApps, newApp]
    setCustomApps(updated)
    localStorage.setItem(`agora_apps_${user.id}`, JSON.stringify(updated))
    return newApp
  }

  function deleteApp(id: string) {
    if (!user) return
    const updated = customApps.filter(a => a.id !== id)
    setCustomApps(updated)
    localStorage.setItem(`agora_apps_${user.id}`, JSON.stringify(updated))
  }

  return (
    <AppsContext.Provider value={{ customApps, saveApp, deleteApp }}>
      {children}
    </AppsContext.Provider>
  )
}

export function useApps() {
  return useContext(AppsContext)
}
