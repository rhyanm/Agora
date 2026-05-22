'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, RotateCcw, Paperclip, X, Save, Download, LogIn } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/app/context/AuthContext'
import { useApps } from '@/app/context/AppsContext'
import { generateAppDownload } from '@/app/lib/generateAppDownload'

interface AttachedFile {
  name: string
  mimeType: string
  data: string
  isImage: boolean
  isPdf: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  files?: AttachedFile[]
}

interface ForgeApp {
  name: string
  icon: string
  tagline: string
  description: string
  systemPrompt: string
}

interface ToolLayoutProps {
  name: string
  tagline: string
  icon: string
  accent: string
  systemPrompt: string
  placeholder: string
  starterPrompts?: string[]
  isForge?: boolean
}

function parseOptions(content: string): { cleanContent: string; options: string[] } {
  const options: string[] = []
  const cleanContent = content.replace(/\[OPTION:\s*([^\]]+)\]/g, (_, opt) => {
    options.push(opt.trim())
    return ''
  }).trim()
  return { cleanContent, options }
}

function parseForgeApp(content: string): ForgeApp | null {
  const match = content.match(/```json\s+forge-app\s*([\s\S]*?)```/i)
    || content.match(/```forge-app\s*([\s\S]*?)```/i)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim())
  } catch { return null }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] || result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const TEXT_TYPES = ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'text/css', 'text/javascript',
  'text/typescript', 'application/json', 'application/xml', 'application/javascript']

