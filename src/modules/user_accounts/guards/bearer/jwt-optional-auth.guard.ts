//в домашнем задании есть случай когда надо проверить токен и извлечь данные из токена, но не блокировать запрос для анонимного пользователя
//для этого можно использовать подобный гард, переопределив handleRequest
//https://docs.nestjs.com/recipes/passport#extending-guards
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserContextDto } from '../dto/user-context.dto';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  // Переопределяем handleRequest чтобы не бросать ошибку для анонимных пользователей.
  // Базовый метод AuthGuard бросает UnauthorizedException если нет юзера:
  //   if (err || !user) throw err || new UnauthorizedException();
  // Мы вместо этого просто возвращаем null
  handleRequest<TUser = UserContextDto>(
    err: Error | null,
    user: TUser | false,
  ): TUser | null {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
