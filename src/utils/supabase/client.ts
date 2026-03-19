import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Graceful fallback: use a placeholder URL in dev/demo mode if env vars not set
  const safeUrl = url && url.startsWith('http') ? url : 'https://placeholder.supabase.co'
  const safeKey = key || 'placeholder-anon-key'

  return createBrowserClient(safeUrl, safeKey)
}
