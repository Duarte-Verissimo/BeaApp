import { Suspense } from 'react'
import AuthCallbackClient from '@/components/auth/auth-callback-client'

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processando autenticação...</h1>
          <p>Por favor, aguarde enquanto concluímos o login.</p>
        </div>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  )
}