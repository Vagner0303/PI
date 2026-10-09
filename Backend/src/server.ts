import "dotenv/config";
import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import materiaRoutes from './routes/materiaRoutes'
import { errorHandler } from './middlewares/errorHandler'
import cronogramaRoutes from './routes/cronogramaRoutes'
import desempenhoRoutes from './routes/desempenhoRoutes'
import linkRoutes from './routes/linkRoutes'
import { desempenhoService } from './controllers/DesempenhoController'
import anotacaoRoutes from './routes/anotacaoRoutes'
import tarefaRoutes from "./routes/tarefaRoutes";
import atividadeRoutes from './routes/atividadeRoutes'
import metaRoutes from './routes/metaRoutes'

const app: Application = express()
const PORT = Number(process.env.PORT || '3000')

// Configuração do CORS (aceita localhost e 127.0.0.1)
const ORIGENS_PERMITIDAS = ['http://localhost:5500', 'http://127.0.0.1:5500']

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || ORIGENS_PERMITIDAS.includes(origin)) return cb(null, true)
        cb(new Error('Origem não permitida pelo CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Fotos de perfil (pública, SEM autenticação).
// Precisa vir ANTES das rotas, senão um authMiddleware global pode barrar o carregamento da imagem.
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

// Rotas
app.use(authRoutes)
app.use('/users', userRoutes)
app.use(materiaRoutes)
app.use(cronogramaRoutes)
app.use(desempenhoRoutes)
app.use(linkRoutes)
app.use(anotacaoRoutes)
app.use(tarefaRoutes)
app.use(atividadeRoutes)
app.use(metaRoutes)

// Tratamento de erros (sempre por último)
app.use(errorHandler)

async function iniciarServidor() {
    try {
        await desempenhoService.garantirTabela()
        app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`))
    } catch (error) {
        console.error('Falha ao preparar o desempenho:', error)
        process.exit(1)
    }
}
iniciarServidor()