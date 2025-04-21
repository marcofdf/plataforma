'use client'

export default function AguardandoEmpresa() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">🚧 Sua conta está em análise</h1>
        <p className="text-gray-700 mb-6">
          Estamos analisando seu cadastro. Assim que for aprovado, você poderá criar oportunidades e encontrar criadores!
        </p>
        <p className="text-sm text-gray-500">
          Isso geralmente leva poucas horas. Você receberá uma notificação assim que estiver tudo certo.
        </p>
      </div>
    </div>
  )
}
