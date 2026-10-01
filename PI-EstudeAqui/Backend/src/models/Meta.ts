import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

export type MetaTipo = "diaria" | "semanal" | "mensal";
export type MetaStatus = "nao_iniciada" | "em_andamento" | "concluida";

@Entity("metas")
export class Meta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  titulo!: string;

  @Column({ type: "enum", enum: ["diaria", "semanal", "mensal"], default: "semanal" })
  tipo!: MetaTipo;

  @Column({ type: "date", nullable: true })
  prazo!: string | null;

  @Column({ type: "enum", enum: ["nao_iniciada", "em_andamento", "concluida"], default: "nao_iniciada" })
  status!: MetaStatus;

  @Column({ default: false })
  principal!: boolean;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  criadaEm!: Date;

  @Column()
  usuarioId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "usuarioId" })
  usuario!: User;
}