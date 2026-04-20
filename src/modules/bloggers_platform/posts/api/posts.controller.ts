import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryService } from '../application/posts.query.service';
import { PostViewDto } from './view-dto/post.view-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdatePostInputDto } from './input-dto/posts.update-dto';
import { CreatePostInputDto } from './input-dto/posts.create-dto';
import { CommentsQueryService } from '../../comments/application/comments.query.service';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryService: PostsQueryService,
    private commentsQueryService: CommentsQueryService,
  ) {}

  @ApiParam({ name: `id` })
  @Get(`:id`)
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    const result = await this.postsQueryService.findById(id);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const result = await this.postsQueryService.getAll(query);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: `id` })
  @Put(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    const result = await this.postsService.updatePost(id, body);
    result.throwIfError();
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const result = await this.postsService.createPost(body);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: `id` })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    const result = await this.postsService.deletePost(id);
    result.throwIfError();
  }

  @ApiParam({ name: `postId` })
  @Get(':postId/comments')
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // 1. Проверяем существование поста
    const postResult = await this.postsQueryService.findById(postId);
    postResult.throwIfError(); // ← если нет поста — 404

    // 2. Получаем комментарии
    const result = await this.commentsQueryService.getByPostId(postId, query);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  // @Get(':postId/comments')
  // async getCommentsByPostId(
  //   @Param('postId') postId: string,
  //   @Query() query: GetCommentsQueryParams,
  //   // @CurrentUser() userId?: string // Если у вас есть декоратор для получения ID из JWT
  // ): Promise<PaginatedViewDto<CommentViewDto[]>> {
  //   // 1. Проверяем существование поста
  //   // Используем ваш QueryService, который вернет 404, если поста нет
  //   const post = await this.postQueryService.findById(postId);
  //   if (!post) {
  //     throw new NotFoundException('Post not found');
  //     // Или post.throwIfError() если вы используете Result Object
  //   }
  //
  //   // 2. Если дошли сюда — пост точно есть. Запрашиваем комментарии.
  //   return await this.commentsExternalQueryRepository.getByPostId(
  //     query,
  //     postId,
  //     // userId // Передаем ID того, кто спрашивает, для myStatus в будущем
  //   );
  // }
}
