import { Router } from "express"
import { GeoController } from "../controllers/GeoController"
import { authMiddleware } from "../middlewares/authMiddleware"

const router = Router()
const geoController = new GeoController()

router.use(authMiddleware)

router.get("/search", (req, res) => geoController.search(req, res))

export default router
