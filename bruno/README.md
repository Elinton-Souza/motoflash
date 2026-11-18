# Motoflash API — coleção Bruno

Como usar:

1. Abra o Bruno (app desktop) → "Open Collection" → selecione esta pasta
   (`motoflash/bruno`).
2. No canto superior direito, selecione o ambiente **Local** (baseUrl já
   apontando pra `http://localhost:3000`).
3. Com o backend rodando (`npm run dev` dentro de `back/`) e o seed já
   populado (`npm run prisma:seed`), execute as pastas **em ordem, de cima
   para baixo**: 01-Auth → 02-Users → 03-Orders → 04-Deliveries → 05-Finance.
4. Cada request tem um script "post-response" que guarda automaticamente
   token, ids do pedido/entrega/oferta e os códigos em variáveis
   (`restToken`, `motoToken`, `orderId`, `deliveryId`, `offerId`,
   `pickupCode`, `deliveryCode` etc.), então as próximas requests já usam
   esses valores sem precisar copiar/colar nada. O `deliveryCode` é o
   código que o cliente recebe no WhatsApp e é exigido para finalizar.
5. Só rode "03 - Rejeitar Oferta (alternativo)" se quiser testar o repasse
   automático pro próximo motoboy — nesse seed só existe 1 motoboy, então
   depois de rejeitar a corrida vai ficar em "NO_COURIER_FOUND" (não tem
   pra quem repassar). Pra seguir o fluxo normal, use "02 - Aceitar Oferta".

Usuários do seed (senha `123456` para todos):
- restaurante@motoflash.com
- motoboy@motoflash.com
- admin@motoflash.com
