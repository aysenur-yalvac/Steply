"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type SavedLocalAccount = {
  userId: string
  email: string
  fullName?: string | null
  avatarUrl?: string | null
  access_token: string
  refresh_token: string
  updated_at: number
}

const SAVED_ACCOUNTS_STORAGE_KEY = 'saved_accounts'

export function upsertSavedLocalAccount(session: Session | null) {
  if (typeof window === 'undefined' || !session?.user?.email) return
  try {
    const raw = window.localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY)
    const parsed: SavedLocalAccount[] = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []
    const emailLower = session.user.email.toLowerCase()
    const entry: SavedLocalAccount = {
      userId: session.user.id,
      email: session.user.email,
      fullName: (session.user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      updated_at: Date.now(),
    }
    const next = [
      entry,
      ...list.filter(
        (a) => a.userId !== session.user.id && (a.email || '').toLowerCase() !== emailLower
      ),
    ].slice(0, 10)
    window.localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
}

export function getSavedLocalAccount(userId?: string | null, email?: string | null): SavedLocalAccount | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY)
    if (!raw) return null
    const list: SavedLocalAccount[] = JSON.parse(raw)
    if (!Array.isArray(list)) return null
    const emailLower = (email || '').toLowerCase()
    return (
      list.find(
        (a) =>
          (userId && a.userId === userId) ||
          (emailLower && (a.email || '').toLowerCase() === emailLower)
      ) ?? null
    )
  } catch {
    return null
  }
}

export function removeSavedLocalAccount(userId?: string | null, email?: string | null) {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY)
    if (!raw) return
    const list: SavedLocalAccount[] = JSON.parse(raw)
    if (!Array.isArray(list)) return
    const emailLower = (email || '').toLowerCase()
    const next = list.filter(
      (a) =>
        !(userId && a.userId === userId) &&
        !(emailLower && (a.email || '').toLowerCase() === emailLower)
    )
    window.localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        upsertSavedLocalAccount(session)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
        upsertSavedLocalAccount(session)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[AuthProvider] signOut error:', err)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
