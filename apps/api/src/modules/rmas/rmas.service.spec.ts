import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Disposition, ReceiptStatus, ReturnReason, RmaStatus } from '@warehouse/shared';
import { RmasService } from './rmas.service';
import { RmaEntity } from './entities/rma.entity';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { WarehouseUserEntity } from '../users/entities/warehouse-user.entity';
import { AuditService } from '../audit/audit.service';

function makeRma(overrides: Partial<RmaEntity> = {}): RmaEntity {
  const rma = new RmaEntity();
  rma.id = 'rma-uuid-001';
  rma.rmaNumber = 'RMA-2024-0001';
  rma.customerName = 'Jane Smith';
  rma.deviceModel = 'iPhone 15 Pro';
  rma.returnReason = ReturnReason.STANDARD_RETURN;
  rma.status = RmaStatus.OPEN;
  rma.eligibilityWindowDays = 30;
  rma.expectedSerialNumber = null;
  rma.disposition = null;
  rma.closedAt = null;
  rma.customerEmail = null;
  rma.notes = null;
  rma.createdAt = new Date('2099-01-01'); // far future — always in window
  rma.updatedAt = new Date('2099-01-01');
  return Object.assign(rma, overrides);
}

function makeActor(): WarehouseUserEntity {
  const user = new WarehouseUserEntity();
  user.id = 'user-uuid-001';
  user.username = 'receiver1';
  user.role = 'receiver';
  return user;
}

describe('RmasService', () => {
  let service: RmasService;
  let mockManager: jest.Mocked<Partial<EntityManager>>;

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      create: jest.fn((_, data) => ({ ...data })),
      save: jest.fn(async (_, entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RmasService,
        { provide: getRepositoryToken(RmaEntity), useValue: { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(ReceiptEntity), useValue: {} },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (cb) => cb(mockManager)),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn(), findByEntityId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(RmasService);
  });

  describe('receiveDevice', () => {
    it('returns SUCCESS with RESTOCKED for STANDARD_RETURN', async () => {
      const rma = makeRma();
      (mockManager.findOne as jest.Mock).mockResolvedValue(rma);
      (mockManager.save as jest.Mock).mockImplementation(async (_, entity) => entity);

      const result = await service.receiveDevice(
        rma.id,
        { receivedSerialNumber: 'ANY123' },
        makeActor(),
      );

      expect(result.status).toBe(ReceiptStatus.SUCCESS);
      expect(result.disposition).toBe(Disposition.RESTOCKED);
      expect(result.rejectionReason).toBeNull();
    });

    it('returns REJECTED when RMA already received', async () => {
      const rma = makeRma({ status: RmaStatus.RECEIVED });
      (mockManager.findOne as jest.Mock).mockResolvedValue(rma);
      (mockManager.save as jest.Mock).mockImplementation(async (_, entity) => entity);

      const result = await service.receiveDevice(
        rma.id,
        { receivedSerialNumber: 'ANY123' },
        makeActor(),
      );

      expect(result.status).toBe(ReceiptStatus.REJECTED);
      expect(result.rejectionReason).toContain('already closed');
    });

    it('throws NotFoundException when RMA does not exist', async () => {
      (mockManager.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.receiveDevice('non-existent-id', { receivedSerialNumber: 'ANY' }, makeActor()),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns REJECTED on serial mismatch', async () => {
      const rma = makeRma({ expectedSerialNumber: 'EXPECTED123' });
      (mockManager.findOne as jest.Mock).mockResolvedValue(rma);
      (mockManager.save as jest.Mock).mockImplementation(async (_, entity) => entity);

      const result = await service.receiveDevice(
        rma.id,
        { receivedSerialNumber: 'WRONGSERIAL' },
        makeActor(),
      );

      expect(result.status).toBe(ReceiptStatus.REJECTED);
      expect(result.rejectionReason).toContain('mismatch');
    });
  });
});
