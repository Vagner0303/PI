import { AppDataSource } from "../config/dataSource"; // ajuste ao nome exportado no seu dataSource.ts
import { Meta } from "../models/Meta";
import { CreateMetaDTO } from "../dtos/CreateMetaDTO";

export const MAX_PRINCIPAIS = 3;

export class MetaError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

const repo = () => AppDataSource.getRepository(Meta);

async function buscarDoUsuario(id: number, usuarioId: number) {
  const meta = await repo().findOneBy({ id, usuarioId });
  if (!meta) throw new MetaError("Meta não encontrada.", 404);
  return meta;
}

export class MetaService {
  static async listar(usuarioId: number) {
    return repo()
      .createQueryBuilder("m")
      .where("m.usuarioId = :usuarioId", { usuarioId })
      .andWhere("m.status != :concluida", { concluida: "concluida" })
      .orderBy("m.criadaEm", "ASC")
      .getMany();
  }

  static async criar(usuarioId: number, dto: CreateMetaDTO) {
    const titulo = dto.titulo?.trim();
    if (!titulo) throw new MetaError("O título da meta é obrigatório.");
    if (titulo.length > 150) throw new MetaError("O título deve ter no máximo 150 caracteres.");

    const meta = repo().create({
      titulo,
      tipo: dto.tipo ?? "semanal",
      prazo: dto.prazo || null,
      usuarioId,
    });
    return repo().save(meta);
  }

  static async iniciar(id: number, usuarioId: number) {
    const meta = await buscarDoUsuario(id, usuarioId);
    meta.status = "em_andamento";
    return repo().save(meta);
  }

  static async concluir(id: number, usuarioId: number) {
    const meta = await buscarDoUsuario(id, usuarioId);
    meta.status = "concluida";
    meta.principal = false; // libera a vaga de principal
    return repo().save(meta);
  }

  static async definirPrincipal(id: number, usuarioId: number, principal: boolean) {
    const meta = await buscarDoUsuario(id, usuarioId);

    if (principal && !meta.principal) {
      const total = await repo().countBy({ usuarioId, principal: true });
      if (total >= MAX_PRINCIPAIS) {
        throw new MetaError(`Você já tem ${MAX_PRINCIPAIS} metas principais. Remova uma para marcar outra.`);
      }
    }

    meta.principal = principal;
    return repo().save(meta);
  }

  static async resumoSemanal(usuarioId: number) {
    const base = () =>
        repo()
            .createQueryBuilder("m")
            .where("m.usuarioId = :usuarioId", { usuarioId })
            .andWhere("m.tipo = :tipo", { tipo: "semanal" })
            .andWhere("YEARWEEK(m.criadaEm, 1) = YEARWEEK(CURDATE(), 1)"); // semana começando na segunda

    const total = await base().getCount();
    const concluidas = await base().andWhere("m.status = :s", { s: "concluida" }).getCount();
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    return { total, concluidas, percentual };
}

  static async excluir(id: number, usuarioId: number) {
    const meta = await buscarDoUsuario(id, usuarioId);
    await repo().remove(meta);
  }
}