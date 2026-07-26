import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { ReturnReason, RmaStatus, ReceiptStatus, Disposition } from '@warehouse/shared';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { WarehouseUserEntity } from '../src/modules/users/entities/warehouse-user.entity';
import { RmaEntity } from '../src/modules/rmas/entities/rma.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('POST /api/v1/rmas/:id/receive (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let openRmaId: string;
  let receivedRmaId: string;
  let cancelledRmaId: string;
  let expiredRmaId: string;
  let serialEnforcedRmaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    // Seed test user
    const userRepo = dataSource.getRepository(WarehouseUserEntity);
    const user = userRepo.create({
      username: 'e2e_receiver',
      displayName: 'E2E Receiver',
      email: 'e2e@test.com',
      passwordHash: await bcrypt.hash('testpass', 10),
      role: 'receiver',
    });
    await userRepo.save(user);

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'e2e_receiver', password: 'testpass' });
    accessToken = loginRes.body.accessToken;

    // Seed RMAs
    const rmaRepo = dataSource.getRepository(RmaEntity);

    const openRma = await rmaRepo.save(
      rmaRepo.create({
        rmaNumber: 'E2E-0001',
        customerName: 'E2E Customer',
        deviceModel: 'Test Device',
        returnReason: ReturnReason.STANDARD_RETURN,
        status: RmaStatus.OPEN,
        eligibilityWindowDays: 30,
        expectedSerialNumber: null,
      }),
    );
    openRmaId = openRma.id;

    const receivedRma = await rmaRepo.save(
      rmaRepo.create({
        rmaNumber: 'E2E-0002',
        customerName: 'E2E Customer',
        deviceModel: 'Test Device',
        returnReason: ReturnReason.WARRANTY_REPAIR,
        status: RmaStatus.RECEIVED,
        eligibilityWindowDays: 30,
      }),
    );
    receivedRmaId = receivedRma.id;

    const cancelledRma = await rmaRepo.save(
      rmaRepo.create({
        rmaNumber: 'E2E-0003',
        customerName: 'E2E Customer',
        deviceModel: 'Test Device',
        returnReason: ReturnReason.STANDARD_RETURN,
        status: RmaStatus.CANCELLED,
        eligibilityWindowDays: 30,
      }),
    );
    cancelledRmaId = cancelledRma.id;

    const expiredRma = await rmaRepo.save(
      rmaRepo.create({
        rmaNumber: 'E2E-0004',
        customerName: 'E2E Customer',
        deviceModel: 'Test Device',
        returnReason: ReturnReason.TRADE_IN_RECYCLE,
        status: RmaStatus.OPEN,
        eligibilityWindowDays: 0, // already expired
      }),
    );
    expiredRmaId = expiredRma.id;

    const serialRma = await rmaRepo.save(
      rmaRepo.create({
        rmaNumber: 'E2E-0005',
        customerName: 'E2E Customer',
        deviceModel: 'Test Device',
        returnReason: ReturnReason.WARRANTY_REPAIR,
        status: RmaStatus.OPEN,
        eligibilityWindowDays: 30,
        expectedSerialNumber: 'CORRECT_SERIAL',
      }),
    );
    serialEnforcedRmaId = serialRma.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('201 RESTOCKED for STANDARD_RETURN', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${openRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(201);

    expect(res.body.status).toBe(ReceiptStatus.SUCCESS);
    expect(res.body.disposition).toBe(Disposition.RESTOCKED);
    expect(res.body.rejectionReason).toBeNull();
  });

  it('422 when RMA already RECEIVED', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${receivedRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(422);

    expect(res.body.status).toBe(ReceiptStatus.REJECTED);
    expect(res.body.rejectionReason).toContain('already closed');
  });

  it('422 when RMA is CANCELLED', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${cancelledRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(422);

    expect(res.body.status).toBe(ReceiptStatus.REJECTED);
    expect(res.body.rejectionReason).toContain('CANCELLED');
  });

  it('422 when eligibility window expired', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${expiredRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(422);

    expect(res.body.status).toBe(ReceiptStatus.REJECTED);
    expect(res.body.rejectionReason).toContain('expired');
  });

  it('422 on serial mismatch', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${serialEnforcedRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'WRONG_SERIAL' })
      .expect(422);

    expect(res.body.status).toBe(ReceiptStatus.REJECTED);
    expect(res.body.rejectionReason).toContain('mismatch');
  });

  it('201 IN_EVALUATION for WARRANTY_REPAIR with correct serial', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/rmas/${serialEnforcedRmaId}/receive`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'CORRECT_SERIAL' })
      .expect(201);

    expect(res.body.status).toBe(ReceiptStatus.SUCCESS);
    expect(res.body.disposition).toBe(Disposition.IN_EVALUATION);
  });

  it('404 when RMA not found', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/rmas/00000000-0000-0000-0000-000000000000/receive')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(404);
  });

  it('401 without token', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/rmas/${openRmaId}/receive`)
      .send({ receivedSerialNumber: 'ANY123' })
      .expect(401);
  });
});
