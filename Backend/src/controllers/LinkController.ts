import { Request, Response } from "express";
import { LinkService } from "../services/LinkService";

const service = new LinkService();

// ajuste de onde vem o id do usuário (depende do seu authMiddleware / jwtTypes)
const getUserId = (req: Request) => (req as any).user.id as number;

export class LinkController {
  static async listar(req: Request, res: Response) {
    const links = await service.listar(Number(req.params.materiaId), getUserId(req));
    return res.json(links);
  }

  static async criar(req: Request, res: Response) {
    try {
      const link = await service.criar(Number(req.params.materiaId), getUserId(req), req.body);
      return res.status(201).json(link);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async excluir(req: Request, res: Response) {
    const ok = await service.excluir(Number(req.params.id), getUserId(req));
    if (!ok) return res.status(404).json({ message: "Link não encontrado." });
    return res.status(204).send();
  }
}