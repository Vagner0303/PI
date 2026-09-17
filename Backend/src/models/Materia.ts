export interface Materia {
    id: number
    nome: string
    descricao: string
    professor: string | null
    criado_em: Date
    atualizado_em: Date
}