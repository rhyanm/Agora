'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Account {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<Pick<User, 'name'>>) => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return (h >>> 0).toString(36)
}

function getAccounts(): Record<string, Account> {
  try { return JSON.parse(localStorage.getItem('agora_accounts') || '{}') } catch { return {} }
}

function saveAccounts(accounts: Record<string, Account>) {
  localStorage.setItem('agora_accounts', JSON.stringify(accounts))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agora_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const accounts = getAccounts()
    const account = accounts[email.toLowerCase()]
    if (!account) return { success: false, error: 'No account found with that email.' }
    if (account.passwordHash !== simpleHash(password)) return { success: false, error: 'Incorrect password.' }
    const u: User = { id: account.id, name: account.name, email: account.email, createdAt: account.createdAt }
    setUser(u)
    localStorage.setItem('agora_user', JSON.stringify(u))
    return { success: true }
  }

  async function signup(name: string, email: string, password: string) {
    const accounts = getAccounts()
    const key = email.toLowerCase()
    if (accounts[key]) return { success: false, error: 'An account with that email already exists.' }
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const createdAt = new Date().toISOString()
    const account: Account = { id, name, email: key, passwordHash: simpleHash(password), createdAt }
    accounts[key] = account
    saveAccounts(accounts)
    const u: User = { id, name, email: key, createdAt }
    setUser(u)
    localStorage.setItem('agora_user', JSON.stringify(u))
    return { success: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('agora_user')
  }

  function updateUser(updates: Partial<Pick<User, 'name'>>) {
    if (!user) return
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('agora_user', JSON.stringify(updated))
    const accounts = getAccounts()
    if (accounts[user.email]) {
      accounts[user.email] = { ...accounts[user.email], ...updates }
      saveAccounts(accounts)
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!user) return { success: false, error: 'Not logged in.' }
    const accounts = getAccounts()
    const account = accounts[user.email]
    if (!account) return { success: false, error: 'Account not found.' }
    if (account.passwordHash !== simpleHash(currentPassword)) return { success: false, error: 'Current password is incorrect.' }
    accounts[user.email] = { ...account, passwordHash: simpleHash(newPassword) }
    saveAccounts(accounts)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
