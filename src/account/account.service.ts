import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

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
    const account = await this.accountRepository.existsBy({
      id,
      client: { id: clientId },
    });
    if (!account) {
      throw new NotFoundException('Not Found');
    }

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
    const account = await this.accountRepository.existsBy({
      id: accountId,
      client: { id: clientId },
    });
    if (!account) {
      throw new NotFoundException('Not Found');
    }

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
