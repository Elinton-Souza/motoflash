import { Request, Response } from "express"
import { GeocodingService } from "../services/GeocodingService"

const geocoding = new GeocodingService()

export class GeoController {
  // Sugestões de endereço para os formulários (autocompletar + mapa).
  async search(req: Request, res: Response) {
    const query = typeof req.query.q === "string" ? req.query.q : ""
    const suggestions = await geocoding.search(query)
    res.status(200).json(suggestions)
  }
}
