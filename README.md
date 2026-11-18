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
- [WhatsApp](#whatsapp)
- [GPS e mapa](#gps-e-mapa)
- [Comandos úteis](#comandos-úteis)
- [Problemas comuns](#problemas-comuns)
- [API](#api)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Funcionalidades

**Acesso**
- Login separado para cada perfil: **motoboy** (tela pensada para o celular, com campos e botões grandes) e **restaurante** (tela para o computador do balcão). Uma conta de motoboy não entra pelo acesso do restaurante e vice-versa.
- Cadastro com validação (WhatsApp com DDD, placa da moto, confirmação de senha).
- **Esqueci a senha**: código de 6 dígitos enviado ao WhatsApp cadastrado.

**Restaurante**
- Criar uma entrega com o WhatsApp do cliente e o endereço com **sugestões e ponto no mapa**. O sistema busca automaticamente o motoboy online mais próximo **do restaurante**, num raio de 5 km.
- **Tela de pedidos**: fila com todos os pedidos, filtros (em andamento, sem motoboy, entregues, cancelados), busca e botão para pedir motoboy.
- **Mapa interativo** (OpenStreetMap) com restaurante, cliente, a rota e a **posição do motoboy em tempo real** (GPS do celular dele).
- Fluxo do pedido em tempo real: buscando motoboy → a caminho da coleta → retirado → a caminho do cliente → entregue.
- **Dois códigos de confirmação**: o de retirada (restaurante → motoboy) e o do cliente (cliente → motoboy), que o cliente recebe no **WhatsApp**.
- Cancelar o pedido enquanto ainda não há motoboy.
- Painel do dia, histórico e financeiro com repasses por motoboy.

**Motoboy**
- Ficar online ou offline. Online, o **GPS do celular** envia a posição para a busca por proximidade e para o mapa do restaurante.
- Receber o aviso de nova corrida em tempo real, com mapa, distâncias e ganho, e aceitar ou recusar em até 30 segundos.
- Confirmar a retirada com o código do restaurante; a rota até o cliente só aparece depois disso.
- Abrir a navegação no **Google Maps** ou no **Waze** com um toque.
- Finalizar a entrega com o **código que o cliente recebeu no WhatsApp**.
- Ver ganhos do dia, média por entrega, resumo da semana e histórico.

**Regras de negócio**
- Se o motoboy recusar ou não responder em 30 segundos, a corrida passa para o **próximo motoboy mais próximo**.
- Sem motoboy disponível, o restaurante é avisado e pode **buscar novamente**.
- O motoboy só sai para o cliente depois de digitar o código de retirada correto, e só finaliza com o código do cliente.
- O motoboy nunca recebe os códigos pela API: um vem do balcão, o outro do cliente.
- Cada usuário acessa somente a área do seu perfil, e cada restaurante vê somente os próprios pedidos.

---

## Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** (`front/`) | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Lucide (ícones), Socket.io Client, Leaflet + React Leaflet (mapa) |
| **Backend** (`back/`) | Node.js, Express 5, TypeScript (executado com `tsx`), Prisma ORM 7, Zod (validação), JWT + bcrypt (autenticação), Socket.io (tempo real) |
| **Mapas e GPS** | OpenStreetMap (mapa), Nominatim (endereço → coordenadas), OSRM (rota pelas ruas) e a Geolocation API do navegador (GPS do motoboy). Nenhum deles exige chave |
| **WhatsApp** | Twilio (sandbox gratuito) ou WhatsApp Cloud API da Meta. Sem configuração, as telas oferecem o envio por link `wa.me` |
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

Abra o `back/.env` e confira estas duas linhas (se você já tinha um `.env`
antigo, confira se a porta é **5433**):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/motoflash?schema=public"
JWT_KEY="coloque-aqui-qualquer-texto-longo-e-secreto"
```

O WhatsApp é opcional para rodar o projeto. Veja [WhatsApp](#whatsapp).

Instale as dependências, crie as tabelas, cadastre os dados de exemplo e
inicie a API:

```bash
npm install                 # também gera o cliente do Prisma
npx prisma migrate deploy   # cria/atualiza as tabelas e habilita o PostGIS
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

Abra **http://localhost:5173**, escolha o perfil e entre com uma das
[contas de demonstração](#contas-de-demonstração).

| Tela | Endereço |
|---|---|
| Escolher perfil | http://localhost:5173 |
| Login do motoboy | http://localhost:5173/entrar/motoboy |
| Login do restaurante | http://localhost:5173/entrar/restaurante |

> **Dica:** cada aba do navegador guarda o próprio login. Abra uma aba para o
> restaurante e outra para o motoboy e acompanhe os dois lados ao mesmo tempo.
> Para ver o motoboy no formato de celular, use o modo dispositivo do
> navegador (F12 → ícone de celular).

> **Já tinha o projeto rodando?** Depois de atualizar o código, rode de novo
> `npm install` em `back/` e em `front/`, e `npx prisma migrate deploy` e
> `npm run prisma:seed` em `back/`. Isso cria as novas colunas e coloca o
> WhatsApp e a localização nas contas de demonstração.

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

Também é possível criar novas contas pela tela de login, em **"Cadastre-se"**.

Os WhatsApps das contas de demonstração são fictícios. Para receber as
mensagens de verdade, troque pelo seu número no perfil (motoboy) ou em
Configurações (restaurante).

---

## Roteiro de teste

Fluxo completo de uma entrega, com duas abas abertas em http://localhost:5173:

1. **Aba 1, motoboy:** entre em `/entrar/motoboy` com `motoboy@motoflash.com`. O botão grande precisa mostrar **"Você está online"**. Se mostrar "Você está offline", toque nele e **permita a localização** quando o navegador pedir.
2. **Aba 2, restaurante:** entre em `/entrar/restaurante` com `restaurante@motoflash.com`, vá em **Nova entrega**, preencha nome, WhatsApp e endereço do cliente (escolha uma das sugestões para marcar o ponto no mapa) e clique em **Solicitar motoboy**.
3. **Restaurante:** na tela de acompanhamento aparecem o **código de retirada** e o **código do cliente**. Use **Enviar código pelo WhatsApp** para mandar o código ao cliente.
4. **Motoboy:** aparece o aviso **"Nova corrida disponível"**. Abra a corrida e toque em **Aceitar corrida** em até 30 segundos.
5. **Restaurante:** recebe o aviso de aceite e vê o motoboy se mexendo no mapa.
6. **Motoboy:** digita o código de retirada e toca em **Confirmar retirada**, depois em **Iniciar rota até o cliente**.
7. **Motoboy:** digita o **código do cliente** e toca em **Finalizar entrega**.
8. **Os dois:** o pedido aparece como **Entregue** e o repasse entra no financeiro de cada um.

**Outros cenários**

| Cenário | Como testar |
|---|---|
| Repasse para outro motoboy | Deixe os dois motoboys online (3ª aba com `motoboy2@motoflash.com`) e recuse a corrida no primeiro que a receber |
| Nenhum motoboy disponível | Solicite uma entrega com todos os motoboys offline e use o botão **Buscar novamente** depois de ficar online |
| Acesso bloqueado por perfil | Logado como motoboy, tente abrir `http://localhost:5173/restaurant/dashboard`: você volta para a sua área |
| Código de retirada errado | Digite um código diferente do mostrado ao restaurante |
| Código do cliente errado | Na hora de finalizar, digite um código diferente do que o cliente recebeu |
| Acesso pelo perfil errado | Tente entrar com a conta de motoboy em `/entrar/restaurante` |
| Esqueci a senha | Em qualquer login, clique em **Esqueci minha senha**. Sem WhatsApp configurado, o código aparece na própria tela (modo de teste) |
| Cancelar pedido | Na tela de acompanhamento, cancele enquanto o pedido ainda procura motoboy |

---

## WhatsApp

O sistema envia pelo WhatsApp:

- ao **cliente**: o código de confirmação da entrega (ao criar o pedido) e o aviso de que o pedido saiu;
- ao **restaurante**: o código de retirada quando um motoboy aceita, para conferir no balcão;
- a **qualquer usuário**: o código de recuperação de senha.

**Sem configurar nada**, as mensagens aparecem no terminal da API e a tela
de acompanhamento mostra o botão verde **Enviar código pelo WhatsApp**, que
abre o WhatsApp Web/app com a mensagem pronta para o cliente.

**Envio automático com o sandbox gratuito da Twilio:**

1. Crie uma conta em https://www.twilio.com e abra **Messaging → Try it out → Send a WhatsApp message**.
2. Do seu celular, mande a mensagem `join <palavra>` indicada para o número do sandbox. Faça o mesmo com cada número que vai receber mensagens nos testes.
3. No `back/.env`, preencha:

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_FROM=+14155238886
```

4. Reinicie a API (`npm run dev`).

Para usar a API oficial da Meta, use `WHATSAPP_PROVIDER=meta` com
`WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`.

## GPS e mapa

- O mapa usa o OpenStreetMap e precisa de internet.
- Os endereços viram coordenadas pelo Nominatim. Se ele não encontrar o endereço, escolha uma das sugestões do campo.
- No computador, o navegador pede permissão de localização em `http://localhost`. Se a permissão for negada, o motoboy continua funcionando com uma **localização aproximada**.
- **No celular**, os navegadores só liberam o GPS em páginas **HTTPS**. Para testar no celular, use um túnel HTTPS (por exemplo `npx localtunnel --port 5173`) ou publique o frontend com HTTPS.

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
| `The column ... does not exist` | O banco está desatualizado. Rode `npx prisma migrate deploy` em `back/`. |
| "Esta conta é de motoboy..." ao entrar | Você usou o login do outro perfil. Volte e escolha o perfil certo. |
| O mapa aparece cinza | Sem internet para carregar o OpenStreetMap. |
| "Permissão de localização negada" | Libere a localização para o site nas configurações do navegador (cadeado na barra de endereço). |

---

## API

Principais rotas (todas, exceto `/auth`, exigem `Authorization: Bearer <token>`):

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cria uma conta (restaurante ou motoboy) |
| POST | `/auth/login` | — | Autentica e devolve o token JWT. Aceita `role` para travar o perfil |
| POST | `/auth/forgot-password` | — | Envia o código de recuperação para o WhatsApp |
| POST | `/auth/reset-password` | — | Troca a senha com o código |
| GET | `/geo/search?q=` | todos | Sugestões de endereço com coordenadas |
| GET / PUT | `/users/me` | todos | Consulta e edita o próprio perfil |
| PUT | `/users/me/status` | motoboy | Fica online ou offline |
| PUT | `/users/me/location` | motoboy | Atualiza a localização |
| GET | `/users/couriers` | restaurante | Motoboys conectados |
| POST / GET | `/orders` | restaurante | Cria e lista pedidos |
| PUT | `/orders/:id/ready` | restaurante | Marca o pedido como pronto |
| POST | `/orders/:id/request-courier` | restaurante | Busca o motoboy mais próximo |
| POST | `/orders/:id/notify-customer` | restaurante | Reenvia o código ao cliente pelo WhatsApp |
| POST | `/orders/:id/cancel` | restaurante | Cancela um pedido ainda sem motoboy |
| GET | `/deliveries/offers/pending` | motoboy | Oferta de corrida aguardando resposta |
| POST | `/deliveries/offers/:id/accept` · `/reject` | motoboy | Aceita ou recusa a corrida |
| POST | `/deliveries/:id/validate-code` | motoboy | Confirma a retirada com o código |
| POST | `/deliveries/:id/start-route` | motoboy | Inicia a rota até o cliente |
| POST | `/deliveries/:id/complete` | motoboy | Finaliza a entrega com o código do cliente (`{ "code": "1234" }`) |
| GET | `/finance/courier/daily` · `/history` | motoboy | Financeiro do motoboy |
| GET | `/finance/restaurant/summary` | restaurante | Financeiro do restaurante |

Para testar a API sem o frontend, use a coleção do Bruno em [bruno/](bruno/README.md).

---

## Limitações conhecidas

- **GPS no celular exige HTTPS:** em `http://` pela rede local, o celular bloqueia a localização e o motoboy usa a posição aproximada.
- **Serviços públicos de mapa:** Nominatim e OSRM são gratuitos e têm limite de uso. Para produção, o ideal é um provedor próprio ou pago.
- **WhatsApp automático** depende de uma conta Twilio ou Meta. Sem ela, o envio é pelo botão com link.
- **Ainda não implementado:** avaliação do motoboy por estrelas, relatório em PDF, pagamento por QR Code e painel do administrador.
