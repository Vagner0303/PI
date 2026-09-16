import { Router } from 'express'
import { MateriaController } from '../controllers/MateriasController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const materiaController = new MateriaController()

router.get('/materias', materiaController.listar)
router.get('/materias/:id', materiaController.buscarPorId)
router.post('/materias', authMiddleware, materiaController.criar)
router.patch('/materias/:id', authMiddleware, materiaController.atualizar)
router.delete('/materias/:id', authMiddleware, materiaController.excluir)

export default router