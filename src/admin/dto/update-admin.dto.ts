import { IsBoolean } from 'class-validator';

export class UpdateAdminDto {
  @IsBoolean()
  isActive: boolean;
}
