import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("links")
@Index(["materiaId", "usuarioId"])
export class Link {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nome!: string;

  @Column({ length: 2048 })
  url!: string;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  criadaEm!: Date;

  @Column()
  materiaId!: number;

  @Column()
  usuarioId!: number;
}