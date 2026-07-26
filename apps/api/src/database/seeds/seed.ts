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
  console.log('Connected to database, running seeds...\n');

  await seedUsers(dataSource);
  await seedRmas(dataSource);

  console.log('\n✅ Seed complete');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
