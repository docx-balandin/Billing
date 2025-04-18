import { BadRequestException, Injectable } from '@nestjs/common';
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

  findAllTransactionForAdmin() {
    return this.transactionRepository.find({
      where: {},
      order: { type: 'ASC', id: 'ASC', createdAt: 'ASC' },
    });
    // return this.transactionRepository.manager.query<TransactionEntity[]>(
    //   'SELECT * FROM transaction ORDER BY type, id, "createdAt"',
    // );
  }

  findAllTransactions(clientId: number): Promise<TransactionEntity[]> {
    return this.transactionRepository.findBy({
      client: { id: clientId },
    });
  }

  findAccountAllTransactions(
    clientId: number,
    accountId: number,
  ): Promise<TransactionEntity[]> {
    return this.transactionRepository.findBy({
      toAccount: { id: accountId },
      fromAccount: { id: accountId },
      client: { id: clientId },
    });
  }

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
      client: { id: clientId },
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
      client: { id: clientId },
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
