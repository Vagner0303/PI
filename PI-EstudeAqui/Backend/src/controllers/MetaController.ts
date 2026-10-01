import { Request, Response } from "express";
import { MetaService, MetaError } from "../services/MetaService";

// Pegue o id do usuário do mesmo jeito que o MateriasController faz (vindo do authMiddleware)
const usuarioIdDe = (req: Request): number => (req as any).user.id;

function tratarErro(res: Response, erro: unknown) {
  if (erro instanceof MetaError) return res.status(erro.status).json({ message: erro.message });
  console.error(erro);
  return res.status(500).json({ message: "Erro interno do servidor." });
}

export class MetaController {
  static async listar(req: Request, res: Response) {
    try {
      res.json(await MetaService.listar(usuarioIdDe(req)));
    } catch (e) { tratarErro(res, e); }
  }

  static async criar(req: Request, res: Response) {
    try {
      res.status(201).json(await MetaService.criar(usuarioIdDe(req), req.body));
    } catch (e) { tratarErro(res, e); }
  }

  static async iniciar(req: Request, res: Response) {
    try {
      res.json(await MetaService.iniciar(Number(req.params.id), usuarioIdDe(req)));
    } catch (e) { tratarErro(res, e); }
  }

  static async concluir(req: Request, res: Response) {
    try {
      res.json(await MetaService.concluir(Number(req.params.id), usuarioIdDe(req)));
    } catch (e) { tratarErro(res, e); }
  }

  static async resumoSemanal(req: Request, res: Response) {
    try {
        res.json(await MetaService.resumoSemanal(usuarioIdDe(req)));
    } catch (e) { tratarErro(res, e); }
}

  static async definirPrincipal(req: Request, res: Response) {
    try {
      const principal = req.body.principal === true;
      res.json(await MetaService.definirPrincipal(Number(req.params.id), usuarioIdDe(req), principal));
    } catch (e) { tratarErro(res, e); }
  }

  static async excluir(req: Request, res: Response) {
    try {
      await MetaService.excluir(Number(req.params.id), usuarioIdDe(req));
      res.status(204).send();
    } catch (e) { tratarErro(res, e); }
  }
}