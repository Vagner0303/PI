import { AppDataSource } from "../config/dataSource"; // ajuste para o nome que você exporta
import { Tarefa } from "../models/Tarefa";
import { CreateTarefaDTO } from "../dtos/CreateTarefaDTO";

export class TarefaService {
  private repo = AppDataSource.getRepository(Tarefa);

  listar(materiaId: number, usuarioId: number) {
    return this.repo.find({
      where: { materiaId, usuarioId },
      order: { criadaEm: "DESC" },
    });
  }

  async buscar(id: number, usuarioId: number) {
    const tarefa = await this.repo.findOneBy({ id, usuarioId });
    if (!tarefa) throw new Error("Tarefa não encontrada.");
    return tarefa;
  }

  async criar(materiaId: number, usuarioId: number, dto: CreateTarefaDTO) {
    const titulo = dto.titulo?.trim();
    if (!titulo) throw new Error("Informe o nome da tarefa.");
    if (titulo.length > 150) throw new Error("O nome deve ter no máximo 150 caracteres.");

    const tarefa = this.repo.create({
      titulo,
      descricao: dto.descricao?.trim() || null,
      materiaId,
      usuarioId,
    });
    return this.repo.save(tarefa);
  }

  async excluir(id: number, usuarioId: number) {
    const tarefa = await this.repo.findOneBy({ id, usuarioId });
    if (!tarefa) throw new Error("Tarefa não encontrada.");
    await this.repo.remove(tarefa);
  }
}