import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [AccountModule, TransactionModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
