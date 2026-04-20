import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './emailConfirmationSchema';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './passwordRecoverySchema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { randomUUID } from 'crypto';
import { DomainException } from '../../../core/exceptions/domain-exception';
import { ResultStatus } from '../../../core/object-result/resultCode';

export interface UsersFilter {
  $or?: { login?: any; email?: any }[];
  deletedAt: null;
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 100,
  })
  login: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 100,
  })
  email: string;
  @Prop({
    type: String,
    required: true,
  })
  passwordHash: string;
  createdAt: Date;
  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecovery;
  //не удаляем полностью информацию
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  private static buildUser(
    dto: CreateUserDomainDto,
    isConfirmed: boolean,
  ): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: new Date(Date.now() + 90 * 60 * 1000),
      isConfirmed,
    };

    user.passwordRecovery = { recoveryCode: null, expirationDate: null };
    return user as UserDocument;
  }

  static createUserByRegistration(dto: CreateUserDomainDto): UserDocument {
    return this.buildUser(dto, false);
  }

  static createdByAdmin(dto: CreateUserDomainDto): UserDocument {
    return this.buildUser(dto, true);
  }

  updatePassword(newHash: string, code: string) {
    // Проверяем правила внутри самого объекта
    if (
      !this.passwordRecovery.recoveryCode ||
      this.passwordRecovery.recoveryCode !== code
    ) {
      throw new DomainException(
        'Invalid recovery code',
        ResultStatus.BadRequest,
      );
    }

    if (
      !this.passwordRecovery.expirationDate ||
      new Date() > this.passwordRecovery.expirationDate
    ) {
      throw new DomainException(
        'Recovery code expired',
        ResultStatus.BadRequest,
      );
    }

    // Если всё хорошо — меняем состояние
    this.passwordHash = newHash;
    this.passwordRecovery.recoveryCode = null; // Сбрасываем в null
    this.passwordRecovery.expirationDate = null;
  }

  updateConfirmationCode() {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException(
        'Email already confirmed',
        ResultStatus.BadRequest,
      ); // Или свой класс DomainError
    }
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = new Date(
      Date.now() + 60 * 60 * 1000,
    );
  }

  confirmEmail(code: string): void {
    // 1. Правило: Нельзя подтвердить уже подтвержденный email
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException(
        'Email already confirmed',
        ResultStatus.BadRequest,
      );
    }

    // 2. Правило: Коды должны совпадать
    if (this.emailConfirmation.confirmationCode !== code) {
      throw new DomainException(
        'Invalid confirmation code',
        ResultStatus.BadRequest,
      );
    }

    // 3. Правило: Срок жизни кода не должен истечь
    if (new Date() > this.emailConfirmation.expirationDate) {
      throw new DomainException(
        'Confirmation code expired',
        ResultStatus.BadRequest,
      );
    }

    // Все проверки пройдены — меняем состояние
    this.emailConfirmation.isConfirmed = true;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException(
        'Entity already deleted',
        ResultStatus.InternalServerError,
      );
    }
    this.deletedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
