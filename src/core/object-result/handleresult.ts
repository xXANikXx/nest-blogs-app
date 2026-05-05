import { resultCodeToHttpException } from './resultCodeToHttpException';
import { Result } from './result.entity';
import { ResultStatus } from './resultCode';

export function handleResult<T>(result: Result<T>): T {
  if (result.status !== ResultStatus.Success) {
    throw resultCodeToHttpException(
      result.status,
      result.message,
      result.extensions,
    );
  }
  return result.data as T;
}
