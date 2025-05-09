import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { FastifyRequest } from 'fastify';
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<FastifyRequest>();
      const token = request.cookies?.jwt;
  
      if (!token) throw new UnauthorizedException('No JWT found');
  
      try {
        const decoded = this.jwtService.verify(token);
        (request as any).user = decoded; // make user available to controller
        return true;
      } catch (e) {
        throw new UnauthorizedException('Invalid or expired JWT');
      }
    }
  }
  