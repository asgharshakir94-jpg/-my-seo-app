'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <p className="text-ink/60">Verifying your reset link…</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <p className="text-ink/80">Password updated. Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-line bg-surface p-8"
      >
        <h1 className="text-xl font-semibold mb-6">Set a new password</h1>

        <label className="block text-sm mb-1" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-md border border-line bg-paper px-3 py-2"
          required
        />

        <label className="block text-sm mb-1" htmlFor="confirmPassword">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 rounded-md border border-line bg-paper px-3 py-2"
          required
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink text-paper px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}