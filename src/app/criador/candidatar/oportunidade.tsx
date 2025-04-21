'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Oportunidade() {
  const router = useRouter()
  const [oportunidades, setOportunidades] = useState<any[]>([])

  useEffect(() => {
    const fetchOportunidades = async () => {
      const { data, error } = await supabase
        .from('oportunidades')
        .select('*')
        .eq('status', 'aberta') // Buscando todas as oportunidades abertas
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('Erro ao buscar oportunidades:', error)
      } else {
        setOportunidades(data || [])
      }
    }

    fetchOportunidades()
  }, [])

  const handleCandidatar = async (oportunidadeId: string) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      router.push('/criador/login') // Se não estiver logado, redireciona para login
      return
    }

    // Inserindo candidatura na tabela de candidaturas
    const { error } = await supabase
      .from('candidaturas')
      .insert([
        { oportunidade_id: oportunidadeId, criador_id: session.user.id, status: 'pendente' }
      ])

    if (error) {
      console.error('Erro ao candidatar-se:', error)
    } else {
      alert('Candidatura enviada com sucesso!')
      router.push('/criador/painel') // Redireciona para o painel do criador
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oportunidades Disponíveis</h1>
        
        {oportunidades.length === 0 ? (
          <p className="text-gray-500">Nenhuma oportunidade no momento.</p>
        ) : (
          <ul className="space-y-4">
            {oportunidades.map((op) => (
              <li key={op.id} className="border p-4 rounded">
                <p className="text-sm text-gray-500">{op.tipo}</p>
                <h3 className="text-lg font-bold">{op.titulo}</h3>
                <p className="text-gray-600 mt-1">{op.descricao}</p>
                <button
                  onClick={() => handleCandidatar(op.id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2"
                >
                  Candidatar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
