import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';
import { Public } from './public.decorator';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from './interfaces/jwt.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest & { client: JwtPayload }) {
    // req.client;
    const data = await this.authService.getEmail(req.client.id);
    return { data: { profile: { email: data } } };
  }
}
