import z from 'zod'
import { CreateUserDTO } from './CreateUserDTO'

// Será usado para validar nossas requests
export const UpdateUserDTO = CreateUserDTO.partial()

//Será usado para tiapgem dos dados recebidos na camada service
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>
