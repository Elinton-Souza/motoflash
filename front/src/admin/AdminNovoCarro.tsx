import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import type { MarcaType } from "../utils/MarcaType"
import { useAdminStore } from "./context/AdminContext"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
  modelo: string
  marcaId: number
  ano: number
  km: number
  preco: number
  foto: string
  acessorios: string
  combustivel: string
  adminId: string
}

export default function AdminNovoCarro() {
  const [marcas, setMarcas] = useState<MarcaType[]>([])
  const [combustiveis, setCombustiveis] = useState<string[]>([])
  const { admin } = useAdminStore()

  const {
    register,
    handleSubmit,
    reset,
    setFocus
  } = useForm<Inputs>()

  useEffect(() => {
    async function getMarcas() {
      const response = await fetch(`${apiUrl}/marcas`)
      const dados = await response.json()
      setMarcas(dados)
    }
    getMarcas()

    async function getCombustiveis() {
      const response = await fetch(`${apiUrl}/combustiveis`)
      const dados = await response.json()
      setCombustiveis(dados)
    }
    getCombustiveis()

    setFocus("modelo")
  }, [])

  const optionsMarca = marcas.map(marca => (
    <option key={marca.id} value={marca.id}>{marca.nome}</option>
  ))

  const optionsCombustiveis = combustiveis.map(combust => (
    <option key={combust} value={combust}>{combust}</option>
  ))

  async function incluirCarro(data: Inputs) {

    const novoCarro: Inputs = {
      modelo: data.modelo,
      marcaId: Number(data.marcaId),
      ano: Number(data.ano),
      km: Number(data.km),
      acessorios: data.acessorios,
      foto: data.foto,
      preco: Number(data.preco),
      combustivel: data.combustivel,
      adminId: admin.id
    }

    const response = await fetch(`${apiUrl}/carros`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${admin.token}`
        },
        body: JSON.stringify(novoCarro)
      },
    )

    if (response.status == 201) {
      toast.success("Ok! Carro cadastrado com sucesso")
      reset()
    } else {
      toast.error("Erro no cadastro do Carro...")
    }
  }

  return (
    <>
      <h1 className="mb-4 mt-24 text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white me-56">
        Inclusão de Carros
      </h1>

      <form className="max-w-xl mx-auto" onSubmit={handleSubmit(incluirCarro)}>
        <div className="mb-3">
          <label htmlFor="modelo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Modelo do Carro</label>
          <input type="text" id="modelo"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
            {...register("modelo")}
          />
        </div>
        <div className="grid gap-6 mb-3 md:grid-cols-2">
          <div className="mb-3">
            <label htmlFor="marcaId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Marca</label>
            <select id="marcaId"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("marcaId")}
            >
              {optionsMarca}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="ano" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Ano</label>
            <input type="number" id="ano"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("ano")}
            />
          </div>
        </div>
        <div className="grid gap-6 mb-3 md:grid-cols-2">
          <div className="mb-3">
            <label htmlFor="preco" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Preço R$</label>
            <input type="number" id="preco"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("preco")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="km" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Km</label>
            <input type="number" id="km"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("km")}
            />
          </div>
        </div>
        <div className="grid gap-6 mb-3 md:grid-cols-2">
          <div className="mb-3">
            <label htmlFor="foto" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              URL da Foto</label>
            <input type="text" id="foto"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("foto")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="combustivel" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Combustível</label>
            <select id="combustivel"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
              {...register("combustivel")}
            >
              {optionsCombustiveis}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="sinopse" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Acessórios</label>
          <textarea id="acessorios" rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            {...register("acessorios")}></textarea>
        </div>

        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Incluir</button>
      </form>
    </>
  )
}

