'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EmailOtpType } from '@supabase/supabase-js'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')

    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') || '/reset-password'

    if (!token_hash || !type) {
      setError('This link is missing required information.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (verifyError) {
      setError('This link is invalid or has expired. Please request a new one.')
      setLoading(false)
      return
    }

    router.push(next)
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">Confirm your request</h1>
        <p className="text-sm text-ink/60 mb-6">
          Click below to continue resetting your password.
        </p>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-md bg-ink text-paper px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Confirming…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}