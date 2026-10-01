import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Backend/uploads/avatars (funciona com ts-node em src/middlewares e compilado em dist/middlewares)
export const PASTA_AVATARS = path.resolve(__dirname, '..', '..', 'uploads', 'avatars')
fs.mkdirSync(PASTA_AVATARS, { recursive: true })

const storage = multer.diskStorage({
    destination: PASTA_AVATARS,
    filename: (req: Request, file, cb) => {
        const userId = req.user.id
        const ext = file.mimetype === 'image/png' ? '.png' : '.jpg'
        cb(null, `user-${userId}-${Date.now()}${ext}`)
    }
})

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (['image/png', 'image/jpeg'].includes(file.mimetype)) cb(null, true)
        else cb(new Error('Formato inválido. Use PNG ou JPG.'))
    }
}).single('avatar')