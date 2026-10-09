import { Router } from "express";

import { AtividadeController } from "../controllers/AtividadeController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/tarefas/:tarefaId/atividades",
  authMiddleware,
  AtividadeController.listar
);

router.post(
  "/tarefas/:tarefaId/atividades/gerar",
  authMiddleware,
  AtividadeController.gerar
);

router.post(
  "/atividades/:id/corrigir",
  authMiddleware,
  AtividadeController.corrigir
);

export default router;