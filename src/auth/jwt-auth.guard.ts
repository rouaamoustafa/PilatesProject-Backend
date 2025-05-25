// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';           // <-- value import, not `import type`
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // if @Public() metadata is present, skip the JWT check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
      
    ]);
    
    if (isPublic) {
      return true;
      
    }
    
    // otherwise run the normal JWT auth
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JWT auth failed:', {
        error: err?.message,
        info: info?.message,
      });
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
