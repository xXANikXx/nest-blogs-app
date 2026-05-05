import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class PasswordRecoveryInputDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
