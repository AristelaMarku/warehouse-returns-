import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RmaEntity } from './entities/rma.entity';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { RmasService } from './rmas.service';
import { RmasController } from './rmas.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([RmaEntity, ReceiptEntity]), AuditModule],
  providers: [RmasService],
  controllers: [RmasController],
  exports: [RmasService],
})
export class RmasModule {}
