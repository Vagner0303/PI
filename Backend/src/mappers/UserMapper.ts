import { User } from "../models/User";

export class UserMapper {
    static toResponse(user: User) {
       return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatarUrl ?? null
}
    }
}