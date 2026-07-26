import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RmasModule } from './modules/rmas/rmas.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_NAME: Joi.string().default('warehouse_returns'),
        DB_USER: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().default('postgres'),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('8h'),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        CORS_ORIGIN: Joi.string().default('http://localhost:4200'),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        database: config.get<string>('database.name'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        entities: [__dirname + '/modules/**/entities/*.entity.{ts,js}'],
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    UsersModule,
    RmasModule,
    ReceiptsModule,
    AuditModule,
  ],
})
export class AppModule {}
