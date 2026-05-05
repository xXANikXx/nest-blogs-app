import { ResultStatus } from './resultCode';

export type ExtensionType = {
  field: string | null;
  message: string;
};

export class Result<T = null> {
  public readonly status: ResultStatus;
  public readonly message?: string;
  public readonly data: T | null;
  public readonly extensions: ExtensionType[];

  private constructor(
    status: ResultStatus,
    data: T | null = null,
    message?: string,
    extensions: ExtensionType[] = [],
  ) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.extensions = extensions;
  }

  public static success<T>(data: T | null = null): Result<T> {
    return new Result(ResultStatus.Success, data);
  }

  public static notFound<T>(message: string): Result<T> {
    return new Result<never>(ResultStatus.NotFound, null, message);
  }

  public static badRequest<T>(
    message: string,
    field: string | null = null,
  ): Result<T> {
    const extensions = field ? [{ field, message }] : [];
    return new Result<never>(
      ResultStatus.BadRequest,
      null,
      message,
      extensions,
    );
  }

  public static fail<T>(
    status: ResultStatus,
    message?: string,
    field: string | null = null,
  ): Result<T> {
    const extensions = field ? [{ field, message: message ?? 'Error' }] : [];
    return new Result<never>(status, null, message, extensions);
  }
}
