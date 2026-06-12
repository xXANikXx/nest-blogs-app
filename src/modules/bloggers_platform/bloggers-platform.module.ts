import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsExternalQueryRepository } from './blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { CreateCommentUseCase } from './comments/application/usecase/create-comment.use-case';
import { GetCommentsByPostIdQueryHandler } from './comments/application/queries/get-comments-by-post.use-case';
import { GetCommentByIdHandler } from './comments/application/queries/get-comment-by-id.use-case';
import { UpdateCommentUseCase } from './comments/application/usecase/update-comment.use-case';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { UpdateCommentLikeStatusUseCase } from './comments/application/usecase/update-comments-like-status.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/usecases/update-post-like-status.usecase';
import { DeleteCommentUseCase } from './comments/application/usecase/delete-comment.use-case';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { GetBlogsHandler } from './blogs/application/queries/get-blogs.query-handler';
import { GetBlogByIdHandler } from './blogs/application/queries/get-blog-by-id.query-handler';
import { CreatePostUseCase } from './posts/application/usecases/create-post.use-case';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.use-case';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.use-case';
import { CreatePostByBlogUseCase } from './posts/application/usecases/create-post-by-blog.use-case';
import { GetPostsHandler } from './posts/application/queries/get-posts.query-handler';
import { GetPostByIdHandler } from './posts/application/queries/get-post-by-id.query-handler';
import { GetPostsByBlogIdHandler } from './posts/application/queries/get-posts-by-blog-id.query-handler';

const commandHandlers = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdatePostLikeStatusUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreatePostByBlogUseCase,
];
const queryHandlers = [
  GetCommentByIdHandler,
  GetCommentsByPostIdQueryHandler,
  GetBlogsHandler,
  GetBlogByIdHandler,
  GetPostsHandler,
  GetPostByIdHandler,
  GetPostsByBlogIdHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    CommentsRepository,
    LikesRepository,
  ],
  exports: [BlogsExternalQueryRepository],
})
export class BloggerPlatformModule {}
