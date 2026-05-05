import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';

export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserContextDto | null => {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: UserContextDto;
      }
    >();

    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
