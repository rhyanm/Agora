'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, RotateCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ToolLayoutProps {
  name: string
  tagline: string
  icon: string
  accent: string
  systemPrompt: string
  placeholder: string
  starterPrompts?: string[]
}

export default function ToolLayout({
  name,
  tagline,
  icon,
  accent: _accent,
  systemPrompt,
  placeholder,
  starterPrompts = [],
}: ToolLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function reset() {
    setMessages([])
    setStarted(false)
    setInput('')
  }

  async function send(text?: string) {
    const content = text || input.trim()
    if (!content || loading) return

    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStarted(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt,
        }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.text }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Agora</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">{name}</p>
              <p className="text-xs text-zinc-400 leading-none mt-0.5">{tagline}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col">

        {/* Empty state */}
        {!started && (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-32">
            <div className={`text-6xl mb-6`}>{icon}</div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-md">{tagline}</p>
            {starterPrompts.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-md">
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Try these</p>
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => send(prompt)}
                    className="text-sm text-left px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {started && (
          <div className="flex-1 flex flex-col gap-6 pb-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="text-lg mr-3 mt-1 flex-shrink-0">{icon}</span>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-sm border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <span className="text-lg mr-3 mt-1">{icon}</span>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <Loader2 size={16} className="animate-spin text-zinc-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="flex-1 resize-none bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors min-h-[46px] max-h-40"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = t.scrollHeight + 'px'
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} className="text-white disabled:text-zinc-400" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}