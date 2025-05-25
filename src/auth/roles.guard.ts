import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';



@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) return true; // no roles required

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No user on request');

    // superadmin bypasses everything
    if (user.role === Role.SUPERADMIN) return true;

    // otherwise must have one of the required roles
    if (requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException('You do not have permission');
  }
}


// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (!requiredRoles) return true;

//     const { user } = context.switchToHttp().getRequest();
//     if (!user || !requiredRoles.includes(user.role)) {
//       throw new ForbiddenException('You do not have permission');
//     }

//     return true;
//   }
// }
