import { IsString, IsUUID } from 'class-validator';

export class RegistrationConfirmationInputDto {
  @IsString()
  @IsUUID()
  code: string;
}
