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
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/interfaces/jwt.interface';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('account')
@UseGuards(RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  @Roles(Role.CLIENT)
  async create(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ data: AccountEntity }> {
    const data = await this.accountService.create(
      req.client.id,
      createAccountDto,
    );
    return { data };
  }

  @Get('balance/:id')
  @Roles(Role.CLIENT)
  async findBalance(
    @Request() req: ExpressRequest & { client: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.accountService.findBalance(req.client.id, id);
    return { data };
  }
}
