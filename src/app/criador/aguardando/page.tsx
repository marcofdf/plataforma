'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AguardandoAprovacao() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/criador/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-yellow-700">Cadastro em análise</h1>
        <p className="text-gray-700 mb-6">
          Seu cadastro foi enviado e está a ser analisado pela nossa equipa.
          Em breve receberá uma confirmação por email.
        </p>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition text-sm"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
