import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("tarefas")
export class Tarefa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ type: "boolean", default: false })
  concluida!: boolean;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  criadaEm!: Date;

  @Column()
  materiaId!: number;

  @Column()
  usuarioId!: number;
}