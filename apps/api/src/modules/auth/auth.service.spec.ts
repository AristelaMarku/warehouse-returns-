import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { WarehouseUserEntity } from '../users/entities/warehouse-user.entity';

function makeUser(overrides: Partial<WarehouseUserEntity> = {}): WarehouseUserEntity {
  const user = new WarehouseUserEntity();
  user.id = 'uuid-001';
  user.username = 'receiver1';
  user.displayName = 'Bob Receiver';
  user.email = 'bob@warehouse.com';
  user.passwordHash = bcrypt.hashSync('recv123', 10);
  user.role = 'receiver';
  user.isActive = true;
  return Object.assign(user, overrides);
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByUsername: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('returns user on valid credentials', async () => {
      const user = makeUser();
      usersService.findByUsername.mockResolvedValue(user);
      const result = await service.validateUser('receiver1', 'recv123');
      expect(result.id).toBe(user.id);
    });

    it('throws UnauthorizedException when user not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      await expect(service.validateUser('nobody', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      usersService.findByUsername.mockResolvedValue(makeUser());
      await expect(service.validateUser('receiver1', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('returns access token and user DTO', async () => {
      const user = makeUser();
      const result = await service.login(user);
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.id).toBe(user.id);
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});
