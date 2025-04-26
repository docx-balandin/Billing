import { Body, Controller, Post } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientEntity } from './entities/client.entity';
import { Public } from '../auth/public.decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Public()
  @Post('create_user')
  async createClient(
    @Body() createClientDto: CreateClientDto,
  ): Promise<{ data: ClientEntity }> {
    const data = await this.clientService.createClient(createClientDto);
    return { data };
  }
}
