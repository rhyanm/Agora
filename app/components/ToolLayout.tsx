'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, RotateCcw, Paperclip, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AttachedFile {
  name: string
  mimeType: string
  data: string
  isImage: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  files?: AttachedFile[]
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

function parseOptions(content: string): { cleanContent: string; options: string[] } {
  const options: string[] = []
  const cleanContent = content.replace(/\[OPTION:\s*([^\]]+)\]/g, (_, opt) => {
    options.push(opt.trim())
    return ''
  }).trim()
  return { cleanContent, options }
}

const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json', 'text/javascript', 'text/typescript',
]

export default function ToolLayout({
  name,
  tagline,
  icon,
  systemPrompt,
  placeholder,
  starterPrompts = [],
}: ToolLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function reset() {
    setMessages([])
    setStarted(false)
    setInput('')
    setAttachedFiles([])
  }

  function processFiles(files: File[]) {
    files.forEach(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) return
      const isImage = file.type.startsWith('image/')
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        const data = isImage ? result.split(',')[1] : result
        setAttachedFiles(prev => [...prev, { name: file.name, mimeType: file.type, data, isImage }])
      }
      if (isImage) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files))
  }

  function removeFile(index: number) {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function send(text?: string) {
    const content = text || input.trim()
    if ((!content && attachedFiles.length === 0) || loading) return

    const userMessage: Message = { role: 'user', content: content || '', files: attachedFiles.length > 0 ? [...attachedFiles] : undefined }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setAttachedFiles([])
    setLoading(true)
    setStarted(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, systemPrompt }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.text || 'Something went wrong. Please try again.' }])
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

  const canSend = (input.trim().length > 0 || attachedFiles.length > 0) && !loading

  return (
    <div
      className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-500/10 border-2 border-dashed border-indigo-400 rounded-none flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-8 py-6 shadow-xl text-center">
            <p className="text-2xl mb-2">📎</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Drop files here</p>
            <p className="text-xs text-zinc-400 mt-1">Images, text, CSV, JSON</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
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
            <div className="text-6xl mb-6">{icon}</div>
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
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end flex-col items-end gap-2">
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end max-w-[80%]">
                        {msg.files.map((f, fi) => (
                          f.isImage ? (
                            <img
                              key={fi}
                              src={`data:${f.mimeType};base64,${f.data}`}
                              alt={f.name}
                              className="max-h-48 max-w-xs rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                            />
                          ) : (
                            <div key={fi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              <Paperclip size={11} />
                              {f.name}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                    {msg.content && (
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-indigo-500 text-white">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )
              }

              const { cleanContent, options } = parseOptions(msg.content)
              return (
                <div key={i} className="flex justify-start flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-1 flex-shrink-0">{icon}</span>
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-pre:bg-zinc-200 dark:prose-pre:bg-zinc-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cleanContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {options.length > 0 && (
                    <div className="ml-10 flex flex-wrap gap-2">
                      {options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => send(opt)}
                          className="text-xs px-3 py-1.5 rounded-full border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
          {/* File chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                  {f.isImage ? (
                    <img src={`data:${f.mimeType};base64,${f.data}`} alt={f.name} className="w-4 h-4 rounded object-cover" />
                  ) : (
                    <Paperclip size={11} />
                  )}
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-0.5">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.gif,.webp,.txt,.md,.csv,.json,.js,.ts"
              className="hidden"
              onChange={handleFileInput}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
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
              disabled={!canSend}
              className="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 text-center mt-2">Press Enter to send · Shift+Enter for new line · Drop files anywhere</p>
        </div>
      </div>
    </div>
  )
}
