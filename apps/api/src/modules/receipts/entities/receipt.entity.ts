import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Disposition, ReceiptStatus } from '@warehouse/shared';
import { RmaEntity } from '../../rmas/entities/rma.entity';
import { WarehouseUserEntity } from '../../users/entities/warehouse-user.entity';

@Entity('receipt')
export class ReceiptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'rma_id', type: 'uuid' })
  rmaId: string;

  @Column({ name: 'received_serial_number', type: 'varchar', length: 128 })
  receivedSerialNumber: string;

  @Column({ name: 'received_by_user_id', type: 'uuid' })
  receivedByUserId: string;

  @Column({ type: 'varchar', length: 32 })
  status: ReceiptStatus;

  @Column({ type: 'varchar', length: 32, nullable: true })
  disposition: Disposition | null;

  @Column({ name: 'rejection_reason', type: 'varchar', length: 512, nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;

  @ManyToOne(() => RmaEntity, (rma) => rma.receipts)
  @JoinColumn({ name: 'rma_id' })
  rma: RmaEntity;

  @ManyToOne(() => WarehouseUserEntity, (user) => user.receipts)
  @JoinColumn({ name: 'received_by_user_id' })
  receivedByUser: WarehouseUserEntity;
}
