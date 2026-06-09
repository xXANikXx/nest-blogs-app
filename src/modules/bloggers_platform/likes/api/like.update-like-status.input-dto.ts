import { IsEnum } from 'class-validator';
import { LikeStatus } from '../domain/like.entity';

export class UpdateLikeStatusInputDto {
  @IsEnum(LikeStatus, {
    message:
      'Like status must be one of the following values: Like, Dislike, None',
  })
  likeStatus: LikeStatus;
}
