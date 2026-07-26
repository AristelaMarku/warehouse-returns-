import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseUserEntity } from './entities/warehouse-user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(WarehouseUserEntity)
    private readonly userRepository: Repository<WarehouseUserEntity>,
  ) {}

  async findByUsername(username: string): Promise<WarehouseUserEntity | null> {
    return this.userRepository.findOne({ where: { username, isActive: true } });
  }

  async findById(id: string): Promise<WarehouseUserEntity> {
    const user = await this.userRepository.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
