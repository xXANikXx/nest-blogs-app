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
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

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
    ...loginConstraints,
  })
  login: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
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
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Invalid recovery code',
      });
    }

    if (
      !this.passwordRecovery.expirationDate ||
      new Date() > this.passwordRecovery.expirationDate
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired, // ← специфичный код
        message: 'Recovery code expired',
      });
    }

    // Если всё хорошо — меняем состояние
    this.passwordHash = newHash;
    this.passwordRecovery.recoveryCode = null; // Сбрасываем в null
    this.passwordRecovery.expirationDate = null;
  }

  generateRecoveryCode() {
    const code = randomUUID();
    this.passwordRecovery = {
      recoveryCode: code,
      expirationDate: new Date(Date.now() + 60 * 60 * 1000),
    };
    return code;
  }

  updateConfirmationCode() {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed', // ← правильное сообщение
      });
    }
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = new Date(
      Date.now() + 60 * 60 * 1000,
    );
  }

  confirmEmail(code: string): void {
    // 1. Правило: Нельзя подтвердить уже подтвержденный email
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'Email already confirmed',
      });
    }

    // 2. Правило: Коды должны совпадать
    if (this.emailConfirmation.confirmationCode !== code) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
      });
    }

    // 3. Правило: Срок жизни кода не должен истечь
    if (new Date() > this.emailConfirmation.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code expired',
      });
    }

    // Все проверки пройдены — меняем состояние
    this.emailConfirmation.isConfirmed = true;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Entity already deleted',
      });
    }
    this.deletedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
