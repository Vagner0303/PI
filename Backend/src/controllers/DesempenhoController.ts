import { Request, Response, NextFunction } from 'express'
import { DesempenhoService } from '../services/DesempenhoService'

export const desempenhoService = new DesempenhoService()

export class DesempenhoController {
    async resumo(req: Request, res: Response, next: NextFunction) {
        try { res.status(200).json(await desempenhoService.resumo(req.user.id)) } catch (e) { next(e) }
    }
    async registrarTempo(req: Request, res: Response, next: NextFunction) {
        try { res.status(201).json(await desempenhoService.registrarTempo(req.user.id, req.body?.segundos)) } catch (e) { next(e) }
    }
}