import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'

const benefits = [
  '80+ biomarcadores analisados por ciclo',
  'Histórico evolutivo de todos os marcadores',
  'Insights em linguagem acessível (PT-BR)',
  'Protocolo personalizado de ação',
  'Upload de laudos de qualquer laboratório BR',
  'Ambiente seguro e criptografado',
]

export default function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) navigate('/cadastro', { replace: true })
  }, [user, navigate])

  const handleCheckout = async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          user_id: user.id,
          email: user.email,
          origin: window.location.origin,
        },
      })

      if (fnError || !data?.url) {
        setError('Erro ao iniciar o checkout. Tente novamente.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-5 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <Activity className="text-brand-terracota" size={28} />
          <span className="font-serif font-bold text-2xl">
            <span className="text-brand-terracota">Bio Track</span>{' '}
            <span className="text-brand-brown">Brasil</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-border overflow-hidden bg-white shadow-sm">
          {/* Header */}
          <div className="bg-brand-brown p-6 text-center">
            <p className="text-white/80 text-sm uppercase tracking-widest font-medium mb-1">
              Plano Mensal
            </p>
            <div className="flex items-end justify-center gap-1">
              <span className="font-serif text-5xl font-bold text-white">R$&nbsp;29</span>
              <span className="font-serif text-3xl font-bold text-white">,90</span>
              <span className="text-white/70 mb-1">/mês</span>
            </div>
            <p className="text-white/60 text-xs mt-1">Cancele quando quiser</p>
          </div>

          {/* Benefits */}
          <div className="p-6 flex flex-col gap-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 text-sm text-brand-brown">
                <CheckCircle2 size={16} className="text-status-green shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-brand-terracota text-white rounded-full py-4 text-base font-semibold hover:bg-brand-brown-mid h-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Aguarde...
                </span>
              ) : (
                'Assinar agora →'
              )}
            </Button>
            {error && <p className="text-status-red text-sm text-center mt-3">{error}</p>}
            <p className="text-xs text-gray-muted text-center mt-3">
              Pagamento seguro via Stripe · Cancele a qualquer momento
            </p>
          </div>
        </div>

        {/* Sign out link */}
        <p
          className="text-center text-sm text-gray-muted mt-6 cursor-pointer hover:text-brand-brown"
          onClick={() => navigate('/login')}
        >
          Já sou assinante. Entrar →
        </p>
      </div>
    </div>
  )
}
