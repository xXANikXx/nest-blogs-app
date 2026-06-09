import { CommentDocument } from '../../domain/comment.entity';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class LikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string; // ← string вместо Date
  likesInfo: LikesInfoDto; // ← добавь

  static mapToView(
    this: void,
    comment: CommentDocument,
    likesInfo: LikesInfoDto = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    },
  ): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt.toISOString(); // ← toISOString()
    dto.likesInfo = likesInfo;
    return dto;
  }
}
