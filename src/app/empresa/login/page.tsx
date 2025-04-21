'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginEmpresa() {
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLogin, setIsLogin] = useState(true)
  const [nome, setNome] = useState<string>('')
  const [segmento, setSegmento] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return alert(error.message)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return alert('Erro ao recuperar sessão')

      router.push('/empresa/verificar')
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) return alert(signUpError.message)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return alert('Erro ao obter sessão.')

      const user_id = session.user.id

      const { error: insertError } = await supabase.from('empresas').insert([
        { user_id, email, nome, segmento }
      ])

      if (insertError) {
        console.error(insertError)
        return alert('Erro ao salvar dados da empresa.')
      }

      alert('Conta criada com sucesso!')
      router.push('/empresa/verificar')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4 text-center">
          {isLogin ? 'Login da Empresa' : 'Cadastro da Empresa'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nome da empresa"
                className="w-full border p-2 rounded"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="text"
                placeholder="Segmento (ex: Moda, Tech)"
                className="w-full border p-2 rounded"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  )
}

