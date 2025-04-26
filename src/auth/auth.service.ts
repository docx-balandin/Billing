import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly clientService: ClientService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ accessToken: string }> {
    const client = await this.clientService.findOne(email);
    const passwordMatch = await argon2.verify(client.password, pass);
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    const payload = { id: client.id, email: client.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
    };
  }

  async getEmail(id: number) {
    return await this.clientService.findEmail(id);
  }
}
