import { Result } from '../../../../../core/object-result/result.entity';
import {
  Like,
  type LikeModelType,
  LikeParentType,
  LikeStatus,
} from '../../../likes/domain/like.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { InjectModel } from '@nestjs/mongoose';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly commentId: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase implements ICommandHandler<
  UpdateCommentLikeStatusCommand,
  Result
> {
  constructor(
    private readonly commentsRepository: CommentsRepository, // Ищем сам коммент
    private readonly likesRepository: LikesRepository, // Управляем лайками
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<Result> {
    const { userId, userLogin, commentId, likeStatus } = command;

    // 1. Сначала железно проверяем, существует ли вообще такой комментарий
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      return Result.notFound('Comment not found');
    }

    // 2. Ищем, реагировал ли уже этот юзер на этот комментарий раньше
    const existingLike = await this.likesRepository.findByUserAndParent(
      userId,
      commentId,
    );

    // 3. Если реакции не было — создаем новую
    if (!existingLike) {
      const newLike = this.LikeModel.createLike({
        userId,
        userLogin,
        parentId: commentId,
        parentType: LikeParentType.Comment, // Жестко зашито, так как контекст строго для комментов
        status: likeStatus,
      });
      await this.likesRepository.save(newLike);
      return Result.success();
    }

    // 4. Если реакция была — обновляем статус через богатую доменную модель
    existingLike.updateStatus(likeStatus);
    await this.likesRepository.save(existingLike);

    return Result.success();
  }
}
