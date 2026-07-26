import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Disposition, ReceiptStatus, ReturnReason, RmaStatus } from '@warehouse/shared';
import { RmaEntity } from '../entities/rma.entity';

export class RmaReceiptSummary {
  receiptId: string;
  receivedAt: string;
  receivedSerialNumber: string;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedByDisplayName: string;
}

export class RmaResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() rmaNumber: string;
  @ApiProperty() customerName: string;
  @ApiPropertyOptional() customerEmail: string | null;
  @ApiProperty() deviceModel: string;
  @ApiProperty({ enum: ReturnReason }) returnReason: ReturnReason;
  @ApiProperty({ enum: RmaStatus }) status: RmaStatus;
  @ApiPropertyOptional({ enum: Disposition }) disposition: Disposition | null;
  @ApiPropertyOptional() expectedSerialNumber: string | null;
  @ApiProperty() eligibilityWindowDays: number;
  @ApiProperty() expiresAt: string;
  @ApiPropertyOptional() notes: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
  @ApiPropertyOptional() closedAt: string | null;
  @ApiProperty({ type: [RmaReceiptSummary] }) receipts: RmaReceiptSummary[];

  static fromEntity(rma: RmaEntity): RmaResponseDto {
    const dto = new RmaResponseDto();
    dto.id = rma.id;
    dto.rmaNumber = rma.rmaNumber;
    dto.customerName = rma.customerName;
    dto.customerEmail = rma.customerEmail;
    dto.deviceModel = rma.deviceModel;
    dto.returnReason = rma.returnReason;
    dto.status = rma.status;
    dto.disposition = rma.disposition;
    dto.expectedSerialNumber = rma.expectedSerialNumber;
    dto.eligibilityWindowDays = rma.eligibilityWindowDays;
    const expiresAt = new Date(rma.createdAt);
    expiresAt.setDate(expiresAt.getDate() + rma.eligibilityWindowDays);
    dto.expiresAt = expiresAt.toISOString();
    dto.notes = rma.notes;
    dto.createdAt = rma.createdAt.toISOString();
    dto.updatedAt = rma.updatedAt.toISOString();
    dto.closedAt = rma.closedAt ? rma.closedAt.toISOString() : null;
    dto.receipts = (rma.receipts ?? []).map((r) => ({
      receiptId: r.id,
      receivedAt: r.receivedAt.toISOString(),
      receivedSerialNumber: r.receivedSerialNumber,
      status: r.status,
      disposition: r.disposition,
      rejectionReason: r.rejectionReason,
      receivedByDisplayName: r.receivedByUser?.displayName ?? r.receivedByUserId,
    }));
    return dto;
  }
}
