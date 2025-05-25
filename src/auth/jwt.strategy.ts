// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // only look in the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'temporary-hardcoded-secret',
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    console.log('JwtStrategy: payload', payload);
    //console.log('JwtAuthGuard: user', req.user);
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload')
    }
    return {
          id:      payload.sub,          // new – what most of your code expects
          userId:  payload.sub,          // legacy – what a few routes still use
          email:   payload.email,
          role:    payload.role,
        };
        
  }
}
