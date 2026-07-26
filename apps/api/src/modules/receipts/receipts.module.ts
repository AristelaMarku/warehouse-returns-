import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptEntity } from './entities/receipt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiptEntity])],
  exports: [TypeOrmModule],
})
export class ReceiptsModule {}
