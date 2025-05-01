import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import * as argon2 from 'argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ClientService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async createClient(createClientDto: CreateClientDto): Promise<ClientEntity> {
    const client = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (client) {
      throw new BadRequestException('Client already exists');
    }

    const passwordHash = await argon2.hash(createClientDto.password);

    const createdClient = await this.clientRepository.save({
      email: createClientDto.email,
      password: passwordHash,
    });

    await this.cacheManager.set(String(createdClient.id), createdClient.email);

    return createdClient;
  }

  async findOne(email: string): Promise<ClientEntity> {
    const client = await this.clientRepository.findOne({ where: { email } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async findEmail(id: number) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client.email;
  }
}
