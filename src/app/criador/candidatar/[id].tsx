'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Oportunidade() {
  const router = useRouter()
  const { id } = useParams() // Agora usando o useParams() para pegar o ID diretamente da URL
  const [oportunidade, setOportunidade] = useState<any>(null)

  useEffect(() => {
    const fetchOportunidade = async () => {
      if (!id) return // Se não tem o ID, não faz nada

      const { data, error } = await supabase
        .from('oportunidades')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar oportunidade:', error)
        return
      }

      setOportunidade(data)
    }

    fetchOportunidade()
  }, [id]) // Recarrega se o id mudar

  const handleCandidatar = async () => {
    if (!id) return

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      router.push('/criador/login') // Se o usuário não estiver logado, redireciona para o login
      return
    }

    const { error } = await supabase
      .from('candidaturas')
      .insert([
        {
          criador_id: session.user.id,
          oportunidade_id: id,
          status: 'pendente', // Status inicial da candidatura
          data_candidatura: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Erro ao se candidatar:', error)
    } else {
      alert('Candidatura realizada com sucesso!')
      router.push('/criador/painel') // Redireciona de volta para o painel
    }
  }

  if (!oportunidade) {
    return <p>Carregando oportunidade...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{oportunidade.titulo}</h1>
        <p className="text-gray-700 mb-6">{oportunidade.descricao}</p>
        
        <button
          onClick={handleCandidatar}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2"
        >
          Candidatar
        </button>
      </div>
    </div>
  )
}
