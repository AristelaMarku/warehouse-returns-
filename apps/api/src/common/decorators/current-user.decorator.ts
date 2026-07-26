import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { WarehouseUserEntity } from '../../modules/users/entities/warehouse-user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WarehouseUserEntity => {
    const request = ctx.switchToHttp().getRequest<Request & { user: WarehouseUserEntity }>();
    return request.user;
  },
);
