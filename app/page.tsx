'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Star, ChevronRight, Zap } from 'lucide-react'

const apps = [
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
    accent: 'from-green-600 to-emerald-500',
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
    accent: 'from-blue-600 to-cyan-500',
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
    accent: 'from-purple-600 to-violet-500',
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
    accent: 'from-pink-600 to-rose-500',
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
    accent: 'from-orange-600 to-amber-500',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">Agora</span>
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
        </div>
      </section>

      {/* App Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">All Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => router.push(`/tools/${app.id}`)}
              className="group text-left bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-zinc-900 transition-all duration-200 cursor-pointer"
            >
              {/* Icon + Category */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{app.icon}</div>
                <span className={`text-xs font-medium text-white px-2.5 py-1 rounded-full ${app.categoryColor}`}>
                  {app.category}
                </span>
              </div>

              {/* Name + Tagline */}
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{app.name}</h3>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">{app.tagline}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={app.rating} />
                <span className="text-xs text-zinc-400">{app.rating} · {app.reviews} ratings</span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                {app.description}
              </p>

              {/* Specs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {app.specs.map((spec) => (
                  <span key={spec} className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {spec}
                  </span>
                ))}
              </div>

              {/* CTA */}
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

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-zinc-400">© Agora. Built for Learners.</p>
        </div>
      </footer>
    </div>
  )
}