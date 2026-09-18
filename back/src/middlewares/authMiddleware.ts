import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export type AuthenticatedUser = {
  id: string
  name: string
  role: "RESTAURANT" | "MOTOBOY" | "ADMIN"
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

// Valida o token JWT enviado no header Authorization: Bearer <token>
// e popula req.user com os dados básicos do usuário logado.
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers

  if (!authorization) {
    res.status(401).json({ error: "Token não informado" })
    return
  }

  const token = authorization.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY as string) as AuthenticatedUser
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado" })
  }
}
