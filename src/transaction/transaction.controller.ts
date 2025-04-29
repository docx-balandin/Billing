import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { MakeDepositDto } from './dto/create-transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt.interface';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('transaction')
@UseGuards(RolesGuard)
export class TransactionController {
  constructor(private readonly transactionsService: TransactionService) {}

  @Get('allTransaction')
  @Roles(Role.CLIENT)
  async findAllTransaction(
    @Request() req: ExpressRequest & { client: JwtPayload },
  ) {
    const data = await this.transactionsService.findAllTransactions(
      req.client.id,
    );
    return { data };
  }

  @Get('allAccountTransaction/:accountId')
  @Roles(Role.CLIENT)
  async findAccountAllTransaction(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    const data = await this.transactionsService.findAccountAllTransactions(
      req.client.id,
      accountId,
    );
    return { data };
  }

  @Post('deposit/:accountId')
  @Roles(Role.CLIENT)
  async makeDeposit(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeDeposit(
      req.client.id,
      accountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('withdraw/:accountId')
  @Roles(Role.CLIENT)
  async makeWithdraw(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeWithdraw(
      req.client.id,
      accountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('transfer/:fromAccountId/:toAccountId')
  @Roles(Role.CLIENT)
  async makeTransfer(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('fromAccountId', ParseIntPipe) fromAccountId: number,
    @Param('toAccountId', ParseIntPipe) toAccountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeTransfer(
      req.client.id,
      fromAccountId,
      toAccountId,
      makeDepositDto,
    );
    return { data };
  }

  @Post('p2transfer/:toClientId/:fromAccountId/:toAccountId')
  @Roles(Role.CLIENT)
  async makeP2Transfer(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('toClientId', ParseIntPipe) toClientId: number,
    @Param('fromAccountId', ParseIntPipe) fromAccountId: number,
    @Param('toAccountId', ParseIntPipe) toAccountId: number,
    @Body() makeDepositDto: MakeDepositDto,
  ): Promise<{ data: TransactionEntity }> {
    const data = await this.transactionsService.makeP2Transfer(
      req.client.id,
      toClientId,
      fromAccountId,
      toAccountId,
      makeDepositDto,
    );
    return { data };
  }
}
