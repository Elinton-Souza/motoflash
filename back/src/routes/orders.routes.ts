import { Router } from "express"
import { OrderController } from "../controllers/OrderController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { roleMiddleware } from "../middlewares/roleMiddleware"

const router = Router()
const orderController = new OrderController()

router.use(authMiddleware, roleMiddleware("RESTAURANT"))

router.post("/", (req, res) => orderController.create(req, res))
router.get("/", (req, res) => orderController.list(req, res))
router.get("/:id", (req, res) => orderController.getById(req, res))
router.put("/:id/ready", (req, res) => orderController.markReady(req, res))
router.post("/:id/request-courier", (req, res) => orderController.requestCourier(req, res))

export default router
