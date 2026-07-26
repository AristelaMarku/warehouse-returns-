import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseUserEntity } from './entities/warehouse-user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseUserEntity])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
