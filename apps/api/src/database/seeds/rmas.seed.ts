import { DataSource } from 'typeorm';
import { ReturnReason, RmaStatus } from '@warehouse/shared';
import { RmaEntity } from '../../modules/rmas/entities/rma.entity';

const RMA_SEEDS = [
  {
    rmaNumber: 'RMA-2024-0001',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    deviceModel: 'iPhone 15 Pro',
    returnReason: ReturnReason.STANDARD_RETURN,
    status: RmaStatus.OPEN,
    expectedSerialNumber: null,
    eligibilityWindowDays: 30,
  },
  {
    rmaNumber: 'RMA-2024-0002',
    customerName: 'Bob Jones',
    customerEmail: 'bob@example.com',
    deviceModel: 'Samsung Galaxy S24',
    returnReason: ReturnReason.WARRANTY_REPAIR,
    status: RmaStatus.OPEN,
    expectedSerialNumber: 'C02XG0JHJGH7',
    eligibilityWindowDays: 30,
  },
  {
    rmaNumber: 'RMA-2024-0003',
    customerName: 'Alice Lee',
    customerEmail: 'alice@example.com',
    deviceModel: 'Google Pixel 8',
    returnReason: ReturnReason.TRADE_IN_RECYCLE,
    status: RmaStatus.OPEN,
    expectedSerialNumber: null,
    eligibilityWindowDays: 30,
  },
  {
    rmaNumber: 'RMA-2024-0004',
    customerName: 'Tom Craig',
    customerEmail: 'tom@example.com',
    deviceModel: 'iPhone 14',
    returnReason: ReturnReason.EXCHANGE,
    status: RmaStatus.OPEN,
    expectedSerialNumber: null,
    eligibilityWindowDays: 30,
  },
  {
    rmaNumber: 'RMA-2024-0005',
    customerName: 'Mia Torres',
    customerEmail: 'mia@example.com',
    deviceModel: 'OnePlus 12',
    returnReason: ReturnReason.WARRANTY_REPAIR,
    status: RmaStatus.OPEN,
    expectedSerialNumber: 'MISMATCH_ME',
    eligibilityWindowDays: 30,
    notes: 'Seed record for serial mismatch testing',
  },
  {
    rmaNumber: 'RMA-2024-0006',
    customerName: 'Sam White',
    customerEmail: 'sam@example.com',
    deviceModel: 'Galaxy S23',
    returnReason: ReturnReason.STANDARD_RETURN,
    status: RmaStatus.OPEN,
    expectedSerialNumber: null,
    eligibilityWindowDays: 0,
    notes: 'Seed record for expired window testing',
  },
  {
    rmaNumber: 'RMA-2024-0007',
    customerName: 'Meg Hall',
    customerEmail: 'meg@example.com',
    deviceModel: 'iPhone 13',
    returnReason: ReturnReason.STANDARD_RETURN,
    status: RmaStatus.RECEIVED,
    expectedSerialNumber: null,
    eligibilityWindowDays: 30,
    notes: 'Pre-seeded as RECEIVED for testing',
  },
  {
    rmaNumber: 'RMA-2024-0008',
    customerName: 'Leo Park',
    customerEmail: 'leo@example.com',
    deviceModel: 'Pixel 7',
    returnReason: ReturnReason.STANDARD_RETURN,
    status: RmaStatus.CANCELLED,
    expectedSerialNumber: null,
    eligibilityWindowDays: 30,
    notes: 'Pre-seeded as CANCELLED for testing',
  },
];

export async function seedRmas(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(RmaEntity);

  for (const data of RMA_SEEDS) {
    const exists = await repo.findOne({ where: { rmaNumber: data.rmaNumber } });
    if (!exists) {
      await repo.save(repo.create(data));
    }
  }

  console.log(`✓ Seeded ${RMA_SEEDS.length} RMAs`);
}
