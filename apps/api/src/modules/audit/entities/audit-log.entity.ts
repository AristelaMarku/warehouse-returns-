import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WarehouseUserEntity } from '../../users/entities/warehouse-user.entity';

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType: string;

  @Index()
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState: Record<string, unknown> | null;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @ManyToOne(() => WarehouseUserEntity, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser: WarehouseUserEntity | null;
}
