import { NextFunction, Request, Response } from "express"
import { AnotacaoService } from "../services/AnotacaoService"

const service = new AnotacaoService()

// AJUSTE: use o mesmo jeito que o LinkController pega o usuário do token
function getUserId(req: Request): number {
    return Number((req as any).user.id)
}

function parseId(valor: string | string[] | undefined): number | null {
    const v = Array.isArray(valor) ? valor[0] : valor
    const n = Number(v)
    return Number.isInteger(n) && n > 0 ? n : null
}

export class AnotacaoController {
    async listar(req: Request, res: Response, next: NextFunction) {
        try {
            const materiaId = parseId(req.params.materiaId)
            if (!materiaId) return res.status(400).json({ message: "Id da matéria inválido." })

            const notas = await service.listar(materiaId, getUserId(req))
            if (!notas) return res.status(404).json({ message: "Matéria não encontrada." })

            return res.json(notas)
        } catch (err) {
            next(err)
        }
    }

    async criar(req: Request, res: Response, next: NextFunction) {
        try {
            const materiaId = parseId(req.params.materiaId)
            if (!materiaId) return res.status(400).json({ message: "Id da matéria inválido." })

            const titulo = typeof req.body?.titulo === "string" ? req.body.titulo.trim() : ""
            const texto = typeof req.body?.texto === "string" ? req.body.texto.trim() : ""

            if (!titulo || !texto) {
                return res.status(400).json({ message: "Preencha o título e o texto." })
            }
            if (titulo.length > 150) {
                return res.status(400).json({ message: "O título deve ter no máximo 150 caracteres." })
            }

            const nota = await service.criar(materiaId, getUserId(req), { titulo, texto })
            if (!nota) return res.status(404).json({ message: "Matéria não encontrada." })

            return res.status(201).json(nota)
        } catch (err) {
            next(err)
        }
    }

    async excluir(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseId(req.params.id)
            if (!id) return res.status(400).json({ message: "Id inválido." })

            const ok = await service.excluir(id, getUserId(req))
            if (!ok) return res.status(404).json({ message: "Anotação não encontrada." })

            return res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}