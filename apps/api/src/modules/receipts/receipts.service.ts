import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptStatus } from '@warehouse/shared';
import { ReceiptEntity } from './entities/receipt.entity';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(ReceiptEntity)
    private readonly receiptRepo: Repository<ReceiptEntity>,
  ) {}

  async findAll(page: number, limit: number, status?: ReceiptStatus) {
    const [data, total] = await this.receiptRepo.findAndCount({
      relations: { rma: true, receivedByUser: true },
      ...(status ? { where: { status } } : {}),
      order: { receivedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((r) => ({
        id: r.id,
        receivedAt: r.receivedAt,
        receivedSerialNumber: r.receivedSerialNumber,
        status: r.status,
        disposition: r.disposition,
        rejectionReason: r.rejectionReason,
        rmaId: r.rma.id,
        rmaNumber: r.rma.rmaNumber,
        customerName: r.rma.customerName,
        deviceModel: r.rma.deviceModel,
        receivedByUsername: r.receivedByUser.username,
        receivedByDisplayName: r.receivedByUser.displayName,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
