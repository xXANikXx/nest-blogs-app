import { IsString, IsUUID, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';
import { Trim } from '../../../../core/decorators/transform/trim';

export class NewPasswordInputDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  newPassword: string; // Лучше назвать newPassword для ясности, либо оставить password

  @IsString()
  @IsUUID()
  recoveryCode: string; // Это поле обязательно должно быть здесь
}
