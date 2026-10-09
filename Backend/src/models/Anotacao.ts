import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity("anotacoes")
@Index("idx_anotacoes_materia_usuario", ["materiaId", "usuarioId"])
export class Anotacao {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 150 })
    titulo!: string

    @Column({ type: "text" })
    texto!: string

    @CreateDateColumn({ type: "datetime", precision: 6 })
    criadaEm!: Date

    @Column()
    materiaId!: number

    @Column()
    usuarioId!: number
}