import { Router } from "express";
import { MetaController } from "../controllers/MetaController";
import { authMiddleware } from "../middlewares/authMiddleware"; // ajuste ao seu export

const router = Router();
router.use(authMiddleware);

router.get("/metas", MetaController.listar);
router.post("/metas", MetaController.criar);
router.patch("/metas/:id/iniciar", MetaController.iniciar);
router.patch("/metas/:id/concluir", MetaController.concluir);
router.patch("/metas/:id/principal", MetaController.definirPrincipal); // body: { "principal": true | false }
router.delete("/metas/:id", MetaController.excluir);
router.get("/metas/resumo-semanal", MetaController.resumoSemanal);


export default router;