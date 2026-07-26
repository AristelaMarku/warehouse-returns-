import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Disposition, ReceiptStatus } from '@warehouse/shared';
import { ReceiptEntity } from '../../receipts/entities/receipt.entity';
import { RmaEntity } from '../entities/rma.entity';
import { RmaResponseDto } from './rma-response.dto';

export class ReceiptResponseDto {
  @ApiProperty() receiptId: string;
  @ApiProperty() rmaId: string;
  @ApiProperty() rmaNumber: string;
  @ApiProperty() receivedSerialNumber: string;
  @ApiProperty({ enum: ReceiptStatus }) status: ReceiptStatus;
  @ApiPropertyOptional({ enum: Disposition }) disposition: Disposition | null;
  @ApiPropertyOptional() rejectionReason: string | null;
  @ApiProperty() receivedAt: string;
  @ApiProperty() rma: RmaResponseDto;

  static fromEntities(receipt: ReceiptEntity, rma: RmaEntity): ReceiptResponseDto {
    const dto = new ReceiptResponseDto();
    dto.receiptId = receipt.id;
    dto.rmaId = receipt.rmaId;
    dto.rmaNumber = rma.rmaNumber;
    dto.receivedSerialNumber = receipt.receivedSerialNumber;
    dto.status = receipt.status;
    dto.disposition = receipt.disposition;
    dto.rejectionReason = receipt.rejectionReason;
    dto.receivedAt = receipt.receivedAt.toISOString();
    dto.rma = RmaResponseDto.fromEntity(rma);
    return dto;
  }
}
