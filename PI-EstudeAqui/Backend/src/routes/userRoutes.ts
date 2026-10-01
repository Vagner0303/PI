import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { uploadAvatar } from "../middlewares/uploadMiddleware";

const router = Router()
const controller = new UserController()

router.get('/', authMiddleware, controller.findAllUser.bind(controller))

// As rotas de avatar precisam vir ANTES das rotas com /:id
router.post(
    '/avatar',
    authMiddleware,
    (req, res, next) => {
        uploadAvatar(req, res, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message })
            next()
        })
    },
    controller.atualizarAvatar.bind(controller)
)
router.delete('/avatar', authMiddleware, controller.removerAvatar.bind(controller))

router.get('/:id', authMiddleware, adminMiddleware, controller.getUserById.bind(controller))
router.get('/email/:email', authMiddleware, adminMiddleware, controller.getUserByEmail.bind(controller))

router.patch('/:id', authMiddleware, controller.updateUser.bind(controller))
router.delete('/:id', authMiddleware, controller.deleteUser.bind(controller))

router.patch('/promove/:id', authMiddleware, adminMiddleware, controller.promove.bind(controller))

export default router