'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthListener() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  return null
}