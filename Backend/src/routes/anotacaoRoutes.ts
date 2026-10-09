import { Router } from "express"
import { AnotacaoController } from "../controllers/AnotacaoController"
import { authMiddleware } from "../middlewares/authMiddleware" // AJUSTE: confira o nome do export

const router = Router()
const controller = new AnotacaoController()

router.get("/materias/:materiaId/anotacoes", authMiddleware, (req, res, next) => controller.listar(req, res, next))
router.post("/materias/:materiaId/anotacoes", authMiddleware, (req, res, next) => controller.criar(req, res, next))
router.delete("/anotacoes/:id", authMiddleware, (req, res, next) => controller.excluir(req, res, next))

export default router