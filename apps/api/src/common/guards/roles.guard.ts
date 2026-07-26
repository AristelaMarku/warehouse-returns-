import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { WarehouseUserEntity } from '../../modules/users/entities/warehouse-user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user: WarehouseUserEntity }>();
    const user = request.user;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Insufficient role: requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
