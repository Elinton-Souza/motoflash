import { TiDeleteOutline } from "react-icons/ti"
import { FaRegEdit  } from "react-icons/fa"
import { FcOk } from "react-icons/fc"

import type { PropostaType } from "../../utils/PropostaType"
import { useAdminStore } from "../context/AdminContext"

type listaPropostaProps = {
  proposta: PropostaType,
  propostas: PropostaType[],
  setPropostas: React.Dispatch<React.SetStateAction<PropostaType[]>>
}

const apiUrl = import.meta.env.VITE_API_URL

export default function ItemProposta({ proposta, propostas, setPropostas }: listaPropostaProps) {

  const { admin } = useAdminStore()

  async function excluirProposta() {

    if (confirm(`Confirma Exclusão da Proposta "${proposta.descricao}"?`)) {
      const response = await fetch(`${apiUrl}/propostas/${proposta.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${admin.token}`
          },
        },
      )

      if (response.status == 200) {
        const propostas2 = propostas.filter(x => x.id != proposta.id)
        setPropostas(propostas2)
        alert("Proposta excluída com sucesso")
      } else {
        alert("Erro... Proposta não foi excluída")
      }
    }
  }

  async function responderProposta() {
    const respostaRevenda = prompt(`Resposta da Revenda para "${proposta.descricao}"`)

    if (respostaRevenda == null || respostaRevenda.trim() == "") {
      return
    }

    const response = await fetch(`${apiUrl}/propostas/${proposta.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${admin.token}`
        },
        body: JSON.stringify({resposta: respostaRevenda})
      },
    )

    if (response.status == 200) {
      const propostas2 = propostas.map(x => {
        if (x.id == proposta.id) {
          return { ...x, resposta: respostaRevenda}
        }
        return x
      })
      setPropostas(propostas2)
    }
  }

  return (
    <tr key={proposta.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        <img src={proposta.carro.foto} alt="Foto do Carro"
          style={{ width: 200 }} />
      </th>
      <td className={"px-6 py-4"}>
        {proposta.carro.modelo}
      </td>
      <td className={"px-6 py-4"}>
        {Number(proposta.carro.preco).toLocaleString("pt-br", {minimumFractionDigits: 2})}
      </td>
      <td className={`px-6 py-4`}>
        {proposta.cliente.nome}
      </td>
      <td className={`px-6 py-4`}>
        {proposta.descricao}
      </td>
      <td className={`px-6 py-4`}>
        {proposta.resposta}
      </td>
      <td className="px-6 py-4">
        {proposta.resposta ? 
          <>
            <FcOk className="text-3xl" title="Resposta Enviada"/>
          </>
        :
          <>
            <TiDeleteOutline className="text-3xl text-red-600 inline-block cursor-pointer" title="Excluir"
              onClick={excluirProposta} />&nbsp;
            <FaRegEdit className="text-3xl text-yellow-600 inline-block cursor-pointer" title="Responder"
              onClick={responderProposta} />
          </>
        }
      </td>

    </tr>
  )
}