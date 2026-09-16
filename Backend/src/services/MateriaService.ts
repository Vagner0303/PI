import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/dataBase'
import { Materia } from '../models/Materia'
import { CreateMateriasDTO } from '../dtos/CreateMateriasDTO'
import { UpdateMateriasDTO } from '../dtos/UpdateMateriasDTO'

export class MateriaService {
    async listar(): Promise<Materia[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM materias ORDER BY id'
        )
        return rows as Materia[]
    }

    async buscarPorId(id: number): Promise<Materia> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM materias WHERE id = ?',
            [id]
        )
        if (rows.length === 0) {
            throw new Error('Matéria não encontrada')
        }
        return rows[0] as Materia
    }

    async criar(data: CreateMateriasDTO): Promise<Materia> {
        if (!data.nome || data.nome.trim() === '') {
            throw new Error('O nome da matéria é obrigatório')
        }
        if (!data.descricao || data.descricao.trim() === '') {
            throw new Error('A descrição da matéria é obrigatória')
        }

        const prioridade = data.prioridade || 'media'

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO materias (nome, descricao, prioridade)
             VALUES (?, ?, ?)`,
            [data.nome, data.descricao, prioridade]
        )

        return this.buscarPorId(result.insertId)
    }

    async atualizar(id: number, data: UpdateMateriasDTO): Promise<Materia> {
        const materiaAtual = await this.buscarPorId(id)

        const nome = data.nome ?? materiaAtual.nome
        const descricao = data.descricao ?? materiaAtual.descricao
        const prioridade = data.prioridade ?? materiaAtual.prioridade

        if (nome.trim() === '') {
            throw new Error('O nome não pode ficar vazio')
        }
        if (descricao.trim() === '') {
            throw new Error('A descrição não pode ficar vazia')
        }

        await pool.query(
            `UPDATE materias
             SET nome = ?, descricao = ?, prioridade = ?
             WHERE id = ?`,
            [nome, descricao, prioridade, id]
        )

        return this.buscarPorId(id)
    }

    async excluir(id: number): Promise<void> {
        await this.buscarPorId(id) // garante que existe
        await pool.query('DELETE FROM materias WHERE id = ?', [id])
    }
}