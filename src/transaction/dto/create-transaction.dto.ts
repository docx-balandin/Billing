import { IsString } from 'class-validator';

export class MakeDepositDto {
  @IsString()
  amount: string;
}
