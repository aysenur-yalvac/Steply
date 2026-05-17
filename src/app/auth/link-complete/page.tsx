'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LinkCompletePage() {
  const searchParams = useSearchParams()
  const ownerId = searchParams.get('owner_id')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerId) {
      setError('Geçersiz bağlantı isteği.')
      return
    }

    fetch('/api/auth/switch-to-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: ownerId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url
        } else {
          setError(data.error ?? 'Hesaba geri dönüş başarısız oldu.')
        }
      })
      .catch(() => setError('Ağ hatası. Lütfen tekrar deneyin.'))
  }, [ownerId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <a href="/dashboard" className="text-sm text-violet-600 hover:underline">
            Dashboard'a git
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-violet-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-700">Hesap bağlandı, ana hesaba dönülüyor…</p>
      </div>
    </div>
  )
}
