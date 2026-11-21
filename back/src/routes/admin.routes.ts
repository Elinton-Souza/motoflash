import { Router } from "express"
import { AdminController } from "../controllers/AdminController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { roleMiddleware } from "../middlewares/roleMiddleware"

const router = Router()
const adminController = new AdminController()

// Todas as rotas de administração exigem login com o perfil ADMIN.
router.use(authMiddleware, roleMiddleware("ADMIN"))

router.get("/couriers", (req, res) => adminController.listCouriers(req, res))
router.get("/couriers/:id", (req, res) => adminController.getCourier(req, res))

export default router
