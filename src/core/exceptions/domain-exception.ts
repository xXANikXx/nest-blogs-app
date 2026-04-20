import { ResultStatus } from '../object-result/resultCode';

export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly status: ResultStatus,
  ) {
    super(message);
  }
}
