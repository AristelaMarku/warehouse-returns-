import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { seedUsers } from './users.seed';
import { seedRmas } from './rmas.seed';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'warehouse_returns',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  entities: [__dirname + '/../../modules/**/entities/*.entity.{ts,js}'],
  synchronize: false,
});

async function run(): Promise<void> {
  await dataSource.initialize();
  console.log('Connected. Wiping all data...\n');

  // Truncate in FK-safe order: children first, parents last
  await dataSource.query(`TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE`);
  await dataSource.query(`TRUNCATE TABLE receipt  RESTART IDENTITY CASCADE`);
  await dataSource.query(`TRUNCATE TABLE rma       RESTART IDENTITY CASCADE`);
  await dataSource.query(`TRUNCATE TABLE warehouse_user RESTART IDENTITY CASCADE`);

  console.log('✓ All tables cleared\n');

  await seedUsers(dataSource);
  await seedRmas(dataSource);

  console.log('\n✅ Reseed complete');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Reseed failed:', err);
  process.exit(1);
});
