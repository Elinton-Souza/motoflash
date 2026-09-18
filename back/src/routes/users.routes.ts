import { Router } from "express"
import { UserController } from "../controllers/UserController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { roleMiddleware } from "../middlewares/roleMiddleware"

const router = Router()
const userController = new UserController()

router.use(authMiddleware)

router.get("/me", (req, res) => userController.me(req, res))
router.put("/me", (req, res) => userController.updateProfile(req, res))
router.put("/me/status", roleMiddleware("MOTOBOY"), (req, res) => userController.updateCourierStatus(req, res))
router.put("/me/location", roleMiddleware("MOTOBOY"), (req, res) => userController.updateCourierLocation(req, res))

export default router
