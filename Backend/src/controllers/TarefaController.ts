import { Request, Response } from "express";
import { TarefaService } from "../services/TarefaService";

const service = new TarefaService();

export class TarefaController {
  static async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id; // mesmo jeito que o LinkController pega o usuário
      const materiaId = Number(req.params.materiaId);
      res.json(await service.listar(materiaId, usuarioId));
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async buscar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const id = Number(req.params.id);
      res.json(await service.buscar(id, usuarioId));
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const materiaId = Number(req.params.materiaId);
      const tarefa = await service.criar(materiaId, usuarioId, req.body);
      res.status(201).json(tarefa);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async excluir(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const id = Number(req.params.id);
      await service.excluir(id, usuarioId);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  }
}