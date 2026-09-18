import { Request, Response, NextFunction } from "express"
import type { AuthenticatedUser } from "./authMiddleware"

// Restringe uma rota a um ou mais papéis (RESTAURANT, MOTOBOY, ADMIN).
// Deve ser usado sempre depois do authMiddleware.
export function roleMiddleware(...allowedRoles: AuthenticatedUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado" })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Você não tem permissão para acessar este recurso" })
      return
    }

    next()
  }
}
