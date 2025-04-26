import { IsEmail, IsString } from 'class-validator';

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
