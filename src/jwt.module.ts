import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: 'your_jwt_secret', // 🔐 move to .env later
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [JwtModule],
})
export class GlobalJwtModule {}
