import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface AuthUser {
  id: string
  email: string
  user_metadata: { full_name?: string }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  subscribed: boolean
  refreshSubscription: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)

  const checkSubscription = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('user_id', userId)
      .single()
    setSubscribed(data?.subscription_status === 'active')
  }

  const refreshSubscription = async () => {
    if (user) await checkSubscription(user.id)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email ?? '',
          user_metadata: session.user.user_metadata,
        }
        setUser(u)
        await checkSubscription(u.id)
      } else {
        setUser(null)
        setSubscribed(false)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email ?? '',
          user_metadata: session.user.user_metadata,
        }
        setUser(u)
        await checkSubscription(u.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('E-mail ou senha incorretos.')
      return { error: error.message }
    }
    const name = data.user?.user_metadata?.full_name || 'Usuário'
    toast.success(`Bem-vindo de volta, ${name}! 🎉`)
    return {}
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      toast.error(error.message)
      return { error: error.message }
    }
    toast.success('Conta criada! Verifique seu e-mail.')
    return {}
  }

  const signOut = async () => {
    setUser(null)
    setSubscribed(false)
    await supabase.auth.signOut()
    toast('Até logo! 👋')
  }

  return (
    <AuthContext.Provider value={{ user, loading, subscribed, refreshSubscription, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
