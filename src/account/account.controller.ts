import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountEntity } from './entities/account.entity';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create/:clientId')
  async create(
    @Param('clientId', ParseIntPipe) id: number,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: AccountEntity }> {
    const data = await this.accountService.create(id, createAccountDto);
    return { data };
  }

  @Get('balance/:clientId/:id')
  async findBalance(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.accountService.findBalance(clientId, id);
    return { data };
  }
}
