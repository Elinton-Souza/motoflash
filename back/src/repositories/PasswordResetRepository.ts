import { prisma } from "../lib/prisma"

export class PasswordResetRepository {
  create(userId: string, codeHash: string, expiresAt: Date) {
    return prisma.passwordReset.create({ data: { userId, codeHash, expiresAt } })
  }

  // Último pedido de recuperação ainda válido (não usado e dentro do prazo).
  findLatestValid(userId: string) {
    return prisma.passwordReset.findFirst({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    })
  }

  // Quantos códigos o usuário pediu desde `since` (limite contra abuso).
  countSince(userId: string, since: Date) {
    return prisma.passwordReset.count({ where: { userId, createdAt: { gte: since } } })
  }

  registerAttempt(id: string) {
    return prisma.passwordReset.update({ where: { id }, data: { attempts: { increment: 1 } } })
  }

  // Invalida todos os códigos pendentes do usuário.
  markAllUsed(userId: string) {
    return prisma.passwordReset.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } })
  }
}
