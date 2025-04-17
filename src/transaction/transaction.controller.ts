import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { MakeDepositDto } from './dto/create-transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionsService: TransactionService) {}

  @Post('deposit/:clientId/:accountId')
  async makeDeposit(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeDeposit(
      clientId,
      accountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('withdraw/:clientId/:accountId')
  async makeWithdraw(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeWithdraw(
      clientId,
      accountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('transfer/:clientId/:fromAccountId/:toAccountId')
  async makeTransfer(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('fromAccountId', ParseIntPipe) fromAccountId: number,
    @Param('toAccountId', ParseIntPipe) toAccountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeTransfer(
      clientId,
      fromAccountId,
      toAccountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('p2transfer/:fromClientId/:toClientId/:fromAccountId/:toAccountId')
  async makeP2Transfer(
    @Param('fromClientId', ParseIntPipe) fromClientId: number,
    @Param('toClientId', ParseIntPipe) toClientId: number,
    @Param('fromAccountId', ParseIntPipe) fromAccountId: number,
    @Param('toAccountId', ParseIntPipe) toAccountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeP2Transfer(
      fromClientId,
      toClientId,
      fromAccountId,
      toAccountId,
      makeDepositDto,
    );
    return { data };
  }
}
