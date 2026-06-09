import { UserDocument } from '../../domain/user.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({ description: 'users ID', example: '6622b...' })
  id: string;
  @ApiProperty({ example: 'it_incubator_fan' })
  login: string;
  @ApiProperty({ example: 'test@mail.com' })
  email: string;
  @ApiProperty({ example: '2026-04-20T05:47:35.000Z' })
  createdAt: string;

  static mapToView(this: void, user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }
}

//https://docs.nestjs.com/openapi/mapped-types
export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user._id.toString();

    return dto;
  }
}
