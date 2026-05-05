import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../core/adapters/bcrypt.service';
import { EmailService } from '../../notifications/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { Result } from '../../../core/object-result/result.entity';
import { domainExceptionCodeToResultStatus } from '../../../core/object-result/domain-exception-code.mapper';
import { DomainException } from '../../../core/exceptions/domain-exception';
import { NewPasswordInputDto } from '../api/input-dto/new-password.input-dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user =
      (await this.usersRepository.findByLogin(loginOrEmail)) ||
      (await this.usersRepository.findByEmail(loginOrEmail));

    if (!user) return null;

    const isPasswordValid = await this.bcryptService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  login(userId: string): { accessToken: string } {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }

  async registration(dto: CreateUserInputDto): Promise<Result> {
    // 1. Проверяем что email не занят
    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingByEmail) {
      return Result.badRequest('Email already exists', 'email');
    }

    // 2. Проверяем что login не занят
    const existingByLogin = await this.usersRepository.findByLogin(dto.login);
    if (existingByLogin) {
      return Result.badRequest('Login already exists', 'login');
    }

    // 3. Хешируем пароль
    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    // 4. Создаём пользователя через UserModel
    const newUser = this.UserModel.createUserByRegistration(domainDto);
    await this.usersRepository.save(newUser);

    // 5. Отправляем письмо с кодом подтверждения
    await this.emailService.sendConfirmationEmail(
      dto.email,
      newUser.emailConfirmation.confirmationCode,
    );

    return Result.success();
  }

  async registrationConfirmation(code: string): Promise<Result> {
    // 1. Находим пользователя по коду подтверждения
    const user = await this.usersRepository.findByConfirmationCode(code);
    if (!user) {
      return Result.badRequest('Invalid confirmation code', 'code');
    }

    // 2. Вызываем метод entity на найденном пользователе
    try {
      user.confirmEmail(code);
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
          'code',
        );
      }
      throw e;
    }

    await this.usersRepository.save(user);
    return Result.success();
  }

  async emailResending(email: string): Promise<Result> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return Result.badRequest('User not found', 'email');
    }
    try {
      user.updateConfirmationCode();
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
          'email',
        );
      }
      throw e;
    }

    await this.usersRepository.save(user);

    await this.emailService.sendConfirmationEmail(
      email,
      user.emailConfirmation.confirmationCode,
    );

    return Result.success();
  }

  async passwordRecovery(email: string): Promise<Result> {
    const user = await this.usersRepository.findByEmail(email);

    if (user) {
      const code = user.generateRecoveryCode();
      await this.usersRepository.save(user);
      // Сервис отправляет письмо, используя сгенерированный код
      await this.emailService.sendPasswordRecoveryEmail(email, code);
    }

    return Result.success();
  }

  async updatePassword(dto: NewPasswordInputDto): Promise<Result> {
    const user = await this.usersRepository.findByRecoveryCode(
      dto.recoveryCode,
    );
    if (!user) return Result.badRequest('Code is invalid', 'recoveryCode');

    // Хешируем на уровне СЕРВИСА
    const newPasswordHash = await this.bcryptService.generateHash(
      dto.newPassword,
    );

    try {
      // Передаем уже ГОТОВЫЙ хеш в сущность
      user.updatePassword(newPasswordHash, dto.recoveryCode);
      await this.usersRepository.save(user);
      return Result.success();
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
        );
      }
      throw e;
    }
  }
}
