'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Verifica se há um erro na URL
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription)
        setError(`Erro de autenticação: ${errorDescription || errorParam}`)
        setLoading(false)
        // Permanece na página para mostrar o erro em vez de redirecionar imediatamente
        return
      }
      
      try {
        // Deixa o Supabase lidar com o callback de autenticação
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        // Redireciona para a página inicial após o login bem-sucedido
        router.push('/')
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Ocorreu um erro durante a autenticação. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    // Only run the effect if searchParams is available (client-side)
    if (typeof window !== 'undefined' && searchParams) {
      handleAuthCallback()
    }
  }, [router, supabase, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processando autenticação...</h1>
          <p>Por favor, aguarde enquanto concluímos o login.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processando autenticação...</h1>
        <p>Por favor, aguarde enquanto concluímos o login.</p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Voltar para a página inicial
            </button>
          </div>
        )}
      </div>
    </div>
  )
}