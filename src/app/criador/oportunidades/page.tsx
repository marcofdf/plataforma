'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PainelCriador() {
  const router = useRouter()
  const [nome, setNome] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [oportunidades, setOportunidades] = useState<any[]>([])

  useEffect(() => {
    const buscarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/criador/login')
        return
      }

      const id = session.user.id
      setUserId(id)

      const { data, error } = await supabase
        .from('criadores')
        .select('nome')
        .eq('user_id', id)
        .single()

      if (error || !data) {
        router.push('/criador/cadastro')
        return
      }

      setNome(data.nome || '')

      const { data: oportunidadesData } = await supabase
        .from('oportunidades')
        .select('*')
        .order('criado_em', { ascending: false })

      setOportunidades(oportunidadesData || [])
    }

    buscarDados()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/criador/login')
  }

  const handleCandidatar = async (oportunidade_id: number) => {
    const { error } = await supabase.from('candidaturas').insert([
      {
        user_id: userId,
        oportunidade_id,
        status: 'pendente',
      },
    ])

    if (error) {
      console.error('Erro ao se candidatar:', error)
      alert('Erro ao se candidatar')
    } else {
      alert('Candidatura enviada com sucesso!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo{nome ? `, ${nome}` : ''}!</h1>

        <h2 className="text-xl font-semibold mt-6 mb-2">🔍 Oportunidades disponíveis</h2>

        {oportunidades.length === 0 ? (
          <p className="text-gray-500">Nenhuma oportunidade disponível no momento.</p>
        ) : (
          <ul className="space-y-4">
            {oportunidades.map((op) => (
              <li key={op.id} className="border p-4 rounded">
                <p className="text-sm text-gray-500">{op.tipo}</p>
                <h3 className="text-lg font-bold">{op.titulo}</h3>
                <p className="text-gray-600 mt-1 mb-3">{op.descricao}</p>
                <button
                  onClick={() => handleCandidatar(op.id)}
                  className="bg-black text-white py-1 px-3 rounded hover:bg-gray-800 text-sm"
                >
                  Quero me candidatar
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
