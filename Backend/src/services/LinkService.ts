import { AppDataSource } from "../config/dataSource"; // ajuste ao nome exportado no seu dataSource.ts
import { Link } from "../models/Link";
import { CreateLinkDTO } from "../dtos/CreateLinkDTO";

export class LinkService {
  private repo = AppDataSource.getRepository(Link);

  listar(materiaId: number, usuarioId: number) {
    return this.repo.find({
      where: { materiaId, usuarioId },
      order: { criadaEm: "ASC" },
    });
  }

  async criar(materiaId: number, usuarioId: number, dto: CreateLinkDTO) {
    const nome = dto.nome?.trim();
    const url = dto.url?.trim();

    if (!nome || !url) throw new Error("Nome e link são obrigatórios.");

    // só aceita http/https (bloqueia javascript:, data:, etc.)
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Link inválido.");
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("O link deve começar com http:// ou https://");
    }

    const link = this.repo.create({ nome, url: parsed.toString(), materiaId, usuarioId });
    return this.repo.save(link);
  }

  async excluir(id: number, usuarioId: number) {
    const result = await this.repo.delete({ id, usuarioId });
    return (result.affected ?? 0) > 0;
  }
}