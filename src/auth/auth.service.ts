import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt" // Removed 'type' keyword
import * as bcrypt from "bcrypt"
import { UserService } from "../user/user.service" // Removed 'type' keyword
import type { RegisterUserDto } from "../user/dto/register-user.dto"
import type { User } from "../user/entities/user.entity"
import { Role } from "./roles.enum" // Adjust path if needed

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, // Use jwtService instead of jwt
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email)
    if (!user) throw new UnauthorizedException("Invalid credentials")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException("Invalid credentials password")

    return user
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    return this.jwtService.sign(payload) // Use jwtService instead of jwt
  }

  async register(data: RegisterUserDto) {
    const existing = await this.userService.findByEmail(data.email)
    if (existing) {
      throw new BadRequestException("Email already in use")
    }

    // Use Role enum values here, NOT string literals
    const user = await this.userService.createUser({ ...data, role: Role.SUBSCRIBER }, Role.SUPERADMIN)

    const token = this.jwtService.sign({
      // Use jwtService instead of jwt
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }
}