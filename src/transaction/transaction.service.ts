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

  findAllTransactionForAdmin(order: Record<string, string>) {
    return this.transactionRepository.find({
      where: {},
      order: order,
    });
  }

  findAllTransactions(clientId: number): Promise<TransactionEntity[]> {
    return this.transactionRepository.findBy({
      client: { id: clientId },
    });
  }

  async findAccountAllTransactions(
    clientId: number,
    accountId: number,
  ): Promise<TransactionEntity[]> {
    const allAccountTransaction = await this.transactionRepository.find({
      where: [
        { client: { id: clientId }, toAccount: { id: accountId } },
        { client: { id: clientId }, fromAccount: { id: accountId } },
      ],
    });

    if (!allAccountTransaction.length) {
      throw new BadRequestException('Account Not Found');
    }

    return allAccountTransaction;
  }

  async makeDeposit(
    clientId: number,
    accountId: number,
    makeDepositDto: MakeDepositDto,
  ): Promise<TransactionEntity> {
    await this.accountService.existsAccount(clientId, accountId);

    await this.accountService.activeAccount(accountId);

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
    await this.accountService.existsAccount(clientId, accountId);

    await this.accountService.activeAccount(accountId);

    await this.accountService.negativeBalance(accountId, makeDepositDto.amount);

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
      throw new BadRequestException(
        'The accounts do not belong to the same client',
      );
    }

    await this.accountService.existsAccount(clientId, fromAccountId);

    await this.accountService.existsAccount(clientId, toAccountId);

    await this.accountService.activeAccount(fromAccountId);

    await this.accountService.activeAccount(toAccountId);

    await this.accountService.negativeBalance(
      fromAccountId,
      makeDepositDto.amount,
    );

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
      client: { id: clientId },
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
    await this.accountService.existsAccount(fromClientId, fromAccountId);

    await this.accountService.existsAccount(toClientId, toAccountId);

    await this.accountService.activeAccount(fromAccountId);

    await this.accountService.activeAccount(toAccountId);

    await this.accountService.negativeBalance(
      fromAccountId,
      makeDepositDto.amount,
    );

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
      client: { id: fromClientId },
      status: TransactionStatusEnum.SUCCESS,
      type: TransactionTypeEnum.P2TRANSFER,
    });
  }
}
