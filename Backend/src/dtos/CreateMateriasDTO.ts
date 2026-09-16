export interface CreateMateriasDTO {
    nome: string
    descricao: string
    prioridade?: 'baixa' | 'media' | 'alta'
}