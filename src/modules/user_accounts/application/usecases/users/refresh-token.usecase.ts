import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { RefreshTokenPayloadDto } from '../../../guards/dto/refresh-token-payload.dto';

export class RefreshTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly userLogin: string,
    public readonly currentIat: number,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<
  RefreshTokenCommand,
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
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
      });
    }

    const sessionTime = session.lastActiveDate.getTime();
    const tokenTime = command.currentIat * 1000;
    if (sessionTime !== tokenTime) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Token was already rotated! Unauthorized',
      });
    }

    const accessToken = this.accessTokenContext.sign({
      id: command.userId,
      login: command.userLogin,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: command.userId,
      deviceId: command.deviceId,
      login: command.userLogin,
    });

    const payload =
      this.refreshTokenContext.verify<RefreshTokenPayloadDto>(refreshToken);
    session.lastActiveDate = new Date(payload.iat * 1000);
    session.expiresAt = new Date(payload.exp * 1000);

    await this.sessionsRepository.save(session);

    return { accessToken, refreshToken };
  }
}
