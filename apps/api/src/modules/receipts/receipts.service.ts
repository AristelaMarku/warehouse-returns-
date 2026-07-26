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
    // Load all receipts DESC so first entry per RMA = most recent
    const all = await this.receiptRepo.find({
      relations: { rma: true, receivedByUser: true },
      order: { receivedAt: 'DESC' },
    });

    // Group by RMA — one summary per RMA, all attempts listed underneath
    const map = new Map<string, {
      rmaId: string;
      rmaNumber: string;
      customerName: string;
      deviceModel: string;
      latestStatus: ReceiptStatus;
      latestReceivedAt: string;
      attemptCount: number;
      attempts: Array<{
        id: string;
        receivedAt: string;
        receivedSerialNumber: string;
        status: ReceiptStatus;
        disposition: string | null;
        rejectionReason: string | null;
        receivedByDisplayName: string;
      }>;
    }>();

    for (const r of all) {
      if (!map.has(r.rmaId)) {
        map.set(r.rmaId, {
          rmaId: r.rma.id,
          rmaNumber: r.rma.rmaNumber,
          customerName: r.rma.customerName,
          deviceModel: r.rma.deviceModel,
          latestStatus: r.status,
          latestReceivedAt: r.receivedAt.toISOString(),
          attemptCount: 0,
          attempts: [],
        });
      }
      const g = map.get(r.rmaId)!;
      g.attemptCount++;
      g.attempts.push({
        id: r.id,
        receivedAt: r.receivedAt.toISOString(),
        receivedSerialNumber: r.receivedSerialNumber,
        status: r.status,
        disposition: r.disposition,
        rejectionReason: r.rejectionReason,
        receivedByDisplayName: r.receivedByUser?.displayName ?? r.receivedByUserId,
      });
    }

    let groups = Array.from(map.values());

    // Filter by latest receipt status if requested
    if (status) {
      groups = groups.filter((g) => g.latestStatus === status);
    }

    const total = groups.length;
    const data = groups.slice((page - 1) * limit, page * limit);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
