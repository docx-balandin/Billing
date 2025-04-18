import {
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Query,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all_account/:clientId')
  async findAllAccount(@Param('clientId', ParseIntPipe) clientId: number) {
    const data = await this.adminService.findAllAccount(clientId);
    return { data };
  }

  @Get('all_transaction')
  async findAllTransactions(@Query('order') order: string) {
    //type:asc,created:asc
    // const test = {
    //   type: 'ASC',
    //   createdAt: 'DESC',
    // };
    const data = await this.adminService.findAllTransactions();
    return { data };
  }

  @Patch('status_account/:accountId')
  async updateActiveAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const data = await this.adminService.updateActiveAccount(
      accountId,
      updateAdminDto,
    );
    return { data };
  }
}
