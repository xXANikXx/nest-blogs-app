import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Session, type SessionModelType } from '../../../domain/session.entity';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { randomUUID } from 'crypto';
import { RefreshTokenPayloadDto } from '../../../guards/dto/refresh-token-payload.dto';

export class LoginUserCommand {
  constructor(
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly ip: string,
    public readonly title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  {
    accessToken: string;
    refreshToken: string;
  }
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const deviceId = randomUUID();
    const accessToken = this.accessTokenContext.sign({
      id: command.userId,
      login: command.userLogin,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: command.userId,
      login: command.userLogin,
      deviceId,
    });

    const payload =
      this.refreshTokenContext.verify<RefreshTokenPayloadDto>(refreshToken);
    const session = this.SessionModel.createSession({
      userId: command.userId,
      deviceId,
      ip: command.ip,
      title: command.title,
      lastActiveDate: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
    });

    await this.sessionsRepository.save(session);

    return { accessToken, refreshToken };
  }
}
