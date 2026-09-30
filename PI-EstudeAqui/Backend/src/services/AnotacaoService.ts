import { AppDataSource } from "../config/dataSource"
import { Anotacao } from "../models/Anotacao"
import { CreateAnotacaoDTO } from "../dtos/CreateAnotacaoDTO"

export class AnotacaoService {
    private get repo() {
        return AppDataSource.getRepository(Anotacao)
    }

    /* confere se a matéria existe e pertence ao usuário */
    private async materiaDoUsuario(materiaId: number, usuarioId: number): Promise<boolean> {
        const rows = await AppDataSource.query(
            "SELECT id FROM materias WHERE id = ? AND usuario_id = ? LIMIT 1",
            [materiaId, usuarioId]
        )
        return rows.length > 0
    }

    /* retorna null se a matéria não for do usuário */
    async listar(materiaId: number, usuarioId: number): Promise<Anotacao[] | null> {
        if (!(await this.materiaDoUsuario(materiaId, usuarioId))) return null

        return this.repo.find({
            where: { materiaId, usuarioId },
            order: { criadaEm: "DESC" }
        })
    }

    async criar(materiaId: number, usuarioId: number, dados: CreateAnotacaoDTO): Promise<Anotacao | null> {
        if (!(await this.materiaDoUsuario(materiaId, usuarioId))) return null

        const anotacao = this.repo.create({
            titulo: dados.titulo.trim(),
            texto: dados.texto.trim(),
            materiaId,
            usuarioId
        })

        return this.repo.save(anotacao)
    }

    /* retorna false se não existir ou não for do usuário */
    async excluir(id: number, usuarioId: number): Promise<boolean> {
        const resultado = await this.repo.delete({ id, usuarioId })
        return (resultado.affected ?? 0) > 0
    }
}