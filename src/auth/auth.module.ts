// auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    forwardRef(() => UserModule),            // bring in UserService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET') || 'hardcoded-for-dev',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],             // only your auth endpoints here
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService],                     // only your own provider
})
export class AuthModule {}

