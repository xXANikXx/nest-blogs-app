import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';
import { Request } from 'express';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private userAccountsConfig: UserAccountsConfig,
    private sessionsRepository: SessionsRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = request?.cookies as Record<
            string,
            string | undefined
          >;
          return cookies?.['refreshToken'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }

  async validate(
    payload: RefreshTokenPayloadDto,
  ): Promise<RefreshTokenPayloadDto | null> {
    const session = await this.sessionsRepository.findByDeviceId(
      payload.deviceId,
    );

    // 1. Если сессия удалена (был логаут или девайс удален из списка)
    if (!session) {
      return null;
    }

    // 2. Проверяем ротацию (сверяем iat токена с базой)
    const sessionTime = session.lastActiveDate.getTime();
    const tokenTime = payload.iat * 1000;

    if (sessionTime !== tokenTime) {
      return null;
    }

    return payload;
  }
}
