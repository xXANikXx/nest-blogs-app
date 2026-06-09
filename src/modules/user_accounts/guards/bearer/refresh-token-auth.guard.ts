import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenPayloadDto } from '../dto/refresh-token-payload.dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard('refresh-token') {
  handleRequest<TUser = RefreshTokenPayloadDto>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
