'use client'

import { useRouter } from 'next/navigation'

export default function CadastroSucesso() {
  const router = useRouter()

  const handleVoltar = () => {
    router.push('/criador/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 shadow-md rounded-lg max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-800">Cadastro enviado!</h1>
        <p className="mb-6 text-gray-700">
          Seu cadastro foi enviado para aprovação. Em breve entraremos em contacto pelo seu email.
        </p>
        <button
          onClick={handleVoltar}
          className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  )
}
