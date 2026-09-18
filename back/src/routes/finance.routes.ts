import { Router } from "express"
import { FinanceController } from "../controllers/FinanceController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { roleMiddleware } from "../middlewares/roleMiddleware"

const router = Router()
const financeController = new FinanceController()

router.use(authMiddleware)

router.get("/courier/daily", roleMiddleware("MOTOBOY"), (req, res) => financeController.courierDailySummary(req, res))
router.get("/courier/history", roleMiddleware("MOTOBOY"), (req, res) => financeController.courierHistory(req, res))
router.get("/restaurant/summary", roleMiddleware("RESTAURANT"), (req, res) => financeController.restaurantSummary(req, res))

export default router
