'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useApps, CustomApp } from '@/app/context/AppsContext'
import ToolLayout from '@/app/components/ToolLayout'

export default function CustomAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { customApps } = useApps()
  const [app, setApp] = useState<CustomApp | null | undefined>(undefined)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    const found = customApps.find(a => a.id === id)
    setApp(found ?? null)
  }, [user, customApps, id, router])

  if (app === undefined) return null

  if (app === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">App not found.</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold">
            Go home
          </button>
        </div>
      </div>
    )
  }

  return (
    <ToolLayout
      name={app.name}
      tagline={app.tagline}
      icon={app.icon}
      accent="from-indigo-600 to-purple-500"
      systemPrompt={app.systemPrompt}
      placeholder={`Ask ${app.name} anything...`}
      starterPrompts={[]}
    />
  )
}
