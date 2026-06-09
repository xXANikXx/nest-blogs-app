import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  type LikeModelType,
  LikeParentType,
  LikeStatus,
} from '../../../likes/domain/like.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly postId: string,
    public readonly likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<
  UpdatePostLikeStatusCommand,
  Result
> {
  constructor(
    private readonly postsRepository: PostsRepository, // 1. Внедряем репозиторий постов
    private readonly likesRepository: LikesRepository, // 2. Внедряем репозиторий лайков
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<Result> {
    const { userId, userLogin, postId, likeStatus } = command;

    // 1. Проверяем, существует ли вообще такой пост
    const post = await this.postsRepository.findById(postId);
    if (!post) {
      return Result.notFound('Post not found');
    }

    // 2. Ищем, реагировал ли уже этот юзер на этот пост раньше
    const existingLike = await this.likesRepository.findByUserAndParent(
      userId,
      postId,
    );

    // 3. Если реакции не было — создаем новую
    if (!existingLike) {
      const newLike = this.LikeModel.createLike({
        userId,
        userLogin,
        parentId: postId,
        parentType: LikeParentType.Post, // ← Жестко зашиваем тип родителя: Post!
        status: likeStatus,
      });
      await this.likesRepository.save(newLike);
      return Result.success();
    }

    // 4. Если реакция была — обновляем статус через богатую доменную модель Like
    existingLike.updateStatus(likeStatus);
    await this.likesRepository.save(existingLike);

    return Result.success();
  }
}
