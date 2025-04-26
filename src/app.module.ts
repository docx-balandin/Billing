import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: +(configService.get<string>('POSTGRES_PORT') || 5432),
          username: configService.get<string>('POSTGRES_USERNAME'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_NAME'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ClientModule,
    AccountModule,
    TransactionModule,
    AdminModule,
    AuthModule,
  ],
})
export class AppModule {}
