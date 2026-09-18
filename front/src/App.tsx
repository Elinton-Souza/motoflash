import { CardVeiculo } from "./components/CardVeiculo";
import { InputPesquisa } from "./components/InputPesquisa";
import type { CarroType } from "./utils/CarroType";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext"

const apiUrl = import.meta.env.VITE_API_URL

export default function App() {
  const [carros, setCarros] = useState<CarroType[]>([])
  const { logaCliente } = useClienteStore()  

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/carros/destaques`)
      const dados = await response.json()
//      console.log(dados)
      setCarros(dados)
    }
    buscaDados()

    async function buscaCliente(id: string) {
      const response = await fetch(`${apiUrl}/clientes/${id}`)
      const dados = await response.json()
      logaCliente(dados)
    }
    if (localStorage.getItem("clienteKey")) {
      const idCliente = localStorage.getItem("clienteKey")
      buscaCliente(idCliente as string)
    }    
  }, [])

  const listaCarros = carros.map( carro => (
    <CardVeiculo data={carro} key={carro.id} />
  ))

  return (
    <>
      <InputPesquisa setCarros={setCarros} />
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Veículos <span className="underline underline-offset-3 decoration-8 decoration-orange-400 dark:decoration-orange-600">em destaque</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaCarros}
        </div>
      </div>
    </>
  );
}
