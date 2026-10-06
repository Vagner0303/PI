import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tarefa } from "./Tarefa";

@Entity("atividades")
export class Atividade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  pergunta!: string;

  /** Resposta esperada. NUNCA enviar ao front-end. */
  @Column({ type: "text" })
  gabarito!: string;

  @Column({ type: "text", nullable: true })
  respostaUsuario!: string | null;

  /** "correta" | "parcial" | "incorreta" | null (ainda não respondida) */
  @Column({ type: "varchar", length: 20, nullable: true })
  resultado!: string | null;

  @Column({ type: "text", nullable: true })
  feedback!: string | null;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  criadaEm!: Date;

  @Column()
  tarefaId!: number;

  // Ao excluir a tarefa, as atividades dela são apagadas junto
  @ManyToOne(() => Tarefa, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tarefaId" })
  tarefa?: Tarefa;

  @Column()
  usuarioId!: number;
}