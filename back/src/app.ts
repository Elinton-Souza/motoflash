import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import usersRoutes from "./routes/users.routes"
import ordersRoutes from "./routes/orders.routes"
import deliveriesRoutes from "./routes/deliveries.routes"
import financeRoutes from "./routes/finance.routes"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/users", usersRoutes)
app.use("/orders", ordersRoutes)
app.use("/deliveries", deliveriesRoutes)
app.use("/finance", financeRoutes)

app.get("/", (_req, res) => {
  res.send("API Motoflash: marketplace de entregas por motoboy")
})

export default app
