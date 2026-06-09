import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { Result } from '../../../../../core/object-result/result.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class CreateCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly content: string,
    public readonly userId: string,
    public readonly userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  Result<CommentViewDto>
> {
  constructor(
    private commentsRepository: CommentsRepository, // ← комментарии
    private postsRepository: PostsRepository,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<Result<CommentViewDto>> {
    const post = await this.postsRepository.findById(command.postId);
    if (!post) {
      return Result.notFound('Post not found');
    }

    // 3. Вызываем статический фабричный метод нашей богатой модели
    const comment = this.CommentModel.createComment({
      content: command.content,
      postId: command.postId,
      userId: command.userId,
      userLogin: command.userLogin,
    });

    // 4. Сохраняем живой документ Mongoose через глупый репозиторий
    await this.commentsRepository.save(comment);

    // 5. Маппим свежесозданный коммент, передавая дефолтные лайки (их гарантированно 0)
    const viewDto = CommentViewDto.mapToView(comment, {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    });

    return Result.success(viewDto);
  }
}
