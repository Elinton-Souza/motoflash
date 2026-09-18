-- Habilita a extensão PostGIS, usada pelas consultas de proximidade
-- (ST_DWithin / ST_Distance) para localizar motoboys online próximos.
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RESTAURANT', 'MOTOBOY', 'ADMIN');
CREATE TYPE "CourierStatus" AS ENUM ('OFFLINE', 'ONLINE', 'ON_DELIVERY');
CREATE TYPE "OrderStatus" AS ENUM ('PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELED');
CREATE TYPE "DeliveryStatus" AS ENUM ('SEARCHING_COURIER', 'COURIER_ASSIGNED', 'PICKED_UP', 'IN_DELIVERY', 'DELIVERED', 'CANCELED', 'NO_COURIER_FOUND');
CREATE TYPE "DeliveryOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "TransactionType" AS ENUM ('EARNING', 'PAYOUT', 'FEE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantName" VARCHAR(80),
    "restaurantAddress" VARCHAR(160),
    "vehiclePlate" VARCHAR(10),
    "courierStatus" "CourierStatus" DEFAULT 'OFFLINE',
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "ratingAvg" DOUBLE PRECISION DEFAULT 5,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE SEQUENCE IF NOT EXISTS "orders_number_seq";

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT nextval('orders_number_seq'),
    "restaurantId" TEXT NOT NULL,
    "customerName" VARCHAR(80) NOT NULL,
    "customerAddress" VARCHAR(160) NOT NULL,
    "customerLat" DOUBLE PRECISION NOT NULL,
    "customerLng" DOUBLE PRECISION NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pickupCode" VARCHAR(6) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PREPARING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readyAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");
ALTER SEQUENCE "orders_number_seq" OWNED BY "orders"."number";

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierId" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'SEARCHING_COURIER',
    "distanceKm" DOUBLE PRECISION,
    "earning" DECIMAL(10,2),
    "acceptedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deliveries_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "deliveries_orderId_key" ON "deliveries"("orderId");

-- CreateTable
CREATE TABLE "delivery_offers" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "DeliveryOfferStatus" NOT NULL DEFAULT 'PENDING',
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    CONSTRAINT "delivery_offers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "delivery_offers_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "delivery_offers_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Índice espacial auxiliar: acelera buscas por motoboys próximos por
-- latitude/longitude quando combinado com ST_MakePoint nas queries.
CREATE INDEX "users_courier_location_idx" ON "users"("currentLat", "currentLng") WHERE "role" = 'MOTOBOY';
