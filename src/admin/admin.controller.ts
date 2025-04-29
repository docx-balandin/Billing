import {
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

const itemOrder = ['createdAt', 'type', 'id'];

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('allAccount/:clientId')
  @Roles(Role.ADMIN)
  async findAllAccount(@Param('clientId', ParseIntPipe) clientId: number) {
    const data = await this.adminService.findAllAccount(clientId);
    return { data };
  }

  @Get('allTransaction')
  @Roles(Role.ADMIN)
  async findAllTransactions(@Query('order') order: string) {
    //type:asc,created:asc
    // const test = {
    //   type: 'ASC',
    //   createdAt: 'DESC',
    // };
    const dataOrder = order.split(',').reduce((acc, item) => {
      const [key, value] = item.split(':');
      if (itemOrder.includes(key)) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});
    const data = await this.adminService.findAllTransactions(dataOrder);
    return { data };
  }

  @Patch('statusAccount/:accountId')
  @Roles(Role.ADMIN)
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
