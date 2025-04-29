import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  async existsAccount(clientId: number, accountId: number) {
    const account = await this.accountRepository.existsBy({
      client: { id: clientId },
      id: accountId,
    });
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
  }

  async isSameClientAccounts(
    clientId: number,
    fromAccountId: number,
    toAccountId: number,
  ): Promise<boolean> {
    const fromAccount = await this.accountRepository.findOneBy({
      id: fromAccountId,
      client: { id: clientId },
    });
    const toAccount = await this.accountRepository.findOneBy({
      id: toAccountId,
      client: { id: clientId },
    });
    return Boolean(fromAccount && toAccount);
  }

  create(
    id: number,
    createAccountDto: CreateAccountDto,
  ): Promise<AccountEntity> {
    return this.accountRepository.save({
      ...createAccountDto,
      client: { id },
      balance: '0',
    });
  }

  async findBalance(
    clientId: number,
    id: number,
  ): Promise<Pick<AccountEntity, 'balance'>> {
    await this.existsAccount(clientId, id);

    const res = await this.accountRepository.findOne({
      where: { id },
      select: ['balance'],
    });

    if (!res) {
      throw new NotFoundException('Not Found');
    }

    return { balance: res.balance };
  }

  async updateBalance(
    clientId: number,
    accountId: number,
    amount: string,
  ): Promise<void> {
    const { balance } = await this.findBalance(clientId, accountId);

    await this.accountRepository.update(
      { id: accountId },
      {
        balance: String(parseFloat(balance) + parseFloat(amount)),
      },
    );
    // await this.accountRepository.manager.query<AccountEntity>(
    //   'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    //   [amount, id],
    // );
  }

  async activeAccount(accountId: number): Promise<void> {
    const active = await this.accountRepository.existsBy({
      id: accountId,
      isActive: true,
    });

    if (!active) {
      throw new BadRequestException(
        `Operation impossible! Account ${accountId} blocked!`,
      );
    }
  }

  async negativeBalance(accountId: number, amount: string): Promise<void> {
    const balance = await this.accountRepository.existsBy({
      id: accountId,
      balance: MoreThanOrEqual(amount),
    });

    if (!balance) {
      throw new BadRequestException(
        `Operation impossible! Negative account ${accountId} balance`,
      );
    }
  }

  findAccounts(clientId: number) {
    return this.accountRepository.findBy({ client: { id: clientId } });
  }

  async updateIsActive(accountId: number, isActive: boolean): Promise<void> {
    await this.accountRepository.update(
      { id: accountId },
      { isActive: isActive },
    );
  }
}
