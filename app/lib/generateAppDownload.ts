import type { CustomApp } from '@/app/context/AppsContext'

export function generateAppDownload(app: CustomApp) {
  const html = buildStandaloneHTML(app.name, app.icon, app.tagline, app.description, app.systemPrompt)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html'
  a.click()
  URL.revokeObjectURL(url)
}

function buildStandaloneHTML(name: string, icon: string, tagline: string, description: string, systemPrompt: string): string {
  const escapedSystem = JSON.stringify(systemPrompt)
  const escapedName = JSON.stringify(name)
  const escapedIcon = JSON.stringify(icon)
  const escapedTagline = JSON.stringify(tagline)
  const escapedDesc = JSON.stringify(description)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .prose p { margin: 0.35rem 0; }
    .prose ul { padding-left: 1.25rem; margin: 0.35rem 0; }
    .prose li { margin: 0.1rem 0; }
    .prose h1,.prose h2,.prose h3 { font-weight: 700; margin: 0.6rem 0 0.3rem; }
    .prose code { background: rgba(0,0,0,.08); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.85em; font-family: monospace; }
    .prose pre { background: rgba(0,0,0,.08); padding: 0.75rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.85em; }
    .prose strong { font-weight: 700; }
    .prose em { font-style: italic; }
    .prose a { color: #6366f1; text-decoration: underline; }
    .prose blockquote { border-left: 3px solid #d4d4d8; padding-left: 1rem; color: #71717a; margin: 0.5rem 0; }
    .dark .prose code { background: rgba(255,255,255,.12); }
    .dark .prose pre { background: rgba(255,255,255,.08); }
    #scroll-anchor { height: 1px; }
  </style>
</head>
<body class="bg-white min-h-screen">
<div id="root"></div>
<script>
(function() {
  // Theme init
  try {
    var t = localStorage.getItem('theme_${name.replace(/\W/g, '')}');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-zinc-950');
      document.body.classList.remove('bg-white');
    }
  } catch(e) {}

  var APP_NAME = ${escapedName};
  var APP_ICON = ${escapedIcon};
  var APP_TAGLINE = ${escapedTagline};
  var APP_DESC = ${escapedDesc};
  var SYSTEM_PROMPT = ${escapedSystem};
  var THEME_KEY = 'theme_' + APP_NAME.replace(/\\W/g, '');
  var KEY_STORE = 'agora_apikey_' + APP_NAME.replace(/\\W/g, '');

  var messages = [];
  var loading = false;
  var dark = document.documentElement.classList.contains('dark');

  function apiKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch(e) { return ''; } }
  function saveKey(k) { try { localStorage.setItem(KEY_STORE, k); } catch(e) {} }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function md(text) {
    var s = esc(text);
    // Code blocks
    s = s.replace(/\`\`\`[\\s\\S]*?\`\`\`/g, function(m) {
      var code = m.replace(/^\`\`\`\\w*\\n?/, '').replace(/\`\`\`$/, '');
      return '<pre><code>' + code + '<\\/code><\\/pre>';
    });
    s = s.replace(/\`([^\`]+)\`/g, '<code>$1<\\/code>');
    s = s.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1<\\/strong>');
    s = s.replace(/\\*([^*]+)\\*/g, '<em>$1<\\/em>');
    s = s.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-3 mb-1">$1<\\/h3>');
    s = s.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-1">$1<\\/h2>');
    s = s.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1<\\/h1>');
    s = s.replace(/^- (.+)$/gm, '<li>$1<\\/li>');
    s = s.replace(/(<li>[\\s\\S]+?(?=<(?!li))|<li>[\\s\\S]+$)/g, function(m) {
      return m.includes('<li>') ? '<ul>' + m + '<\\/ul>' : m;
    });
    s = s.replace(/\\n\\n+/g, '<\\/p><p class="my-1">');
    s = s.replace(/\\n/g, '<br>');
    return '<p class="my-1">' + s + '<\\/p>';
  }

  function toggleDark() {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('bg-zinc-950', dark);
    document.body.classList.toggle('bg-white', !dark);
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch(e) {}
    renderMessages();
  }

  function showSetup() {
    document.getElementById('root').innerHTML = \`
<div class="min-h-screen flex flex-col items-center justify-center px-6 py-12 \${dark ? 'bg-zinc-950' : 'bg-white'}">
  <div class="w-full max-w-sm text-center">
    <div class="text-6xl mb-5">\${APP_ICON}</div>
    <h1 class="text-2xl font-bold \${dark ? 'text-white' : 'text-zinc-900'} mb-2">\${esc(APP_NAME)}</h1>
    <p class="text-sm \${dark ? 'text-zinc-400' : 'text-zinc-500'} mb-8">\${esc(APP_TAGLINE)}</p>
    <div class="\${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border rounded-2xl p-6 text-left">
      <p class="text-xs font-semibold \${dark ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-wider mb-3">One-time setup</p>
      <p class="text-sm \${dark ? 'text-zinc-300' : 'text-zinc-700'} mb-4">Enter your Anthropic API key to power this app. It&apos;s stored only on this device and never sent anywhere except Anthropic.</p>
      <label class="block text-xs font-medium \${dark ? 'text-zinc-300' : 'text-zinc-600'} mb-1.5">Anthropic API Key</label>
      <input id="key-in" type="password" placeholder="sk-ant-..." class="w-full px-3 py-2.5 rounded-xl border \${dark ? 'border-zinc-700 bg-zinc-800 text-white' : 'border-zinc-200 bg-white text-zinc-900'} text-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-400 mb-4" />
      <button onclick="submitKey()" class="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors">Get started</button>
      <p class="text-xs text-zinc-400 mt-3 text-center"><a href="https://console.anthropic.com" target="_blank" class="underline text-indigo-400">Get a key at console.anthropic.com</a></p>
    </div>
  </div>
</div>\`;
    var inp = document.getElementById('key-in');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitKey(); });
  }

  function submitKey() {
    var k = (document.getElementById('key-in').value || '').trim();
    if (!k.startsWith('sk-')) { alert('Please enter a valid Anthropic API key (starts with sk-).'); return; }
    saveKey(k);
    showChat();
  }

  function showChat() {
    document.getElementById('root').innerHTML = \`
<div class="min-h-screen flex flex-col \${dark ? 'bg-zinc-950' : 'bg-white'}">
  <header class="sticky top-0 z-40 border-b \${dark ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'} backdrop-blur-md">
    <div class="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-xl">\${APP_ICON}</span>
        <div>
          <p class="text-sm font-bold \${dark ? 'text-white' : 'text-zinc-900'} leading-none">\${esc(APP_NAME)}</p>
          <p class="text-xs text-zinc-400 leading-none mt-0.5">\${esc(APP_TAGLINE)}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleDark()" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors" title="Toggle theme">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
        <button onclick="resetChat()" class="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Reset</button>
      </div>
    </div>
  </header>
  <main class="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
    <div id="msg-list" class="flex flex-col gap-6 pb-4"></div>
    <div id="empty" class="flex flex-col items-center justify-center text-center py-20">
      <div class="text-6xl mb-6">\${APP_ICON}</div>
      <h1 class="text-2xl font-bold \${dark ? 'text-white' : 'text-zinc-900'} mb-2">\${esc(APP_NAME)}</h1>
      <p class="\${dark ? 'text-zinc-400' : 'text-zinc-500'} max-w-md text-sm">\${esc(APP_DESC || APP_TAGLINE)}</p>
    </div>
    <div id="scroll-anchor"></div>
  </main>
  <div class="sticky bottom-0 \${dark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-zinc-200'} backdrop-blur-md border-t">
    <div class="max-w-3xl mx-auto px-6 py-4">
      <div class="flex gap-3 items-end">
        <textarea id="chat-in" placeholder="Ask \${esc(APP_NAME)} anything..." rows="1"
          class="flex-1 resize-none \${dark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-3 text-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-400 min-h-[46px] max-h-40 transition-colors"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg();}"
        ></textarea>
        <button id="send-btn" onclick="sendMsg()" class="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <p class="text-xs text-zinc-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
    </div>
  </div>
</div>\`;
    renderMessages();
  }

  function renderMessages() {
    var list = document.getElementById('msg-list');
    var empty = document.getElementById('empty');
    if (!list) return;
    if (messages.length === 0) {
      list.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    list.innerHTML = messages.map(function(m) {
      if (m.role === 'user') {
        return '<div class="flex justify-end"><div class="max-w-prose px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-indigo-500 text-white whitespace-pre-wrap">' + esc(m.content) + '<\\/div><\\/div>';
      }
      return '<div class="flex justify-start gap-3"><span class="text-lg mt-1 flex-shrink-0">' + APP_ICON + '<\\/span><div class=\\"max-w-prose px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed ' + (dark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800') + ' border prose\\">' + md(m.content) + '<\\/div><\\/div>';
    }).join('') + (loading ? '<div class="flex justify-start gap-3"><span class="text-lg mt-1">' + APP_ICON + '<\\/span><div class="px-4 py-3 rounded-2xl rounded-bl-sm ' + (dark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200') + ' border"><div class="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full spin"><\\/div><\\/div><\\/div>' : '');
    setTimeout(function() {
      var anchor = document.getElementById('scroll-anchor');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }

  function resetChat() { messages = []; renderMessages(); }

  async function sendMsg() {
    var inp = document.getElementById('chat-in');
    if (!inp) return;
    var text = inp.value.trim();
    if (!text || loading) return;
    messages.push({ role: 'user', content: text });
    inp.value = ''; inp.style.height = 'auto';
    loading = true; renderMessages();
    try {
      var resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.slice(0, -1).concat([{ role: 'user', content: text }]).map(function(m) { return { role: m.role, content: m.content }; }),
          tools: [{ type: 'web_search_20260209', name: 'web_search' }],
        }),
      });
      var data = await resp.json();
      if (!resp.ok) throw new Error((data.error && data.error.message) || 'API error ' + resp.status);
      var reply = (data.content || []).filter(function(b) { return b.type === 'text'; }).map(function(b) { return b.text; }).join('\\n\\n');
      messages.push({ role: 'assistant', content: reply || '(No response)' });
    } catch(e) {
      messages.push({ role: 'assistant', content: 'Error: ' + e.message + '. Check your API key — you can reset it by clearing this page\\'s localStorage.' });
    }
    loading = false; renderMessages();
  }

  // Init
  if (apiKey()) showChat();
  else showSetup();
})();
<\/script>
</body>
</html>`
}
