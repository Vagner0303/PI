export interface Materia {
    id: number
    nome: string
    descricao: string
    prioridade: 'baixa' | 'media' | 'alta'
    criado_em: Date
    atualizado_em: Date
}