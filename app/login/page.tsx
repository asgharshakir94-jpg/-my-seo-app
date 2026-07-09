'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
          <span className="font-bold tracking-tight text-lg text-ink">
            RankYou <span className="text-sand font-medium">Project Platform</span>
          </span>
        </div>

        <div className="bg-surface border border-line rounded-lg p-8 shadow-flat">
          <h1 className="text-xl font-bold text-ink mb-1">Log in</h1>
          <p className="text-sm text-slate mb-6">Welcome back to your workspace.</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-paper border border-line rounded-md px-4 py-2.5 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from transition-all duration-200"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-paper border border-line rounded-md px-4 py-2.5 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from transition-all duration-200"
            />

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-from to-accent-to hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-md transition-all duration-200 active:scale-95 shadow-accent"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-slate mt-6 text-center">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-accent-text font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}