import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

export default function PagamentoConfirmado() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        })

        if (error || !data?.paid) {
          setStatus('error')
          return
        }

        setStatus('success')

        // Redireciona para o login após 3 segundos
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [sessionId, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-5">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <Activity className="text-brand-terracota" size={28} />
          <span className="font-serif font-bold text-2xl">
            <span className="text-brand-terracota">Bio Track</span>{' '}
            <span className="text-brand-brown">Brasil</span>
          </span>
        </div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-brand-terracota animate-spin" />
            <p className="font-serif text-xl text-brand-brown">Verificando pagamento...</p>
            <p className="text-sm text-gray-muted">Isso leva apenas alguns segundos.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 size={64} className="text-status-green" />
            <h1 className="font-serif text-3xl text-brand-brown">Pagamento confirmado!</h1>
            <p className="text-gray-text">
              Sua assinatura está ativa. Você será redirecionado para o login em instantes.
            </p>
            <div className="w-full bg-gray-border rounded-full h-1 mt-2 overflow-hidden">
              <div className="bg-status-green h-full animate-[grow_3s_linear_forwards]" />
            </div>
            <Button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-brand-terracota text-white rounded-full py-3 mt-2 hover:bg-brand-brown-mid h-auto"
            >
              Ir para o login agora →
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle size={64} className="text-status-red" />
            <h1 className="font-serif text-3xl text-brand-brown">Algo deu errado</h1>
            <p className="text-gray-text">
              Não conseguimos confirmar seu pagamento. Se o valor foi cobrado, entre em contato com o suporte.
            </p>
            <Button
              onClick={() => navigate('/checkout', { replace: true })}
              className="w-full bg-brand-terracota text-white rounded-full py-3 mt-2 hover:bg-brand-brown-mid h-auto"
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
