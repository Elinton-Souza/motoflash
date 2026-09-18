import type { CarroType } from "./utils/CarroType"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useClienteStore } from "./context/ClienteContext"
import { useForm } from "react-hook-form"
import { toast } from 'sonner'

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
  descricao: string
}

export default function Detalhes() {
  const params = useParams()

  const [carro, setCarro] = useState<CarroType>()
  const { cliente } = useClienteStore()

  const { register, handleSubmit, reset } = useForm<Inputs>()

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/carros/${params.carroId}`)
      const dados = await response.json()
      // console.log(dados)
      setCarro(dados)
    }
    buscaDados()
  }, [])

  async function enviaProposta(data: Inputs) {

    const response = await fetch(`${apiUrl}/propostas`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        clienteId: cliente.id,
        carroId: Number(params.carroId),
        descricao: data.descricao
      })
    })

    if (response.status == 201) {
      toast.success("Obrigado. Sua proposta foi enviada. Aguarde retorno")
      reset()
    } else {
      toast.error("Erro... Não foi possível enviar sua proposta")
    }
  }

  return (
    <>
      <section className="mt-6 mx-auto max-w-5xl bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700 dark:bg-gray-800">

        <img
          className="object-cover w-full h-96 rounded-t-lg"
          src={carro?.foto}
          alt="Foto do Carro"
        />

        <div className="p-6">

          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {carro?.marca.nome} {carro?.modelo} {carro?.ano} - {carro?.combustivel} ({carro?.km.toLocaleString("pt-BR")} km)
          </h5>

          <h5 className="mb-4 text-xl tracking-tight text-gray-900 dark:text-white">
            Preço R$: {Number(carro?.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h5>

          <p className="mb-4 font-normal text-gray-700 dark:text-gray-400 italic">
            {carro?.acessorios}
          </p>

          {carro?.pontosFortes && carro.pontosFortes.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Pontos Fortes: *
              </h6>

              <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 text-sm">
                {carro.pontosFortes.map((ponto, index) => (
                  <li key={index}>{ponto}</li>
                ))}
              </ul>
            </div>
          )}

          {carro?.pontosFracos && carro.pontosFracos.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Pontos Fracos: *
              </h6>

              <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 text-sm">
                {carro.pontosFracos.map((ponto, index) => (
                  <li key={index}>{ponto}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-400">
            {carro?.consumoMedioCidade && (
              <p className="mb-2">
                Consumo Médio na Cidade: {carro.consumoMedioCidade} *
              </p>
            )}

            {carro?.consumoMedioEstrada && (
              <p>
                Consumo Médio na Estrada: {carro.consumoMedioEstrada} *
              </p>
            )}
          </div>

          {carro?.consumoMedioEstrada && (
            <p className="mb-6 text-sm text-gray-700 dark:text-gray-400 italic">
              * Informações geradas por IA. Sujeito a erros.
            </p>
          )}

          {cliente.id ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">

              <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                🙂 Você pode fazer uma Proposta para este veículo!
              </h3>

              <form onSubmit={handleSubmit(enviaProposta)}>

                <input
                  type="text"
                  className="mb-4 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  value={`${cliente.nome} (${cliente.email})`}
                  disabled
                  readOnly
                />

                <textarea
                  id="message"
                  className="mb-4 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Descreva a sua proposta"
                  required
                  {...register("descricao")}
                />

                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Enviar Proposta
                </button>

              </form>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                😎 Gostou? Identifique-se e faça uma Proposta!
              </h2>
            </div>
          )}

        </div>
      </section>
    </>
  )
}