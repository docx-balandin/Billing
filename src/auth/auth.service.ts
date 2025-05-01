import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly clientService: ClientService,
    private readonly jwtService: JwtService,
  ) {}

  async validateClient(email: string, pass: string) {
    const client = await this.clientService.findOne(email);
    const passwordMatch = await argon2.verify(client.password, pass);
    if (client && passwordMatch) {
      return client;
    }
    throw new UnauthorizedException();
  }

  async login(email: string, pass: string): Promise<{ accessToken: string }> {
    const client = await this.validateClient(email, pass);

    const payload = { id: client.id, email: client.email, roles: client.roles };

    await this.cacheManager.set(String(client.id), client.email);

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
    };
  }

  async getEmail(id: number) {
    const cacheEmail = await this.cacheManager.get<string>(String(id));

    return cacheEmail || this.clientService.findEmail(id);
  }
}
