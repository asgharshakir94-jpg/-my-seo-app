'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [fullName, setFullName] = useState("");
  const [trade, setTrade] = useState("");
  const [country, setCountry] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service to continue.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          terms_accepted_at: new Date().toISOString(),
          full_name: fullName,
          trade: trade,
          country: country,
        },
      }, 
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/login?message=Check your email to confirm your account')
  }

  const inputClass =
    "w-full bg-paper border border-line rounded-md px-4 py-2.5 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from transition-all duration-200"

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT: Signup form */}
      <div className="flex items-center justify-center px-4 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </span>
          </div>

          <div className="bg-surface border border-line rounded-lg p-8 shadow-flat">
            <h1 className="text-xl font-bold text-ink mb-1">Create your account</h1>
            <p className="text-sm text-slate mb-6">Start your 14-day free trial.</p>

            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputClass}
              />

              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select your trade</option>
                <option value="roofing">Roofing</option>
                <option value="solar">Solar</option>
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrician">Electrician</option>
                <option value="carpentry">Carpentry</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className={inputClass}
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-accent-text underline underline-offset-2">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-accent-text underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full bg-gradient-to-r from-accent-from to-accent-to hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-md transition-all duration-200 active:scale-95 shadow-accent"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <p className="text-sm text-slate mt-6 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-accent-text font-medium hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: What you get */}
        <div className="hidden lg:flex flex-col justify-center bg-surface border-l border-line px-12 py-12">
           <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-ink mb-4">What you get with RankinSEO</h2>
            <ul className="space-y-3 text-ink leading-relaxed">
            <li>✓ SEO articles written for roofing, plumbing, HVAC, electrical and solar businesses</li>
            <li>✓ You review each article and publish it on your own website</li>
            <li>✓ 14-day free trial on the Starter plan, cancel anytime</li>
          </ul>
        </div>
      </div>
    </div>
  )
}