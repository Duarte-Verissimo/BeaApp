import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie ? cookie.value : null
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // O cookie pode ser definido apenas quando manipulando uma solicitação
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch {
            // O cookie pode ser definido apenas quando manipulando uma solicitação
          }
        },
      },
    }
  )
}