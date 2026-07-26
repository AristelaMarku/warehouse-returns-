import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReceiptEntity } from '../../receipts/entities/receipt.entity';
import { AuditLogEntity } from '../../audit/entities/audit-log.entity';

@Entity('warehouse_user')
export class WarehouseUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  username: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 32, default: 'receiver' })
  role: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.receivedByUser)
  receipts: ReceiptEntity[];

  @OneToMany(() => AuditLogEntity, (log) => log.actorUser)
  auditLogs: AuditLogEntity[];
}
