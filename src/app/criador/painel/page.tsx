'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PainelCriador() {
  const router = useRouter()
  const [nome, setNome] = useState<string>('') 
  const [oportunidades, setOportunidades] = useState<any[]>([])
  const [candidaturas, setCandidaturas] = useState<any[]>([])
  const [candidaturasAceitas, setCandidaturasAceitas] = useState<any[]>([])
  const [candidaturasRecusadas, setCandidaturasRecusadas] = useState<any[]>([])
  const [candidaturasPendentes, setCandidaturasPendentes] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedOportunidade, setSelectedOportunidade] = useState<any>(null)

  useEffect(() => {
    const buscarCriadorEOportunidades = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/criador/login') // Se o criador não estiver logado, vai para a página de login
        return
      }

      const { data, error } = await supabase
        .from('criadores')
        .select('nome')
        .eq('user_id', session.user.id)
        .single()

      if (error || !data) {
        router.push('/criador/cadastro') // Caso não tenha o criador registrado, redireciona para cadastro
        return
      }

      setNome(data.nome || '')

      // Buscando as candidaturas do criador
      const { data: candidaturasData, error: candidaturasError } = await supabase
        .from('candidaturas')
        .select('*')
        .eq('criador_id', session.user.id)

      if (candidaturasError) {
        console.error('Erro ao buscar candidaturas:', candidaturasError)
      } else {
        setCandidaturas(candidaturasData || [])

        // Verificando se candidaturasData não é nulo e filtrando conforme o status
        const aceitas = candidaturasData?.filter((candidatura: any) => candidatura.status === 'aceita') || []
        const recusadas = candidaturasData?.filter((candidatura: any) => candidatura.status === 'recusada') || []
        const pendentes = candidaturasData?.filter((candidatura: any) => candidatura.status === 'pendente') || []

        setCandidaturasAceitas(aceitas)
        setCandidaturasRecusadas(recusadas)
        setCandidaturasPendentes(pendentes)
      }

      // Buscando as oportunidades abertas
      const { data: oportunidadesData, error: oportunidadesError } = await supabase
        .from('oportunidades')
        .select('*')
        .eq('status', 'aberta') // Apenas as oportunidades com status 'aberta' serão mostradas
        .order('criado_em', { ascending: false })

      if (oportunidadesError) {
        console.error('Erro ao buscar oportunidades:', oportunidadesError)
      } else {
        // Verificando se candidaturasData não é nulo e filtrando as oportunidades que o criador já se candidatou
        const oportunidadesNaoCandidatas = oportunidadesData?.filter(op => {
          return !candidaturasData?.some(candidatura => candidatura.oportunidade_id === op.id)
        }) || []

        setOportunidades(oportunidadesNaoCandidatas || [])
      }
    }

    buscarCriadorEOportunidades()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/criador/login') // Redireciona para o login
  }

  const handleCandidatar = (op: any) => {
    setSelectedOportunidade(op)
    setModalOpen(true)
  }

  const handleSubmitCandidatura = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      alert('Você precisa estar logado para se candidatar!')
      return
    }

    const { error } = await supabase
      .from('candidaturas')
      .insert([{
        criador_id: session.user.id,
        oportunidade_id: selectedOportunidade.id,
        status: 'pendente',
      }])

    if (error) {
      console.error('Erro ao salvar candidatura:', error)
      alert('Erro ao enviar candidatura.')
    } else {
      alert('Candidatura enviada com sucesso!')
      setModalOpen(false) // Fecha o modal após candidatura
      // Atualiza a página após a candidatura
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo{nome ? `, ${nome}` : ''}!
        </h1>
        <p className="text-gray-700 mb-6">Explore as oportunidades disponíveis para criadores como você!</p>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Oportunidades Disponíveis</h2>

          {oportunidades.length === 0 ? (
            <p className="text-gray-500">Nenhuma oportunidade disponível no momento.</p>
          ) : (
            <ul className="space-y-4">
              {oportunidades.map((op) => {
                return (
                  <li key={op.id} className="border p-4 rounded">
                    <p className="text-sm text-gray-500">{op.tipo}</p>
                    <h3 className="text-lg font-bold">{op.titulo}</h3>
                    <p className="text-gray-600 mt-1">{op.descricao}</p>

                    <button
                      onClick={() => handleCandidatar(op)}
                      className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2"
                    >
                      Candidatar
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Exibindo as candidaturas aceitas */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Aceitas</h2>

          {candidaturasAceitas.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura aceita ainda.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasAceitas.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.oportunidade_id}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Exibindo as candidaturas recusadas */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Recusadas</h2>

          {candidaturasRecusadas.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura recusada ainda.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasRecusadas.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.oportunidade_id}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Exibindo as candidaturas pendentes */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Candidaturas Pendentes</h2>

          {candidaturasPendentes.length === 0 ? (
            <p className="text-gray-500">Nenhuma candidatura pendente ainda.</p>
          ) : (
            <ul className="space-y-4">
              {candidaturasPendentes.map((candidatura) => (
                <li key={candidatura.id} className="border p-4 rounded">
                  <h3 className="text-lg font-bold">{candidatura.oportunidade_id}</h3>
                  <p className="text-gray-600 mt-1">{candidatura.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal para enviar candidatura */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Candidatar-se à Oportunidade</h2>
            <form onSubmit={handleSubmitCandidatura}>
              <div className="mb-4">
                <label className="block text-gray-700">Mensagem</label>
                <textarea
                  name="mensagem"
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  rows={4}
                  placeholder="Adicione uma mensagem ou apresentação"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Enviar Candidatura
              </button>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mt-4"
      >
        Sair
      </button>
    </div>
  )
}
