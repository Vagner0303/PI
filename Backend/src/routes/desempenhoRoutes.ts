import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { DesempenhoController } from '../controllers/DesempenhoController'

const router = Router()
const controller = new DesempenhoController()

router.get('/desempenho', authMiddleware, controller.resumo)
router.post('/desempenho/tempo', authMiddleware, controller.registrarTempo)

export default router