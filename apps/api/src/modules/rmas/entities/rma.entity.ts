import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Disposition, ReturnReason, RmaStatus } from '@warehouse/shared';
import { ReceiptEntity } from '../../receipts/entities/receipt.entity';
import { AuditLogEntity } from '../../audit/entities/audit-log.entity';

@Entity('rma')
export class RmaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'rma_number', type: 'varchar', length: 32 })
  rmaNumber: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
  customerEmail: string | null;

  @Column({ name: 'device_model', type: 'varchar', length: 128 })
  deviceModel: string;

  @Column({ name: 'return_reason', type: 'varchar', length: 32 })
  returnReason: ReturnReason;

  @Column({ type: 'varchar', length: 32, default: RmaStatus.OPEN })
  status: RmaStatus;

  @Column({ type: 'varchar', length: 32, nullable: true })
  disposition: Disposition | null;

  @Column({ name: 'expected_serial_number', type: 'varchar', length: 128, nullable: true })
  expectedSerialNumber: string | null;

  @Column({ name: 'eligibility_window_days', type: 'int', default: 30 })
  eligibilityWindowDays: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.rma)
  receipts: ReceiptEntity[];

  @OneToMany(() => AuditLogEntity, (log) => log.entityId)
  auditLogs: AuditLogEntity[];

  get expiresAt(): Date {
    const expires = new Date(this.createdAt);
    expires.setDate(expires.getDate() + this.eligibilityWindowDays);
    return expires;
  }
}
