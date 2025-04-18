import { Injectable } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import { AccountService } from '../account/account.service';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
  ) {}

  findAllAccount(clientId: number) {
    return this.accountService.findAccounts(clientId);
  }

  findAllTransactions() {
    return this.transactionService.findAllTransactionForAdmin();
  }

  async updateActiveAccount(accountId: number, updateAdminDto: UpdateAdminDto) {
    await this.accountService.updateIsActive(
      accountId,
      updateAdminDto.isActive,
    );
  }
}
