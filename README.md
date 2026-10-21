# MotoFlash

Plataforma web que conecta **restaurantes** a **motoboys** para entregas rápidas.
O restaurante cria a entrega, o sistema encontra o motoboy online mais próximo e
os dois acompanham a corrida em tempo real, da retirada no balcão até o
pagamento do repasse.

Projeto da disciplina de Gestão Ágil de Projetos (4º semestre, Senac RS).

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Como rodar](#como-rodar)
- [Contas de demonstração](#contas-de-demonstração)
- [Roteiro de teste](#roteiro-de-teste)
- [Comandos úteis](#comandos-úteis)
- [Problemas comuns](#problemas-comuns)
- [API](#api)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Funcionalidades

**Restaurante**
- Criar uma entrega: o sistema busca automaticamente o motoboy online mais próximo, num raio de 5 km.
- Acompanhar a entrega em tempo real: buscando motoboy → a caminho da coleta → retirado → a caminho do cliente → entregue.
- Ver o **código de retirada** de 4 dígitos, que o motoboy precisa informar no balcão.
- Ver o painel com pedidos do dia, entregas em andamento, motoboys disponíveis e custos.
- Consultar o histórico e o financeiro, com repasses por motoboy e entregas por dia.
- Editar os dados do restaurante.

**Motoboy**
- Ficar online ou offline para receber corridas.
- Receber o aviso de nova corrida em tempo real e aceitar ou recusar em até 30 segundos.
- Confirmar a retirada com o código do restaurante, iniciar a rota e finalizar a entrega.
- Ver ganhos do dia, média por entrega, resumo da semana e histórico.
- Editar o perfil (nome, telefone, placa).

**Regras de negócio**
- Se o motoboy recusar ou não responder em 30 segundos, a corrida passa para o **próximo motoboy mais próximo**.
- Sem motoboy disponível, o restaurante é avisado e pode **buscar novamente**.
- O motoboy só sai para o cliente depois de digitar o código de retirada correto.
- Cada usuário acessa somente a área do seu perfil, e cada restaurante vê somente os próprios pedidos.

---

## Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** (`front/`) | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Lucide (ícones), Socket.io Client |
| **Backend** (`back/`) | Node.js, Express 5, TypeScript (executado com `tsx`), Prisma ORM 7, Zod (validação), JWT + bcrypt (autenticação), Socket.io (tempo real) |
| **Banco de dados** | PostgreSQL 17 com a extensão **PostGIS**, usada para a busca de motoboys por proximidade (`ST_DWithin` / `ST_Distance`) |
| **Infraestrutura** | Docker, para subir o banco com PostGIS sem instalar nada além do Docker |
| **Testes de API** (`bruno/`) | Coleção do [Bruno](https://www.usebruno.com/) com todas as rotas, opcional |

---

## Arquitetura

```
motoflash/
├── back/                 API REST + WebSocket
│   ├── prisma/           schema.prisma, migrations e seed (dados de exemplo)
│   └── src/
│       ├── routes/       definição das rotas Express
│       ├── controllers/  recebem a requisição e validam a entrada (Zod)
│       ├── services/     regras de negócio (despacho de corrida, código, financeiro)
│       ├── repositories/ acesso ao banco via Prisma
│       ├── middlewares/  autenticação JWT e controle de perfil
│       └── lib/          cliente Prisma e servidor Socket.io
├── front/                Aplicação web (SPA)
│   └── src/
│       ├── pages/        telas de auth, restaurant e motoboy
│       ├── layouts/      estrutura de cada área (menu lateral + cabeçalho)
│       ├── components/   componentes visuais reutilizáveis
│       ├── auth/         sessão, login e proteção de rotas por perfil
│       ├── hooks/        useResource (busca de dados + atualização automática)
│       └── lib/          cliente da API, Socket.io, formatação e status
└── bruno/                Coleção de requisições para testar a API manualmente
```

**Como as partes conversam**

```
Navegador (React, :5173)  ── HTTP/JSON + JWT ──▶  API Express (:3000)  ──▶  PostgreSQL + PostGIS (:5433)
          ▲                                             │
          └──────────── eventos Socket.io ──────────────┘
```

O frontend chama a API REST com o token JWT no cabeçalho `Authorization` e
mantém uma conexão Socket.io. A API emite eventos para a sala de cada usuário,
como `novo_pedido_disponivel`, `pedido_aceito`, `codigo_validado`,
`entrega_em_andamento` e `entrega_finalizada`. Assim as telas se atualizam na
hora. Se a conexão em tempo real cair, as telas também se atualizam sozinhas a
cada poucos segundos.

Mais detalhes do domínio e do fluxo estão em [back/README.md](back/README.md).

---

## Como rodar

O passo a passo serve para Windows, macOS e Linux.

### Pré-requisitos

| Ferramenta | Versão | Download |
|---|---|---|
| **Node.js** | 22 LTS ou mais recente | https://nodejs.org |
| **Docker Desktop** | qualquer versão recente | https://www.docker.com/products/docker-desktop |
| **Git** | qualquer versão | https://git-scm.com |

> Abra o **Docker Desktop** e espere ele terminar de iniciar antes de continuar.

### 1. Clonar o repositório

```bash
git clone https://github.com/Elinton-Souza/motoflash.git
cd motoflash
```

### 2. Subir o banco de dados (PostgreSQL + PostGIS)

```bash
docker run -d --name motoflash-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=motoflash -p 5433:5432 postgis/postgis:17-3.5
```

O comando baixa a imagem (só na primeira vez) e deixa o banco rodando na porta
**5433**. Essa porta foi escolhida para não conflitar com um PostgreSQL que
você já tenha instalado na 5432.

### 3. Configurar e iniciar o backend

```bash
cd back
```

Crie o arquivo `.env` a partir do exemplo:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Abra o `back/.env` e ajuste estas duas linhas:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/motoflash?schema=public"
JWT_KEY="coloque-aqui-qualquer-texto-longo-e-secreto"
```

Instale as dependências, crie as tabelas, cadastre os dados de exemplo e
inicie a API:

```bash
npm install                 # também gera o cliente do Prisma
npx prisma migrate deploy   # cria as tabelas e habilita o PostGIS
npm run prisma:seed         # cria os usuários de demonstração
npm run dev                 # API em http://localhost:3000
```

Quando aparecer `Servidor Motoflash rodando na porta: 3000`, deixe esse
terminal aberto.

### 4. Iniciar o frontend

Em **outro terminal**, a partir da raiz do projeto:

```bash
cd front
npm install
npm run dev                 # app em http://localhost:5173
```

### 5. Acessar

Abra **http://localhost:5173** e entre com uma das
[contas de demonstração](#contas-de-demonstração).

> **Dica:** cada aba do navegador guarda o próprio login. Abra uma aba para o
> restaurante e outra para o motoboy e acompanhe os dois lados ao mesmo tempo.

### Nas próximas vezes

Com tudo já instalado, basta:

```bash
docker start motoflash-db     # 1. banco (com o Docker Desktop aberto)
cd back  && npm run dev       # 2. API, num terminal
cd front && npm run dev       # 3. app, em outro terminal
```

---

## Contas de demonstração

A senha de todas as contas é **`123456`**.

| Perfil | Nome | E-mail |
|---|---|---|
| Restaurante | Pizzaria do Zé (Ana Ferreira) | `restaurante@motoflash.com` |
| Restaurante | Burger House (Beatriz Lima) | `restaurante2@motoflash.com` |
| Motoboy | Carlos Silva | `motoboy@motoflash.com` |
| Motoboy | Mateus Rocha | `motoboy2@motoflash.com` |

Também é possível criar novas contas pela tela de login, em **"Criar conta"**.

---

## Roteiro de teste

Fluxo completo de uma entrega, com duas abas abertas em http://localhost:5173:

1. **Aba 1, motoboy:** entre com `motoboy@motoflash.com`. O botão no canto superior direito precisa mostrar **"Você está online"**. Se mostrar "Você está offline", clique nele.
2. **Aba 2, restaurante:** entre com `restaurante@motoflash.com`, vá em **Nova entrega**, preencha os dados e clique em **Solicitar motoboy**.
3. **Motoboy:** aparece o aviso **"Nova corrida disponível"**. Abra a solicitação e clique em **Aceitar entrega** em até 30 segundos.
4. **Restaurante:** recebe o aviso de aceite e vê o **código de retirada** na tela de acompanhamento.
5. **Motoboy:** digita o código, clica em **Confirmar retirada**, depois em **Iniciar rota até o cliente** e por fim em **Finalizar entrega**.
6. **Os dois:** o pedido aparece como **Entregue** e o repasse entra no financeiro de cada um.

**Outros cenários**

| Cenário | Como testar |
|---|---|
| Repasse para outro motoboy | Deixe os dois motoboys online (3ª aba com `motoboy2@motoflash.com`) e recuse a corrida no primeiro que a receber |
| Nenhum motoboy disponível | Solicite uma entrega com todos os motoboys offline e use o botão **Buscar novamente** depois de ficar online |
| Acesso bloqueado por perfil | Logado como motoboy, tente abrir `http://localhost:5173/restaurant/dashboard`: você volta para a sua área |
| Código de retirada errado | Digite um código diferente do mostrado ao restaurante |

---

## Comandos úteis

| Onde | Comando | O que faz |
|---|---|---|
| `back/` | `npm run dev` | Inicia a API e reinicia sozinha a cada alteração |
| `back/` | `npm run prisma:seed` | Recria os usuários de demonstração, se não existirem |
| `back/` | `npm run prisma:studio` | Abre uma interface visual do banco no navegador |
| `front/` | `npm run dev` | Inicia o frontend |
| `front/` | `npm run build` | Checa os tipos e gera a versão de produção em `front/dist` |
| `front/` | `npm run lint` | Verifica o código com ESLint |
| raiz | `docker stop motoflash-db` | Desliga o banco |
| raiz | `docker rm -f motoflash-db` | **Apaga** o banco e todos os dados. Para recomeçar do zero, repita os passos 2 e 3 |

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `failed to connect to the docker API` | O Docker Desktop não está aberto. Abra e espere iniciar. |
| `docker: Conflict. The container name "/motoflash-db" is already in use` | O banco já foi criado antes. Use `docker start motoflash-db`. |
| `port is already allocated` ao subir o banco | Outro programa usa a porta 5433. Troque `-p 5433:5432` por `-p 5434:5432` e ajuste a porta no `DATABASE_URL`. |
| `Can't reach database server` ao rodar o Prisma | O container não está rodando (`docker start motoflash-db`) ou a porta no `.env` está errada. |
| Tela de login diz *"Não foi possível conectar ao servidor"* | A API não está rodando. Rode `npm run dev` em `back/`. |
| `E-mail ou senha inválidos` com as contas de demonstração | O seed não foi executado. Rode `npm run prisma:seed` em `back/`. |
| O motoboy não recebe a corrida | Confira se ele está **online** (botão no painel do motoboy) antes de o restaurante solicitar. |
| A API está em outra porta ou máquina | Crie `front/.env.local` com `VITE_API_URL=http://endereco:porta` e reinicie o frontend. |

---

## API

Principais rotas (todas, exceto `/auth`, exigem `Authorization: Bearer <token>`):

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cria uma conta |
| POST | `/auth/login` | — | Autentica e devolve o token JWT |
| GET / PUT | `/users/me` | todos | Consulta e edita o próprio perfil |
| PUT | `/users/me/status` | motoboy | Fica online ou offline |
| PUT | `/users/me/location` | motoboy | Atualiza a localização |
| GET | `/users/couriers` | restaurante | Motoboys conectados |
| POST / GET | `/orders` | restaurante | Cria e lista pedidos |
| PUT | `/orders/:id/ready` | restaurante | Marca o pedido como pronto |
| POST | `/orders/:id/request-courier` | restaurante | Busca o motoboy mais próximo |
| GET | `/deliveries/offers/pending` | motoboy | Oferta de corrida aguardando resposta |
| POST | `/deliveries/offers/:id/accept` · `/reject` | motoboy | Aceita ou recusa a corrida |
| POST | `/deliveries/:id/validate-code` | motoboy | Confirma a retirada com o código |
| POST | `/deliveries/:id/start-route` · `/complete` | motoboy | Inicia a rota e finaliza a entrega |
| GET | `/finance/courier/daily` · `/history` | motoboy | Financeiro do motoboy |
| GET | `/finance/restaurant/summary` | restaurante | Financeiro do restaurante |

Para testar a API sem o frontend, use a coleção do Bruno em [bruno/](bruno/README.md).

---

## Limitações conhecidas

- **Mapa ilustrativo:** as telas mostram um mapa simulado. Ainda não há integração com um serviço de mapas.
- **Localização simulada:** o sistema ainda não converte endereços em coordenadas (geocodificação). Para a busca por proximidade funcionar, as posições do cliente e do motoboy são geradas perto de um ponto de referência em São Paulo ([front/src/lib/location.ts](front/src/lib/location.ts)).
- **Ainda não implementado:** avaliação do motoboy por estrelas, relatório em PDF, pagamento por QR Code e painel do administrador.
