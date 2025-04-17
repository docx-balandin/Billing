import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TransactionEntity,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MakeDepositDto } from './dto/create-transaction.dto';
import { AccountService } from '../account/account.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
  ) {}

  async makeDeposit(
    clientId: number,
    accountId: number,
    makeDepositDto: MakeDepositDto,
  ): Promise<TransactionEntity> {
    await this.accountService.updateBalance(
      clientId,
      accountId,
      makeDepositDto.amount,
    );
    return this.transactionRepository.save({
      ...makeDepositDto,
      toAccount: { id: accountId },
      status: TransactionStatusEnum.SUCCESS,
      type: TransactionTypeEnum.DEPOSIT,
    });
  }

  async makeWithdraw(
    clientId: number,
    accountId: number,
    makeDepositDto: MakeDepositDto,
  ): Promise<TransactionEntity> {
    await this.accountService.updateBalance(
      clientId,
      accountId,
      '-' + makeDepositDto.amount,
    );
    return this.transactionRepository.save({
      ...makeDepositDto,
      toAccount: { id: accountId },
      status: TransactionStatusEnum.SUCCESS,
      type: TransactionTypeEnum.WITHDRAW,
    });
  }

  async makeTransfer(
    clientId: number,
    fromAccountId: number,
    toAccountId: number,
    makeDepositDto: MakeDepositDto,
  ): Promise<TransactionEntity> {
    const isSameClientAccounts = await this.accountService.isSameClientAccounts(
      clientId,
      fromAccountId,
      toAccountId,
    );

    if (!isSameClientAccounts) {
      throw new BadRequestException('Not Found');
    }

    await this.accountService.updateBalance(
      clientId,
      fromAccountId,
      '-' + makeDepositDto.amount,
    );
    await this.accountService.updateBalance(
      clientId,
      toAccountId,
      makeDepositDto.amount,
    );
    return this.transactionRepository.save({
      ...makeDepositDto,
      fromAccount: { id: fromAccountId },
      toAccount: { id: toAccountId },
      status: TransactionStatusEnum.SUCCESS,
      type: TransactionTypeEnum.TRANSFER,
    });
  }

  async makeP2Transfer(
    fromClientId: number,
    toClientId: number,
    fromAccountId: number,
    toAccountId: number,
    makeDepositDto: MakeDepositDto,
  ): Promise<TransactionEntity> {
    await this.accountService.updateBalance(
      fromClientId,
      fromAccountId,
      '-' + makeDepositDto.amount,
    );
    await this.accountService.updateBalance(
      toClientId,
      toAccountId,
      makeDepositDto.amount,
    );
    return this.transactionRepository.save({
      ...makeDepositDto,
      fromAccount: { id: fromAccountId },
      toAccount: { id: toAccountId },
      status: TransactionStatusEnum.SUCCESS,
      type: TransactionTypeEnum.P2TRANSFER,
    });
  }
}
