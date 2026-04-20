import { IsUUID } from 'class-validator';

export class ConfirmEmailInputDto {
  @IsUUID()
  code: string;
}
