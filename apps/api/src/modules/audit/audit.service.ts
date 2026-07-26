import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

interface LogEntryParams {
  entityType: string;
  entityId: string;
  action: string;
  actorUserId: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async log(manager: EntityManager, params: LogEntryParams): Promise<void> {
    const entry = manager.create(AuditLogEntity, {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorUserId: params.actorUserId,
      beforeState: params.beforeState ?? null,
      afterState: params.afterState ?? null,
    });
    await manager.save(AuditLogEntity, entry);
  }

  async findByEntityId(entityId: string): Promise<AuditLogEntity[]> {
    return this.auditLogRepository.find({
      where: { entityId },
      relations: ['actorUser'],
      order: { occurredAt: 'DESC' },
    });
  }
}
