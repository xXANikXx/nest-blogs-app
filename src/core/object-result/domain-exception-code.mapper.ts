import { DomainExceptionCode } from '../exceptions/domain-exception-codes';
import { ResultStatus } from './resultCode';

export const domainExceptionCodeToResultStatus = (
  code: DomainExceptionCode,
): ResultStatus => {
  switch (code) {
    case DomainExceptionCode.BadRequest:
    case DomainExceptionCode.ValidationError:
    case DomainExceptionCode.ConfirmationCodeExpired:
    case DomainExceptionCode.EmailNotConfirmed:
    case DomainExceptionCode.PasswordRecoveryCodeExpired:
      return ResultStatus.BadRequest;
    case DomainExceptionCode.NotFound:
      return ResultStatus.NotFound;
    case DomainExceptionCode.Unauthorized:
      return ResultStatus.Unauthorized;
    case DomainExceptionCode.Forbidden:
      return ResultStatus.Forbidden;
    default:
      return ResultStatus.InternalServerError;
  }
};
