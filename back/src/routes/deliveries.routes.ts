import { Router } from "express"
import { DeliveryController } from "../controllers/DeliveryController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { roleMiddleware } from "../middlewares/roleMiddleware"

const router = Router()
const deliveryController = new DeliveryController()

router.use(authMiddleware, roleMiddleware("MOTOBOY"))

router.get("/active", (req, res) => deliveryController.getActive(req, res))
router.post("/offers/:offerId/accept", (req, res) => deliveryController.acceptOffer(req, res))
router.post("/offers/:offerId/reject", (req, res) => deliveryController.rejectOffer(req, res))
router.post("/:id/validate-code", (req, res) => deliveryController.validatePickupCode(req, res))
router.post("/:id/start-route", (req, res) => deliveryController.startRoute(req, res))
router.post("/:id/complete", (req, res) => deliveryController.complete(req, res))

export default router
