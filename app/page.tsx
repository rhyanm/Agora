'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Star, ChevronRight, Zap, Settings, User, LogOut, X, Download, Trash2 } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useApps } from '@/app/context/AppsContext'
import { generateAppDownload } from '@/app/lib/generateAppDownload'

const builtinApps = [
  {
    id: 'scout',
    name: 'Scout',
    tagline: 'Baseball & Sports Analytics',
    description: 'Paste stats, standings, or game data and get plain-English analysis, trends, and strategic insights — built for fans, analysts, and front office thinkers.',
    category: 'Sports',
    categoryColor: 'bg-green-500',
    icon: '⚾',
    rating: 4.9,
    reviews: '2.1K',
    specs: ['Statcast data analysis', 'Player comparison', 'Game strategy breakdown', 'Plain-English outputs'],
  },
  {
    id: 'distill',
    name: 'Distill',
    tagline: 'Data & Research Summarizer',
    description: 'Paste any block of text, research, or raw data. Distill extracts the key insights, patterns, and action items — structured and scannable in seconds.',
    category: 'Research',
    categoryColor: 'bg-blue-500',
    icon: '📄',
    rating: 4.8,
    reviews: '1.4K',
    specs: ['Key insight extraction', 'Pattern recognition', 'Structured output', 'Any content type'],
  },
  {
    id: 'clause',
    name: 'Clause',
    tagline: 'Contract & Document Analyzer',
    description: 'Upload or paste any contract, agreement, or legal document. Clause breaks down what it means, flags risk areas, and highlights what to watch out for.',
    category: 'Legal',
    categoryColor: 'bg-purple-500',
    icon: '📋',
    rating: 4.7,
    reviews: '987',
    specs: ['Risk flag detection', 'Plain-English translation', 'Key terms highlighted', 'Clause-by-clause breakdown'],
  },
  {
    id: 'fitcheck',
    name: 'Fit Check',
    tagline: 'Outfit & Style Advisor',
    description: 'Describe what you\'re wearing or what\'s in your closet. Fit Check gives you expert styling advice, outfit combinations, and occasion-specific recommendations.',
    category: 'Lifestyle',
    categoryColor: 'bg-pink-500',
    icon: '👔',
    rating: 4.8,
    reviews: '3.2K',
    specs: ['Outfit pairing suggestions', 'Occasion matching', 'Style profile building', 'Seasonal recommendations'],
  },
  {
    id: 'forge',
    name: 'Forge',
    tagline: 'Custom AI Tool Builder',
    description: 'Tell Forge what you need. It interviews you to understand your use case, then builds a tailored AI tool spec and working prompt — ready to use immediately.',
    category: 'Builder',
    categoryColor: 'bg-orange-500',
    icon: '🔧',
    rating: 4.9,
    reviews: '756',
    specs: ['Conversational setup', 'Custom prompt generation', 'Use-case tailoring', 'Instant deployment'],
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={12} className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  )
}

export default function Home() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { customApps, deleteApp } = useApps()

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Sign in to save your apps and settings.</p>
                <div className="flex gap-2">
                  <button onClick={() => { setSidebarOpen(false); router.push('/auth/login') }} className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Sign in
                  </button>
                  <button onClick={() => { setSidebarOpen(false); router.push('/auth/signup') }} className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-semibold text-white transition-colors">
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="space-y-1">
              <button onClick={() => { setSidebarOpen(false); router.push('/settings') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left">
                <Settings size={16} className="text-zinc-400" />
                Settings
              </button>
              {user && (
                <button onClick={() => { setSidebarOpen(false); router.push('/settings?tab=apps') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left">
                  <span className="text-base leading-none">🔧</span>
                  My Apps
                  {customApps.length > 0 && (
                    <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-semibold">
                      {customApps.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Custom apps preview */}
            {user && customApps.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">Your Apps</p>
                <div className="space-y-1">
                  {customApps.slice(0, 5).map(app => (
                    <button
                      key={app.id}
                      onClick={() => { setSidebarOpen(false); router.push(`/tools/custom/${app.id}`) }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <span>{app.icon}</span>
                      <span className="truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Bottom actions */}
          <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark mode</span>
              <button onClick={toggleTheme} className={`relative w-10 h-5.5 rounded-full transition-colors ${dark ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} style={{height: '22px', width: '42px'}}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {user && (
              <button onClick={() => { logout(); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                <LogOut size={15} />
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">Agora</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="Open menu"
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User size={18} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-3 tracking-wide uppercase">Purpose-built AI</p>
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
            Tools that know<br />what they&apos;re doing.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Every app is spec&apos;d for a specific job. No guessing, no generic chatbot. Pick your tool, describe your situation, get a confident answer.
          </p>
          {!user && (
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => router.push('/auth/signup')} className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors">
                Create free account
              </button>
              <button onClick={() => router.push('/auth/login')} className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                Sign in
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Custom apps section */}
      {user && customApps.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Your Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customApps.map(app => (
              <div key={app.id} className="group relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-zinc-900 transition-all duration-200">
                <button
                  onClick={() => router.push(`/tools/custom/${app.id}`)}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={`Open ${app.name}`}
                />
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{app.icon}</div>
                  <span className="text-xs font-medium text-white px-2.5 py-1 rounded-full bg-indigo-500">Custom</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{app.name}</h3>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">{app.tagline}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">{app.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        generateAppDownload(app)
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title="Download as desktop app"
                    >
                      <Download size={13} />
                      Save to desktop
                    </button>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this app?')) deleteApp(app.id) }}
                      className="p-1 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="flex items-center gap-1 text-zinc-400 group-hover:text-indigo-500 transition-colors">
                      <span className="text-xs font-medium">Open</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Built-in App Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">All Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtinApps.map((app) => (
            <button
              key={app.id}
              onClick={() => router.push(`/tools/${app.id}`)}
              className="group text-left bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-zinc-900 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{app.icon}</div>
                <span className={`text-xs font-medium text-white px-2.5 py-1 rounded-full ${app.categoryColor}`}>
                  {app.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{app.name}</h3>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">{app.tagline}</p>
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={app.rating} />
                <span className="text-xs text-zinc-400">{app.rating} · {app.reviews} ratings</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-3">{app.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {app.specs.map((spec) => (
                  <span key={spec} className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">Free</span>
                <div className="flex items-center gap-1 text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  <span className="text-xs font-medium">Open</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-zinc-400">© Agora. Built for Learners.</p>
          {!user && (
            <button onClick={() => router.push('/auth/signup')} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
              Sign up to save your work →
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
