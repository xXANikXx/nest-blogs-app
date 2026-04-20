import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controllet';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryService } from './blogs/application/blogs.query.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsExternalQueryRepository } from './blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';
import { PostsService } from './posts/application/posts.service';
import { PostsQueryService } from './posts/application/posts.query.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryService } from './comments/application/comments.query.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsQueryService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsService,
    PostsQueryService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    CommentsQueryService,
  ],
  exports: [BlogsExternalQueryRepository],
})
export class BloggerPlatformModule {}
