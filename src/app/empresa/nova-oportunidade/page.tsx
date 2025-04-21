'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NovaOportunidade() {
  const router = useRouter()
  const [empresaId, setEmpresaId] = useState<string | null>(null)

  const [form, setForm] = useState({
    tipo: 'Campanha com Cachê',
    titulo: '',
    descricao: '',
  })

  useEffect(() => {
    const obterIdEmpresa = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user_id = sessionData?.session?.user?.id
      setEmpresaId(user_id ?? null)
    }

    obterIdEmpresa()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!empresaId) return alert('Empresa não identificada.')

    const { error } = await supabase.from('oportunidades').insert([
      {
        empresa_id: empresaId, // ID da empresa que está criando a oportunidade
        tipo: form.tipo, 
        titulo: form.titulo,
        descricao: form.descricao,
        status: 'aberta', // Adicionar status aberto por padrão
      },
    ])

    if (error) {
      console.error('❌ Erro ao salvar oportunidade:', error)
      alert(`Erro: ${error?.message || 'Erro desconhecido'}`)       
    } else {
      alert('Oportunidade criada com sucesso!')
      router.push('/empresa/painel') // Redireciona para o painel de empresa
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-6">Criar Nova Oportunidade</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Tipo:</span>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            >
              <option>Campanha com Cachê</option>
              <option>UGC</option>
              <option>Permuta</option>
              <option>Recebidos</option>
            </select>
          </label>

          <input
            type="text"
            name="titulo"
            placeholder="Título da oportunidade"
            value={form.titulo}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <textarea
            name="descricao"
            placeholder="Descrição detalhada"
            value={form.descricao}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded h-32"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Publicar Oportunidade
          </button>
        </form>
      </div>
    </div>
  )
}
