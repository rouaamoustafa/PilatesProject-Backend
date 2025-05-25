// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterUserDto } from '../user/dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() { email, password }: { email: string; password: string }
    //@Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.authService.validateUser(email, password);
    const token = await this.authService.login(user);

    // res.setCookie('jwt', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 24 * 60 * 60,
    // });

    return {
      message: 'Logged in successfully',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, token } = await this.authService.register(dto);

    // res.setCookie('jwt', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 24 * 60 * 60,
    // });

    return {
      message: 'Registered and logged in',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @Req() req: FastifyRequest & { user: { userId: string } },
  ) {
    try {
      return await this.userService.findById(req.user.userId);
    } catch (err) {
      throw new InternalServerErrorException('Error fetching user profile');
    }
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('jwt', { path: '/' });
    return { message: 'Logged out' };
  }

  @Public()
  @Get('test-public')
  testPublic() {
    return { message: 'This is a public endpoint' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-protected')
  testProtected(@Req() req: FastifyRequest & { user: any }) {
    return { message: 'This is protected', user: req.user };
  }
}
