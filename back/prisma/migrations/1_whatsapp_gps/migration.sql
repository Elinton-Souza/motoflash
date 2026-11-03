-- Coordenadas do restaurante (ponto de coleta)
ALTER TABLE "users" ADD COLUMN "restaurantLat" DOUBLE PRECISION,
ADD COLUMN "restaurantLng" DOUBLE PRECISION;

-- Telefone do cliente (WhatsApp) e código de confirmação da entrega
ALTER TABLE "orders" ADD COLUMN "customerPhone" VARCHAR(20),
ADD COLUMN "deliveryCode" VARCHAR(6);

-- Recuperação de senha
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" VARCHAR(100) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "password_resets_userId_idx" ON "password_resets"("userId");

ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
