import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { User } from '../user/entities/user.entity';
import { Role } from './roles.enum'; // Adjust path if needed

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwt.sign(payload);
  }

  async register(data: RegisterUserDto) {
    const existing = await this.userService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // Use Role enum values here, NOT string literals
    const user = await this.userService.createUser(
      { ...data, role: Role.SUBSCRIBER },
      Role.SUPERADMIN,
    );

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
