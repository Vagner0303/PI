import { Router } from "express";
import { TarefaController } from "../controllers/TarefaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/materias/:materiaId/tarefas", authMiddleware, TarefaController.listar);
router.post("/materias/:materiaId/tarefas", authMiddleware, TarefaController.criar);
router.get("/tarefas/:id", authMiddleware, TarefaController.buscar);
router.delete("/tarefas/:id", authMiddleware, TarefaController.excluir);

export default router;