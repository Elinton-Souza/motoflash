import { Request, Response } from "express"
import { FinanceService } from "../services/FinanceService"

const financeService = new FinanceService()

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export class FinanceController {
  // Dashboard financeiro do motoboy (tela "Hoje": ganhos, total de corridas, médias).
  async courierDailySummary(req: Request, res: Response) {
    const date = parseDate(req.query.date) ?? new Date()
    const summary = await financeService.getCourierDailySummary(req.user!.id, date)
    res.status(200).json(summary)
  }

  async courierHistory(req: Request, res: Response) {
    const history = await financeService.getCourierHistory(req.user!.id)
    res.status(200).json(history)
  }

  // Tela "Histórico — Hoje" do restaurante, com repasses por motoboy.
  // Aceita "?date=YYYY-MM-DD" para consultar outro dia.
  async restaurantSummary(req: Request, res: Response) {
    const date = parseDate(req.query.date) ?? new Date()
    const summary = await financeService.getRestaurantFinanceSummary(req.user!.id, date)
    res.status(200).json(summary)
  }
}
