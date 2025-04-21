'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PainelEmpresa() {
  const router = useRouter()
  const [empresa, setEmpresa] = useState<any>(null)
  const [oportunidades, setOportunidades] = useState<any[]>([])
  const [candidaturasPendentes, setCandidaturasPendentes] = useState<any[]>([])
  const [candidaturasAprovadas, setCandidaturasAprovadas] = useState<any[]>([])
  const [candidaturasRecusadas, setCandidaturasRecusadas] = useState<any[]>([])

  useEffect(() => {
    const buscarEmpresaEOportunidades = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user_id = sessionData?.session?.user?.id

      if (!user_id) {
        router.push('/login-empresa')
        return
      }

      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (!empresaData || empresaError) {
        router.push('/login-empresa')
        return
      }

      setEmpresa(empresaData)

      const { data: oportunidadesData, error: oportunidadesError } = await supabase
        .from('oportunidades')
        .select('*')
        .eq('empresa_id', user_id)
        .order('criado_em', { ascending: false })

      if (oportunidadesError) {
        console.error('Erro ao buscar oportunidades:', oportunidadesError)
      } else {
        setOportunidades(oportunidadesData || [])
      }

      // Buscando as candidaturas para essas oportunidades
      if (oportunidadesData && oportunidadesData.length > 0) {
        const oportunidadesIds = oportunidadesData.map((op) => op.id)

        const { data: candidaturasData, error: candidaturasError } = await supabase
          .from('candidaturas')
          .select(`
            id, 
            status, 
            mensagem, 
            criadores(nome, email), 
            oportunidades!candidaturas_oportunidade_id_fkey(titulo) 
          `)
          .in('oportunidade_id', oportunidadesIds) // Passando as IDs das oportunidades para a consulta
          .order('data_candidatura', { ascending: false })

        if (candidaturasError) {
          console.error('Erro ao buscar candidaturas:', candidaturasError)
        } else {
          // Dividindo as candidaturas nas 3 categorias
          setCandidaturasPendentes(candidaturasData.filter((item) => item.status === 'pendente'))
          setCandidaturasAprovadas(candidaturasData.filter((item) => item.status === 'aceita'))
          setCandidaturasRecusadas(candidaturasData.filter((item) => item.status === 'recusada'))
        }
      } else {
        console.log('Nenhuma oportunidade encontrada.')
      }
    }

    buscarEmpresaEOportunidades()
  }, [router])

  const handleAceitar = async (candidaturaId: string) => {
    const { error } = await supabase
      .from('candidaturas')
      .update({ status: 'aceita' })
      .eq('id', candidaturaId)

    if (error) {
      console.error('Erro ao aceitar candidatura:', error)
      alert('Erro ao aceitar a candidatura.')
    } else {
      alert('Candidatura aceita com sucesso!')
      // Atualize o estado das candidaturas
      setCandidaturasPendentes((prev) => prev.filter((item) => item.id !== candidaturaId))
      setCandidaturasAprovadas((prev) => [...prev, ...candidaturasPendentes.filter((item) => item.id === candidaturaId)])
    }
  }

  const handleRecusar = async (candidaturaId: string) => {
    const { error } = await supabase
      .from('candidaturas')
      .update({ status: 'recusada' })
      .eq('id', candidaturaId)

    if (error) {
      console.error('Erro ao recusar candidatura:', error)
      alert('Erro ao recusar a candidatura.')
    } else {
      alert('Candidatura recusada com sucesso!')
      // Atualize o estado das candidaturas
      setCandidaturasPendentes((prev) => prev.filter((item) => item.id !== candidaturaId))
      setCandidaturasRecusadas((prev) => [...prev, ...candidaturasPendentes.filter((item) => item.id === candidaturaId)])
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel da Empresa</h1>
        <p className="text-gray-700 mb-6">
          Bem-vindo{empresa?.nome ? `, ${empresa.nome}` : ''}!
        </p>

        <button
          onClick={() => router.push('/empresa/nova-oportunidade')}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition mb-8"
        >
          ➕ Criar nova oportunidade
        </button>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Oportunidades Criadas</h2>

          {oportunidades.length === 0 ? (
            <p className="text-gray-500">Nenhuma oportunidade criada ainda.</p>
          ) : (
            <ul className="space-y-4">
              {oportunidades.map((op) => (
                <li key={op.id} className="border p-4 rounded">
                  <p className="text-sm text-gray-500">{op.tipo}</p>
                  <h3 className="text-lg font-bold">{op.titulo}</h3>
                  <p className="text-gray-600 mt-1">{op.descricao}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Candidaturas Pendentes */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Pendentes</h2>

          {candidaturasPendentes.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura pendente.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasPendentes.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.criadores?.nome}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.criadores?.email}</p>
                  <p className="text-sm text-gray-500">{candidatura.oportunidades?.titulo}</p>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>

                  <button
                    onClick={() => handleAceitar(candidatura.id)}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
                  >
                    Aceitar
                  </button>

                  <button
                    onClick={() => handleRecusar(candidatura.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-2 ml-4"
                  >
                    Recusar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Candidaturas Aceitas */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Aceitas</h2>

          {candidaturasAprovadas.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura aceita ainda.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasAprovadas.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.criadores?.nome}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.criadores?.email}</p>
                  <p className="text-sm text-gray-500">{candidatura.oportunidades?.titulo}</p>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Candidaturas Recusadas */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Recusadas</h2>

          {candidaturasRecusadas.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura recusada ainda.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasRecusadas.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.criadores?.nome}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.criadores?.email}</p>
                  <p className="text-sm text-gray-500">{candidatura.oportunidades?.titulo}</p>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
