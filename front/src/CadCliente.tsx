import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import './CadCliente.css'

// ... não precisa mais com o Zod
// type Inputs = {
//     nome: string
//     email: string
//     cidade: string
//     senha: string
//     senha2: string
// }

// Schema Zod com validações
const schema = z.object({
    nome: z.string()
        .min(6, "Nome deve ter pelo menos 6 caracteres")
        .max(60, "Nome deve ter no máximo 60 caracteres")
        .refine(value => value.includes(' '), {
            message: "Informe o nome completo (nome e sobrenome)",
        }),
    email: z.email("Formato de email inválido")
        .toLowerCase(),
    cidade: z.string()
        .min(3, "Cidade deve ter pelo menos 3 caracteres"),
    // exemplos de validação de outros tipos de campo
    //   idade: z.coerce.number()
    //     .min(18, "Idade mínima: 18 anos")
    //     .max(100, "Idade máxima: 100 anos"),
    //   curso: z.enum(["ADS", "Redes", "Mkt"], {
    //     errorMap: () => ({ message: "Selecione um curso" })
    senha: z.string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .regex(/[a-z]/, "Senha deve conter, no mínimo, uma letra minúscula")
        .regex(/[A-Z]/, "Senha deve conter, no mínimo, uma letra maiúscula")
        .regex(/[0-9]/, "Senha deve conter, no mínimo, um número").regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
        .regex(/[!@#$%^&*]/, "Senha deve conter, no mínimo, um caractere especial"),
    senha2: z.string()
}).refine((data) => data.senha == data.senha2, {  // Validação cross-field
    message: "Senhas não coincidem",
    path: ["senha2"]  // Erro aparece no campo senha2
})

type FormData = z.infer<typeof schema>

const apiUrl = import.meta.env.VITE_API_URL

export default function CadCliente() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)  // Validação Zod
    });

    const navigate = useNavigate()

    async function cadastraCliente(data: FormData) {

        const response = await
            fetch(`${apiUrl}/clientes`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    nome: data.nome,
                    cidade: data.cidade,
                    email: data.email,
                    senha: data.senha
                })
            })


        if (response.status == 201) {
            toast.success("Ok! Cadastro realizado com sucesso...")
            // carrega a página principal, após login do cliente
            setTimeout(() => {
                navigate("/login")
            }, 3000)  // Aguarda 3 segundos (3000 ms)
        } else {
            
            const responseData = await response.json()
            console.log(responseData)
            // Erro específico de e-mail duplicado
            if (responseData.erro == "E-mail já cadastrado") {
                setError("email", { type: "server", message: responseData.erro })
                toast.error(responseData.erro)
                return
            }
            // Outros erros genéricos
            toast.error(responseData.erro)
        }

    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Cadastro de Cliente
                        </h1>
                        <form className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit(cadastraCliente)}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome:</label>
                                <input type="text" id="nome" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Seu nome completo" required
                                    {...register("nome")} />
                                {errors.nome && <p role="alert" className="error">{errors.nome.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">E-mail:</label>
                                <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="nome@gmail.com" required
                                    {...register("email")} />
                                {errors.email && <p role="alert" className="error">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="cidade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cidade:</label>
                                <input type="text" id="cidade" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Sua cidade" required
                                    {...register("cidade")} />
                                {errors.cidade && <p role="alert" className="error">{errors.cidade.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha de Acesso:</label>
                                <input type="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
                                    {...register("senha")} />
                                {errors.senha && <p role="alert" className="error">{errors.senha.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirme a Senha:</label>
                                <input type="password" id="confirm-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
                                    {...register("senha2")} />
                                {errors.senha2 && <p role="alert" className="error">{errors.senha2.message}</p>}
                            </div>
                            <button type="submit" className="w-full text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-amber-400 dark:hover:bg-amber-500 dark:focus:ring-amber-800">Criar sua Conta</button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Já possui uma conta? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Faça Login</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}