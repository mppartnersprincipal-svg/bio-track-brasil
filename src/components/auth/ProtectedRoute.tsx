import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Activity } from 'lucide-react'
import { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, subscribed } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream-light">
        <Activity size={32} className="text-brand-terracota animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!subscribed) return <Navigate to="/checkout" replace />

  return <>{children}</>
}
