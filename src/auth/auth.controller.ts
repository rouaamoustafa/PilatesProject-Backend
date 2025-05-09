import { Controller, Post, Body, Res, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly userService: UserService
  ) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: FastifyReply) {
    const user = await this.authService.validateUser(body.email, body.password);
    const token = await this.authService.login(user);

    res.setCookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production
      path: '/',
      maxAge: 24 * 60 * 60, 
    });

    return { message: 'Logged in successfully' };
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto, @Res({ passthrough: true }) res: FastifyReply) {
    const { user, token } = await this.authService.register(body);
  
    res.setCookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60,
    });
  
    return {
      message: 'User registered successfully',
      user,
      token,
    };
  }
  
  @Post('logout')
  logout(@Res({ passthrough: true }) res: FastifyReply) {
  res.clearCookie('jwt')
  return { message: 'Logged out successfully' }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: FastifyRequest) {
    const userId = (req as any).user.sub;
    return this.userService.findById(userId);
  }
  
}
