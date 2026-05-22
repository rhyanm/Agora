'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useApps } from '@/app/context/AppsContext'
import { ArrowLeft, User, Lock, Palette, Trash2, Download, AlertTriangle, Check } from 'lucide-react'

type Tab = 'profile' | 'security' | 'preferences' | 'apps'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, logout, updateUser, changePassword } = useAuth()
  const { customApps, deleteApp } = useApps()
  const [tab, setTab] = useState<Tab>('profile')
  const [mounted, setMounted] = useState(false)

  // Profile state
  const [name, setName] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  // Preferences state
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  if (!mounted || loading) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">Sign in to access settings.</p>
        <button onClick={() => router.push('/auth/login')} className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">
          Sign in
        </button>
      </div>
    )
  }

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  function saveProfile() {
    if (!name.trim()) return
    updateUser({ name: name.trim() })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  async function savePassword() {
    setPasswordError('')
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    const result = await changePassword(currentPassword, newPassword)
    if (!result.success) { setPasswordError(result.error || 'Failed.'); return }
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 2000)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Lock size={15} /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette size={15} /> },
    { id: 'apps', label: 'My Apps', icon: <span className="text-xs font-bold">{customApps.length}</span> },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Agora</span>
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Settings</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0">
          <div className="flex flex-col gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  tab === t.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {tab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Profile</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your personal information.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-xs text-zinc-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Display name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Email cannot be changed.</p>
                </div>
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
                >
                  {profileSaved && <Check size={14} />}
                  {profileSaved ? 'Saved!' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Security</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your password.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
                <button
                  onClick={savePassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
                >
                  {passwordSaved && <Check size={14} />}
                  {passwordSaved ? 'Password updated!' : 'Update password'}
                </button>
              </div>
            </div>
          )}

          {tab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Preferences</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize your Agora experience.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Dark mode</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Switch between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-11 h-6 rounded-full transition-colors ${dark ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Danger zone
                </h3>
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">Delete your account and all saved apps. This cannot be undone.</p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure? This will permanently delete your account and all your saved apps.')) {
                        localStorage.removeItem('agora_user')
                        const accounts = JSON.parse(localStorage.getItem('agora_accounts') || '{}')
                        delete accounts[user.email]
                        localStorage.setItem('agora_accounts', JSON.stringify(accounts))
                        localStorage.removeItem(`agora_apps_${user.id}`)
                        logout()
                        router.push('/')
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'apps' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">My Apps</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Apps you&apos;ve built with Forge.</p>
              </div>

              {customApps.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <p className="text-4xl mb-3">🔧</p>
                  <p className="text-sm">No apps yet. Head to Forge to build your first one.</p>
                  <button onClick={() => router.push('/tools/forge')} className="mt-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
                    Open Forge
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customApps.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{app.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{app.name}</p>
                          <p className="text-xs text-zinc-400">{app.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/tools/custom/${app.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                        >
                          Open
                        </button>
                        <a
                          href={`/api/download-app?id=${app.id}&userId=${user.id}`}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => { if (confirm('Delete this app?')) deleteApp(app.id) }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
