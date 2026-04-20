import { UserDocument } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({ description: 'users ID', example: '6622b...' })
  id: string;
  @ApiProperty({ example: 'it_incubator_fan' })
  login: string;
  @ApiProperty({ example: 'test@mail.com' })
  email: string;
  @ApiProperty({ example: '2026-04-20T05:47:35.000Z' })
  createdAt: Date;

  static mapToView(this: void, user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
