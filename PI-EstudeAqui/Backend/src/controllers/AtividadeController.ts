import { Request, Response } from "express";

import {
  AtividadeService,
  AppError,
} from "../services/AtividadeService";

const service = new AtividadeService();

function responderErro(err: any, res: Response) {
  const status = err instanceof AppError ? err.status : 500;

  res
    .status(status)
    .json({ message: err.message || "Erro interno." });
}

export class AtividadeController {
  static async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const tarefaId = Number(req.params.tarefaId);

      res.json(
        await service.listar(tarefaId, usuarioId)
      );
    } catch (err: any) {
      responderErro(err, res);
    }
  }

  static async gerar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const tarefaId = Number(req.params.tarefaId);
      const substituir = req.body?.substituir === true;

      const atividades = await service.gerar(
        tarefaId,
        usuarioId,
        substituir
      );

      res.status(201).json(atividades);
    } catch (err: any) {
      responderErro(err, res);
    }
  }

  static async corrigir(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).user.id;
      const id = Number(req.params.id);

      res.json(
        await service.corrigir(
          id,
          usuarioId,
          req.body?.resposta
        )
      );
    } catch (err: any) {
      responderErro(err, res);
    }
  }
}