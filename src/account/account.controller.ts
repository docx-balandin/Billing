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
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountEntity } from './entities/account.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AppRequest } from '../types';

@Controller('account')
@UseGuards(RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  @Roles(Role.CLIENT)
  async create(
    @Request() req: AppRequest,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: AccountEntity }> {
    const data = await this.accountService.create(
      req.user.id,
      createAccountDto,
    );
    return { data };
  }

  @Get('balance/:id')
  @Roles(Role.CLIENT)
  async findBalance(
    @Request() req: AppRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.accountService.findBalance(req.user.id, id);
    return { data };
  }
}
