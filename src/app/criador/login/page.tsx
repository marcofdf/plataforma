'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase' // <- caminho corrigido
import { useRouter } from 'next/navigation'

export default function LoginCriador() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return alert(error.message)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert('Erro ao recuperar sessão. Tente novamente.')
        return
      }

      router.push('/criador/verificar') // <- redirecionamento ajustado
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) return alert(signUpError.message)

      const { error: insertError } = await supabase.from('criadores').insert([
        {
          email: email || '',
          aprovado: false,
        },
      ])

      if (insertError) {
        console.error(insertError)
        return alert('Erro ao salvar no banco de dados.')
      }

      alert('Conta criada com sucesso!')
      router.push('/criador/cadastro') // <- redirecionamento ajustado
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4 text-center">
          {isLogin ? 'Login' : 'Criar conta'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value || '')}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value || '')}
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-center w-full text-gray-600 hover:underline"
        >
          {isLogin ? 'Não tem conta? Cadastrar' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  )
}
