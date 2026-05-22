import { NextRequest, NextResponse } from 'next/server'

function generateStandaloneHTML(name: string, icon: string, tagline: string, systemPrompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .prose-sm p { margin: 0.25rem 0; }
    .prose-sm ul { margin: 0.25rem 0; padding-left: 1.25rem; }
    .prose-sm li { margin: 0.1rem 0; }
    .prose-sm h1,.prose-sm h2,.prose-sm h3 { font-weight: 700; margin: 0.5rem 0 0.25rem; }
    .prose-sm code { background: rgba(0,0,0,.07); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.85em; }
    .prose-sm pre { background: rgba(0,0,0,.07); padding: 0.75rem; border-radius: 8px; overflow-x: auto; }
    .prose-sm strong { font-weight: 700; }
    .prose-sm em { font-style: italic; }
    @media (prefers-color-scheme: dark) {
      .prose-sm code { background: rgba(255,255,255,.1); }
      .prose-sm pre { background: rgba(255,255,255,.08); }
    }
    #messages { scroll-behavior: smooth; }
    textarea { field-sizing: content; }
  </style>
</head>
<body class="bg-white dark:bg-zinc-950 min-h-screen flex flex-col" id="app">
<script>
  // Theme
  try {
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))
      document.documentElement.classList.add('dark');
  } catch(e) {}

  const APP_NAME = ${JSON.stringify(name)};
  const APP_ICON = ${JSON.stringify(icon)};
  const APP_TAGLINE = ${JSON.stringify(tagline)};
  const SYSTEM_PROMPT = ${JSON.stringify(systemPrompt)};

  let messages = [];
  let loading = false;

  function getApiKey() { return localStorage.getItem('agora_api_key') || ''; }
  function setApiKey(k) { localStorage.setItem('agora_api_key', k); }

  function render() {
    const apiKey = getApiKey();
    if (!apiKey) { renderSetup(); return; }
    renderChat();
  }

  function renderSetup() {
    document.getElementById('app').innerHTML = \`
      <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-zinc-950">
        <div class="w-full max-w-sm text-center">
          <div class="text-5xl mb-4">\${APP_ICON}</div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white mb-2">\${APP_NAME}</h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8">\${APP_TAGLINE}</p>
          <div class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-left">
            <p class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">One-time setup</p>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-4">Enter your Anthropic API key to power this app. It&apos;s stored only on your device.</p>
            <label class="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">API Key</label>
            <input id="key-input" type="password" placeholder="sk-ant-..." class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-400 mb-4" />
            <button onclick="submitKey()" class="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors">Start using \${APP_NAME}</button>
            <p class="text-xs text-zinc-400 mt-3 text-center"><a href="https://console.anthropic.com" target="_blank" class="underline">Get an API key at console.anthropic.com</a></p>
          </div>
        </div>
      </div>
    \`;
    document.getElementById('key-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitKey(); });
  }

  function submitKey() {
    const k = document.getElementById('key-input').value.trim();
    if (!k.startsWith('sk-')) { alert('Please enter a valid Anthropic API key.'); return; }
    setApiKey(k);
    render();
  }

  function renderChat() {
    document.getElementById('app').innerHTML = \`
      <div class="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
        <header class="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div class="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xl">\${APP_ICON}</span>
              <div>
                <p class="text-sm font-bold text-zinc-900 dark:text-white leading-none">\${APP_NAME}</p>
                <p class="text-xs text-zinc-400 leading-none mt-0.5">\${APP_TAGLINE}</p>
              </div>
            </div>
            <button onclick="resetChat()" class="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Reset</button>
          </div>
        </header>
        <main class="flex-1 max-w-3xl w-full mx-auto px-6 py-8" id="chat-main">
          <div id="messages" class="flex flex-col gap-6 pb-4"></div>
          <div id="empty-state" class="flex flex-col items-center justify-center text-center py-20">
            <div class="text-6xl mb-6">\${APP_ICON}</div>
            <h1 class="text-2xl font-bold text-zinc-900 dark:text-white mb-2">\${APP_NAME}</h1>
            <p class="text-zinc-500 dark:text-zinc-400 max-w-md">\${APP_TAGLINE}</p>
          </div>
        </main>
        <div class="sticky bottom-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
          <div class="max-w-3xl mx-auto px-6 py-4">
            <div class="flex gap-3 items-end">
              <textarea id="chat-input" placeholder="Ask \${APP_NAME} anything..." rows="1"
                class="flex-1 resize-none bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 min-h-[46px] max-h-40 transition-colors"
                oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage();}"
              ></textarea>
              <button id="send-btn" onclick="sendMessage()" class="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 flex items-center justify-center transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <p class="text-xs text-zinc-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    \`;
    renderMessages();
  }

  function renderMessages() {
    const container = document.getElementById('messages');
    const empty = document.getElementById('empty-state');
    if (!container) return;
    if (messages.length === 0) { container.innerHTML = ''; if (empty) empty.style.display = 'flex'; return; }
    if (empty) empty.style.display = 'none';
    container.innerHTML = messages.map((m, i) => {
      if (m.role === 'user') {
        return \`<div class="flex justify-end"><div class="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-indigo-500 text-white whitespace-pre-wrap">\${escapeHtml(m.content)}</div></div>\`;
      }
      return \`<div class="flex justify-start gap-3"><span class="text-lg mt-1 flex-shrink-0">\${APP_ICON}</span><div class="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 prose-sm">\${simpleMarkdown(m.content)}</div></div>\`;
    }).join('') + (loading ? \`<div class="flex justify-start gap-3"><span class="text-lg mt-1">\${APP_ICON}</span><div class="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"><div class="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div></div></div>\` : '');
    container.scrollTop = container.scrollHeight;
    setTimeout(() => { container.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 50);
  }

  function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function simpleMarkdown(text) {
    return escapeHtml(text)
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/\`(.+?)\`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\\/li>\\n?)+/gs, s => '<ul>' + s + '</ul>')
      .replace(/\\n\\n/g, '</p><p>')
      .replace(/\\n/g, '<br>');
  }

  function resetChat() { messages = []; renderMessages(); }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || loading) return;
    messages.push({ role: 'user', content: text });
    input.value = '';
    input.style.height = 'auto';
    loading = true;
    renderMessages();

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': getApiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          tools: [{ type: 'web_search_20260209', name: 'web_search' }],
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error?.message || 'API error');
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\\n\\n');
      messages.push({ role: 'assistant', content: text || 'No response.' });
    } catch(e) {
      messages.push({ role: 'assistant', content: 'Error: ' + e.message + '. Check your API key in localStorage (key: agora_api_key).' });
    }
    loading = false;
    renderMessages();
  }

  document.addEventListener('DOMContentLoaded', render);
</script>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const appId = searchParams.get('id')

  if (!userId || !appId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // The client passes app data as search params for simplicity
  const name = searchParams.get('name') || 'My App'
  const icon = searchParams.get('icon') || '🔧'
  const tagline = searchParams.get('tagline') || 'Custom AI tool'
  const systemPrompt = searchParams.get('systemPrompt') || ''

  const html = generateStandaloneHTML(name, icon, tagline, systemPrompt)
  const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html'

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