export default function ToolLayout({
  name,
  tagline,
  icon,
  systemPrompt,
  placeholder,
  starterPrompts = [],
  isForge = false,
}: ToolLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [detectedForgeApp, setDetectedForgeApp] = useState<ForgeApp | null>(null)
  const [forgeSaved, setForgeSaved] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { saveApp } = useApps()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function reset() {
    setMessages([])
    setStarted(false)
    setInput('')
    setAttachedFiles([])
    setSelectedOptions([])
    setDetectedForgeApp(null)
    setForgeSaved(false)
  }

  const processFiles = useCallback(async (files: File[]) => {
    const processed: AttachedFile[] = []
    for (const file of files) {
      const isImage = IMAGE_TYPES.includes(file.type)
      const isPdf = file.type === 'application/pdf'
      const isText = TEXT_TYPES.includes(file.type) || file.name.match(/\.(txt|md|csv|json|js|ts|tsx|jsx|html|css|xml|yaml|yml|toml|ini|sh|py|rb|go|rs|java|kt|swift|sql|graphql)$/i)

      try {
        if (isImage || isPdf) {
          const data = await readFileAsBase64(file)
          processed.push({ name: file.name, mimeType: file.type, data, isImage, isPdf })
        } else if (isText) {
          const data = await readFileAsText(file)
          processed.push({ name: file.name, mimeType: file.type || 'text/plain', data, isImage: false, isPdf: false })
        } else {
          // Try reading as text, fall back to base64
          try {
            const data = await readFileAsText(file)
            processed.push({ name: file.name, mimeType: file.type || 'application/octet-stream', data, isImage: false, isPdf: false })
          } catch {
            const data = await readFileAsBase64(file)
            processed.push({ name: file.name, mimeType: file.type || 'application/octet-stream', data, isImage: false, isPdf: false })
          }
        }
      } catch (err) {
        console.warn(`Could not process ${file.name}:`, err)
      }
    }
    setAttachedFiles(prev => [...prev, ...processed])
  }, [])

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

  function toggleOption(opt: string) {
    setSelectedOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  function clearSelectedOptions() {
    setSelectedOptions([])
  }

  async function send(text?: string) {
    let content: string
    if (text !== undefined) {
      content = text
    } else {
      const parts: string[] = []
      if (selectedOptions.length > 0) parts.push(selectedOptions.join(', '))
      if (input.trim()) parts.push(input.trim())
      content = parts.join('\n')
    }

    if ((!content && attachedFiles.length === 0) || loading) return

    const userMessage: Message = {
      role: 'user',
      content: content || '',
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setAttachedFiles([])
    setSelectedOptions([])
    setLoading(true)
    setStarted(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, systemPrompt }),
      })
      const data = await res.json()

      let assistantContent: string
      if (data.error) {
        assistantContent = `**Something went wrong.**\n\nError details: ${data.error}\n\nFeel free to ask me what this error means or how to fix it.`
      } else {
        assistantContent = data.text || 'No response received.'
      }

      setMessages([...newMessages, { role: 'assistant', content: assistantContent }])

      // Detect Forge app in response
      if (isForge) {
        const app = parseForgeApp(assistantContent)
        if (app) setDetectedForgeApp(app)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setMessages([...newMessages, {
        role: 'assistant',
        content: `**Network error.** Could not reach the server.\n\nDetails: ${errMsg}\n\nCheck your connection and try again, or ask me what this means.`,
      }])
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

  function handleSaveForgeApp() {
    if (!detectedForgeApp || !user) return
    const saved = saveApp({
      name: detectedForgeApp.name,
      icon: detectedForgeApp.icon,
      tagline: detectedForgeApp.tagline,
      description: detectedForgeApp.description,
      systemPrompt: detectedForgeApp.systemPrompt,
    })
    if (saved) {
      setForgeSaved(true)
    }
  }

  function handleDownloadForgeApp() {
    if (!detectedForgeApp) return
    generateAppDownload({
      id: 'preview',
      name: detectedForgeApp.name,
      icon: detectedForgeApp.icon,
      tagline: detectedForgeApp.tagline,
      description: detectedForgeApp.description,
      systemPrompt: detectedForgeApp.systemPrompt,
      createdAt: new Date().toISOString(),
      userId: user?.id || 'anon',
    })
  }

  const canSend = (input.trim().length > 0 || attachedFiles.length > 0 || selectedOptions.length > 0) && !loading

  return (
    <div
      className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-500/10 border-2 border-dashed border-indigo-400 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-8 py-6 shadow-xl text-center">
            <p className="text-2xl mb-2">📎</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Drop files here</p>
            <p className="text-xs text-zinc-400 mt-1">Any file type accepted</p>
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
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-indigo-500 text-white whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )
              }

              const { cleanContent, options } = parseOptions(msg.content)
              const isLastAssistant = i === messages.length - 1 && msg.role === 'assistant'
              const forgeApp = isForge ? parseForgeApp(msg.content) : null

              // Strip the forge-app code block from display
              const displayContent = forgeApp
                ? cleanContent.replace(/```json\s+forge-app[\s\S]*?```/gi, '').replace(/```forge-app[\s\S]*?```/gi, '').trim()
                : cleanContent

              return (
                <div key={i} className="flex justify-start flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-1 flex-shrink-0">{icon}</span>
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayContent}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Forge app save banner */}
                  {forgeApp && isLastAssistant && (
                    <div className="ml-10 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{forgeApp.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">{forgeApp.name} is ready</p>
                          <p className="text-xs text-zinc-500">{forgeApp.tagline}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user ? (
                          <>
                            <button
                              onClick={handleSaveForgeApp}
                              disabled={forgeSaved}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-green-500 text-white text-xs font-semibold transition-colors"
                            >
                              <Save size={12} />
                              {forgeSaved ? 'Saved to My Apps!' : 'Save to My Apps'}
                            </button>
                            <button
                              onClick={handleDownloadForgeApp}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-xs font-semibold transition-colors"
                            >
                              <Download size={12} />
                              Download for desktop
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleDownloadForgeApp}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
                            >
                              <Download size={12} />
                              Download for desktop
                            </button>
                            <button
                              onClick={() => router.push('/auth/signup')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-xs font-semibold transition-colors"
                            >
                              <LogIn size={12} />
                              Sign up to save
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option buttons — multi-select */}
                  {options.length > 0 && (
                    <div className="ml-10 flex flex-col gap-2">
                      <p className="text-xs text-zinc-400">Select one or more, then add context below and press send:</p>
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt, oi) => {
                          const isSelected = selectedOptions.includes(opt)
                          return (
                            <button
                              key={oi}
                              onClick={() => toggleOption(opt)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                isSelected
                                  ? 'bg-indigo-500 border-indigo-500 text-white'
                                  : 'border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
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

          {/* Selected options chips */}
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-zinc-400">Selected:</span>
              {selectedOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                  {opt}
                  <button onClick={() => toggleOption(opt)} className="ml-0.5 opacity-60 hover:opacity-100">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={clearSelectedOptions} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                Clear
              </button>
            </div>
          )}

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
              accept="*"
              className="hidden"
              onChange={handleFileInput}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Attach file (any type)"
            >
              <Paperclip size={16} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedOptions.length > 0 ? 'Add more context (optional)...' : placeholder}
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
          <p className="text-xs text-zinc-400 text-center mt-2">Enter to send · Shift+Enter for new line · Drop files anywhere</p>
        </div>
      </div>
    </div>
  )
}
