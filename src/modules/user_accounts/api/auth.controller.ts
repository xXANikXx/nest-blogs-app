import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { LoginUserCommand } from '../application/usecases/users/login-user.usecase';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { Result } from '../../../core/object-result/result.entity';
import { handleResult } from '../../../core/object-result/handleresult';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { ConfirmEmailCommand } from '../application/usecases/users/confirm-email.usecase';
import { RegistrationEmailResendingInputDto } from './input-dto/email-resending.input-dto';
import { ResendConfirmationCommand } from '../application/usecases/users/resend-confirmation.usecase';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { PasswordRecoveryCommand } from '../application/usecases/users/password-recovery.usecase';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { UpdatePasswordCommand } from '../application/usecases/users/update-password.usecase';
import * as express from 'express';
import { RefreshTokenAuthGuard } from '../guards/bearer/refresh-token-auth.guard';
import { RefreshTokenPayloadDto } from '../guards/dto/refresh-token-payload.dto';
import { RefreshTokenCommand } from '../application/usecases/users/refresh-token.usecase';
import { LogoutCommand } from '../application/usecases/users/logout.usecase';

@Throttle({ default: { limit: 5, ttl: 10000 } })
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'super password' },
      },
    },
  })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ): Promise<{ accessToken: string }> {
    const ip = req.ip ?? 'unknown';
    const title = req.headers['user-agent'] ?? 'unknown';

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(user.id, user.login, ip, title));

    // Установка Refresh токена в безопасную куку
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Включай true, если тестируешь через https/ngrok, для чистого http localhost можно временно убирать
      sameSite: 'strict', // Защищает от CSRF атак лучше, чем 'none'
    });

    return { accessToken };
  }

  @SkipThrottle()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    const result = await this.commandBus.execute<RegisterUserCommand, Result>(
      new RegisterUserCommand(body),
    );
    handleResult(result);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<ConfirmEmailCommand, Result>(
      new ConfirmEmailCommand(body.code),
    );
    handleResult(result);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async emailResending(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      ResendConfirmationCommand,
      Result
    >(new ResendConfirmationCommand(body.email));
    handleResult(result);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      PasswordRecoveryCommand,
      Result
    >(new PasswordRecoveryCommand(body.email));
    handleResult(result);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    const result = await this.commandBus.execute<UpdatePasswordCommand, Result>(
      new UpdatePasswordCommand(body),
    );
    handleResult(result);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(
    @ExtractUserFromRequest() payload: RefreshTokenPayloadDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      { accessToken: string; refreshToken: string }
    >(
      new RefreshTokenCommand(
        payload.id,
        payload.deviceId,
        payload.login,
        payload.iat,
      ),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async logout(
    @ExtractUserFromRequest() payload: RefreshTokenPayloadDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const result = await this.commandBus.execute<LogoutCommand, Result>(
      new LogoutCommand(payload.deviceId),
    );
    res.clearCookie('refreshToken');
    handleResult(result);
  }
}
