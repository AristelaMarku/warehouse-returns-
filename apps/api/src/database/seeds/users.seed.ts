import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { WarehouseUserEntity } from '../../modules/users/entities/warehouse-user.entity';

export async function seedUsers(dataSource: DataSource): Promise<WarehouseUserEntity[]> {
  const repo = dataSource.getRepository(WarehouseUserEntity);

  const users = [
    {
      username: 'admin',
      displayName: 'Admin User',
      email: 'admin@warehouse.local',
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'admin123', 10),
      role: 'admin',
    },
    {
      username: 'supervisor1',
      displayName: 'Sarah Supervisor',
      email: 'supervisor@warehouse.local',
      passwordHash: await bcrypt.hash(process.env.SEED_SUPERVISOR_PASSWORD ?? 'super123', 10),
      role: 'supervisor',
    },
    {
      username: 'receiver1',
      displayName: 'Bob Receiver',
      email: 'receiver@warehouse.local',
      passwordHash: await bcrypt.hash(process.env.SEED_RECEIVER_PASSWORD ?? 'recv123', 10),
      role: 'receiver',
    },
  ];

  const saved: WarehouseUserEntity[] = [];
  for (const data of users) {
    let user = await repo.findOne({ where: { username: data.username } });
    if (!user) {
      user = repo.create(data);
      await repo.save(user);
    }
    saved.push(user);
  }

  console.log(`✓ Seeded ${saved.length} users`);
  return saved;
}
