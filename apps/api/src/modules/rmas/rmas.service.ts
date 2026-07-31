import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { RmaStatus } from '@warehouse/shared';
import { RmaEntity } from './entities/rma.entity';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { WarehouseUserEntity } from '../users/entities/warehouse-user.entity';
import { AuditService } from '../audit/audit.service';
import { validateForReceipt } from './rma-validator';
import { ReceiveDeviceDto } from './dto/receive-device.dto';
import { RmaListQueryDto } from './dto/rma-list-query.dto';
import { RmaResponseDto } from './dto/rma-response.dto';
import { ReceiptResponseDto } from './dto/receipt-response.dto';
import { PaginatedDto } from '../../common/pagination/paginated.dto';
import { ReceiptStatus } from '@warehouse/shared';

@Injectable()
export class RmasService {
  constructor(
    @InjectRepository(RmaEntity)
    private readonly rmaRepository: Repository<RmaEntity>,
    @InjectRepository(ReceiptEntity)
    private readonly receiptRepository: Repository<ReceiptEntity>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: RmaListQueryDto): Promise<PaginatedDto<RmaResponseDto>> {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.rmaRepository.createQueryBuilder('rma');

    if (status) {
      if (status === 'ACTIVE') {
        // Both OPEN (within window) and EXPIRED (past window) are stored as OPEN in the DB
        qb.andWhere(`rma.status = 'OPEN'`);
      } else if (status === RmaStatus.EXPIRED) {
        qb.andWhere(`rma.status = 'OPEN'`).andWhere(
          `DATE("rma"."created_at") + ("rma"."eligibility_window_days" * INTERVAL '1 day') < CURRENT_DATE`,
        );
      } else if (status === RmaStatus.OPEN) {
        qb.andWhere(`rma.status = 'OPEN'`).andWhere(
          `DATE("rma"."created_at") + ("rma"."eligibility_window_days" * INTERVAL '1 day') >= CURRENT_DATE`,
        );
      } else {
        qb.andWhere('rma.status = :status', { status });
      }
    }

    if (search) {
      qb.andWhere(
        '(rma.rmaNumber ILIKE :search OR rma.customerName ILIKE :search OR rma.deviceModel ILIKE :search OR rma.expectedSerialNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('rma.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedDto(items.map(RmaResponseDto.fromEntity), total, page, limit);
  }

  async findOne(id: string): Promise<RmaEntity> {
    const rma = await this.rmaRepository.findOne({
      where: { id },
      relations: ['receipts', 'receipts.receivedByUser'],
    });
    if (!rma) throw new NotFoundException(`RMA not found`);
    return rma;
  }

  async receiveDevice(
    rmaId: string,
    dto: ReceiveDeviceDto,
    actor: WarehouseUserEntity,
  ): Promise<ReceiptResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const rma = await manager.findOne(RmaEntity, {
        where: { id: rmaId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!rma) {
        throw new NotFoundException('RMA not found');
      }

      const validationResult = validateForReceipt(rma, dto.receivedSerialNumber, new Date());
      const beforeState = { status: rma.status, disposition: rma.disposition };

      if (validationResult.ok) {
        rma.status = RmaStatus.RECEIVED;
        rma.disposition = validationResult.disposition;
        rma.closedAt = new Date();
        await manager.save(RmaEntity, rma);
      }

      const receipt = manager.create(ReceiptEntity, {
        rmaId: rma.id,
        receivedSerialNumber: dto.receivedSerialNumber,
        notes: dto.notes ?? null,
        receivedByUserId: actor.id,
        status: validationResult.ok ? ReceiptStatus.SUCCESS : ReceiptStatus.REJECTED,
        disposition: validationResult.ok ? validationResult.disposition : null,
        rejectionReason: validationResult.ok ? null : validationResult.reason,
      });
      await manager.save(ReceiptEntity, receipt);

      const afterState = { status: rma.status, disposition: rma.disposition };
      await this.auditService.log(manager, {
        entityType: 'rma',
        entityId: rma.id,
        action: validationResult.ok ? 'RECEIPT_SUCCESS' : 'RECEIPT_REJECTED',
        actorUserId: actor.id,
        beforeState,
        afterState,
      });

      return ReceiptResponseDto.fromEntities(receipt, rma);
    });
  }

  async cancel(rmaId: string, actor: WarehouseUserEntity): Promise<RmaResponseDto> {
    const rma = await this.findOne(rmaId);

    if (rma.status !== RmaStatus.OPEN) {
      throw new UnprocessableEntityException(
        `Cannot cancel RMA with status: ${rma.status}`,
      );
    }

    const beforeState = { status: rma.status };
    rma.status = RmaStatus.CANCELLED;
    rma.closedAt = new Date();
    await this.rmaRepository.save(rma);

    await this.dataSource.transaction(async (manager) => {
      await this.auditService.log(manager, {
        entityType: 'rma',
        entityId: rma.id,
        action: 'RMA_CANCELLED',
        actorUserId: actor.id,
        beforeState,
        afterState: { status: rma.status },
      });
    });

    return RmaResponseDto.fromEntity(rma);
  }

  async extendWindow(
    rmaId: string,
    additionalDays: number,
    actor: WarehouseUserEntity,
  ): Promise<RmaResponseDto> {
    const rma = await this.findOne(rmaId);
    const beforeDays = rma.eligibilityWindowDays;
    rma.eligibilityWindowDays += additionalDays;
    await this.rmaRepository.save(rma);

    await this.dataSource.transaction(async (manager) => {
      await this.auditService.log(manager, {
        entityType: 'rma',
        entityId: rma.id,
        action: 'WINDOW_EXTENDED',
        actorUserId: actor.id,
        beforeState: { eligibilityWindowDays: beforeDays },
        afterState: { eligibilityWindowDays: rma.eligibilityWindowDays },
      });
    });

    return RmaResponseDto.fromEntity(rma);
  }
}
