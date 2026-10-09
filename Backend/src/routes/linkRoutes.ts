import { Router } from "express";
import { LinkController } from "../controllers/LinkController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/materias/:materiaId/links", authMiddleware, LinkController.listar);
router.post("/materias/:materiaId/links", authMiddleware, LinkController.criar);
router.delete("/links/:id", authMiddleware, LinkController.excluir);

export default router;