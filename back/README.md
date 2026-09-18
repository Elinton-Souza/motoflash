# Motoflash — Backend

API do Motoflash: marketplace de entregas por motoboy, conectando restaurantes
(Ana) a motoboys (Carlos) com alocação por proximidade (PostGIS) e
atualização de status em tempo real (Socket.io).

## Arquitetura

```
src/
  controllers/   -> recebem a requisição HTTP, validam entrada (zod) e chamam o service
  services/      -> regras de negócio (dispatch de corrida, validação de código, financeiro...)
  repositories/  -> acesso ao banco via Prisma (única camada que fala com o Prisma)
  routes/        -> definição das rotas Express, ligadas aos controllers
  middlewares/   -> authMiddleware (JWT) e roleMiddleware (RESTAURANT/MOTOBOY/ADMIN)
  utils/         -> geração do código de retirada de 4 dígitos
  lib/           -> prisma.ts (client) e socket.ts (Socket.io)
  app.ts         -> configuração do Express (rotas, cors, json)
  server.ts      -> sobe o servidor HTTP + inicializa o Socket.io
```

## Domínio (prisma/schema.prisma)

- `User` — um único model para Restaurante, Motoboy e Admin (campo `role`).
  Os campos de cada perfil (endereço do restaurante, placa do motoboy,
  localização atual etc.) ficam opcionais no mesmo model, para simplificar o MVP.
- `Order` — pedido criado pelo restaurante, já com o código de retirada de 4 dígitos.
- `Delivery` — a "corrida": vínculo entre o pedido e o motoboy, com o ciclo de status.
- `DeliveryOffer` — cada oferta de corrida enviada a um motoboy, com prazo de 30s.
- `Transaction` — lançamentos financeiros (repasses ao motoboy).

## Fluxo principal (Épicos 2, 3 e 4)

1. Restaurante cria o pedido (`POST /orders`) e marca como pronto (`PUT /orders/:id/ready`).
2. Restaurante solicita um motoboy (`POST /orders/:id/request-courier`).
3. O backend busca, via PostGIS (`ST_DWithin` / `ST_Distance`), o motoboy "Online"
   mais próximo e envia a oferta (evento `novo_pedido_disponivel`) com prazo de 30s.
4. Se o motoboy não responder a tempo, ou recusar, a corrida é repassada
   automaticamente para o próximo motoboy mais próximo.
5. Motoboy aceita (`POST /deliveries/offers/:offerId/accept`) → restaurante recebe
   o evento `pedido_aceito` com nome do motoboy e distância.
6. Motoboy digita o código de retirada (`POST /deliveries/:id/validate-code`) →
   se bater com o código do pedido, libera a rota até o cliente e emite `codigo_validado`.
7. Motoboy finaliza a entrega (`POST /deliveries/:id/complete`) → gera o repasse
   (`earning`) e libera o motoboy para novas corridas.
8. Dashboards financeiros: `GET /finance/courier/daily` (Carlos) e
   `GET /finance/restaurant/summary` (Ana).

## Como rodar

```bash
cp .env.example .env
# edite DATABASE_URL (Postgres com a extensão PostGIS) e JWT_KEY

npm install

# cria as tabelas + habilita a extensão PostGIS (migration em prisma/migrations/0_init)
npx prisma migrate deploy
# (em desenvolvimento, "npx prisma migrate dev" também funciona)

npm run prisma:seed   # cria um restaurante, um motoboy e um admin de exemplo

npm run dev            # http://localhost:3000
```

> Este ambiente de sandbox não tem acesso à internet para baixar os binários
> do Prisma (`prisma generate` falhou aqui por bloqueio de rede). Rode
> `npm install` na sua máquina normalmente — o `postinstall` cuida do
> `prisma generate` sozinho.

Usuários de exemplo (senha `123456`):
- `restaurante@motoflash.com` (RESTAURANT)
- `motoboy@motoflash.com` (MOTOBOY)
- `admin@motoflash.com` (ADMIN)

## Eventos WebSocket (Socket.io)

O cliente deve conectar informando o próprio id em `socket.handshake.auth.userId`
(o id do usuário logado) para entrar na sala `user:<id>` e receber:

- `novo_pedido_disponivel` — nova oferta de corrida para o motoboy (exigido pelo Épico 4)
- `pedido_aceito` — avisa o restaurante que um motoboy aceitou a corrida (Épico 4)
- `codigo_validado` — avisa o restaurante que o código de retirada foi confirmado (Épico 4)
- `entrega_em_andamento` — avisa o restaurante que o motoboy iniciou a rota até o cliente
  (mantém o painel de rastreamento em "Em entrega")
- `entrega_finalizada` — avisa o restaurante que a corrida foi concluída
- `localizacao_motoboy_atualizada` — posição atual do motoboy (lat/lng), emitida a cada
  chamada de `PUT /users/me/location` enquanto ele estiver em uma entrega ativa

## Pendências fora deste escopo (backend "por enquanto")

- Geração/exportação de PDF do relatório financeiro do motoboy
- Avaliação do motoboy por estrelas (o campo `rating` já existe em `Delivery`
  e `ratingAvg`/`ratingCount` em `User`, mas o endpoint ainda não foi criado)
- QR Code de pagamento na finalização da corrida
