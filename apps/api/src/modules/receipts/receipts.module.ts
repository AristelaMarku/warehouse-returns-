import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptEntity } from './entities/receipt.entity';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiptEntity])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [TypeOrmModule],
})
export class ReceiptsModule {}
