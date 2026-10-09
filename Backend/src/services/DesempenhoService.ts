import { RowDataPacket } from 'mysql2'
import { pool } from '../config/dataBase'
import { BadRequestError } from '../errors'

const MAX_SEGUNDOS_POR_ENVIO = 600

const pad = (n: number) => String(n).padStart(2, '0')
const chaveLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// segunda-feira desta semana (WEEKDAY: segunda = 0)
const INICIO_SEMANA = `DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)`

export class DesempenhoService {
    async garantirTabela() {
        await pool.query(`CREATE TABLE IF NOT EXISTS sessoes_estudo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            segundos INT NOT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sessoes_usuario_data (usuario_id, criado_em),
            CONSTRAINT fk_sessoes_usuario FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB`)
    }

    async registrarTempo(usuarioId: number, segundos: unknown) {
        const s = Math.round(Number(segundos))
        if (!Number.isFinite(s) || s <= 0) throw new BadRequestError('Tempo inválido')
        const valor = Math.min(s, MAX_SEGUNDOS_POR_ENVIO)
        await pool.query('INSERT INTO sessoes_estudo (usuario_id, segundos) VALUES (?, ?)', [usuarioId, valor])
        return { segundos: valor }
    }

    async resumo(usuarioId: number) {
        // taxa geral: acertos e erros sobre TODAS as atividades geradas (de todas as matérias)
        const [geralRows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) total,
                    COALESCE(SUM(resultado = 'correta'), 0) acertos,
                    COALESCE(SUM(resultado IN ('parcial','incorreta')), 0) erros
             FROM atividades
             WHERE usuarioId = ?`, [usuarioId])
        const total = Number(geralRows[0]?.total ?? 0)
        const acertos = Number(geralRows[0]?.acertos ?? 0)
        const erros = Number(geralRows[0]?.erros ?? 0)

        // horas da semana atual (segunda até domingo)
        const [semanaRows] = await pool.query<RowDataPacket[]>(
            `SELECT COALESCE(SUM(segundos), 0) segundos FROM sessoes_estudo
             WHERE usuario_id = ? AND criado_em >= ${INICIO_SEMANA}`, [usuarioId])
        const segundosSemana = Number(semanaRows[0]?.segundos ?? 0)

        const [dias] = await pool.query<RowDataPacket[]>(
            `SELECT DATE_FORMAT(criado_em, '%Y-%m-%d') dia, COALESCE(SUM(segundos), 0) segundos
             FROM sessoes_estudo
             WHERE usuario_id = ? AND criado_em >= ${INICIO_SEMANA}
             GROUP BY dia ORDER BY dia`, [usuarioId])

        // desempenho por matéria: acertos / total de atividades geradas na matéria
        const [materias] = await pool.query<RowDataPacket[]>(
            `SELECT m.id, m.nome AS materia,
                    COUNT(a.id) total,
                    COALESCE(SUM(a.resultado = 'correta'), 0) acertos,
                    COALESCE(SUM(a.resultado IN ('parcial','incorreta')), 0) erros
             FROM materias m
             LEFT JOIN tarefas t ON t.materiaId = m.id AND t.usuarioId = m.usuario_id
             LEFT JOIN atividades a ON a.tarefaId = t.id
             WHERE m.usuario_id = ?
             GROUP BY m.id, m.nome
             ORDER BY m.nome`, [usuarioId])

        const porMateria = materias.map(r => {
            const a = Number(r.acertos), e = Number(r.erros), q = Number(r.total)
            return { id: r.id, materia: r.materia, percentual: q ? Math.round(a / q * 100) : 0, acertos: a, erros: e, total: q }
        })

        // semana de segunda a domingo, na mesma ordem dos rótulos do HTML
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
        const segunda = new Date(hoje)
        segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7))

        const diasSemana = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(segunda); d.setDate(segunda.getDate() + i)
            const chave = chaveLocal(d)
            const x = dias.find(v => v.dia === chave)
            return {
                data: chave,
                minutos: Number(x?.segundos ?? 0) / 60,
                label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
            }
        })

        return {
            horas_semana: segundosSemana / 3600,
            acertos, erros,
            taxa_acertos: total ? Math.round(acertos / total * 100) : 0,
            taxa_erros: total ? Math.round(erros / total * 100) : 0,
            dias: diasSemana,
            materias: porMateria
        }
    }
}