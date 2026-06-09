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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryService } from '../application/posts.query.service';
import { PostViewDto } from './view-dto/post.view-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdatePostInputDto } from './input-dto/posts.update-dto';
import { CreatePostInputDto } from './input-dto/posts.create-dto';
import { handleResult } from '../../../../core/object-result/handleresult';
import { BasicAuthGuard } from '../../../user_accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../../user_accounts/guards/bearer/jwt-auth.guard';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comments.create.input-dto';
import { ExtractUserFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user_accounts/guards/dto/user-context.dto';
import { CreateCommentCommand } from '../../comments/application/usecase/create-comment.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { Result } from '../../../../core/object-result/result.entity';
import { JwtOptionalAuthGuard } from '../../../user_accounts/guards/bearer/jwt-optional-auth.guard';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { ExtractUserIfExistsFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetCommentByPostIdQuery } from '../../comments/application/queries/get-comments-by-post.use-case';
import { UpdateLikeStatusInputDto } from '../../likes/api/like.update-like-status.input-dto';
import { UpdatePostLikeStatusCommand } from '../application/usecases/update-post-like-status.usecase';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryService: PostsQueryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiParam({ name: `id` })
  @UseGuards(JwtOptionalAuthGuard)
  @Get(`:id`)
  async getById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    const result = await this.postsQueryService.findById(id, user?.id ?? null);
    return handleResult(result);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const result = await this.postsQueryService.getAll(query, user?.id ?? null);
    return handleResult(result);
  }

  @UseGuards(BasicAuthGuard)
  @ApiParam({ name: `id` })
  @Put(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    const result = await this.postsService.updatePost(id, body);
    handleResult(result);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const result = await this.postsService.createPost(body);
    return handleResult(result);
  }

  @UseGuards(BasicAuthGuard)
  @ApiParam({ name: `id` })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    const result = await this.postsService.deletePost(id);
    handleResult(result);
  }

  //comments and likes endpoints
  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() inputDto: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const result = await this.commandBus.execute<
      UpdatePostLikeStatusCommand,
      Result
    >(
      new UpdatePostLikeStatusCommand(
        user.id,
        user.login,
        postId,
        inputDto.likeStatus,
      ),
    );

    return handleResult(result);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const result = await this.queryBus.execute<
      GetCommentByPostIdQuery,
      Result<PaginatedViewDto<CommentViewDto[]>>
    >(new GetCommentByPostIdQuery(postId, query, user?.id ?? null));

    return handleResult(result);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @Body() inputDto: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const result = await this.commandBus.execute<
      CreateCommentCommand,
      Result<CommentViewDto>
    >(new CreateCommentCommand(postId, inputDto.content, user.id, user.login));

    return handleResult(result);
  }
}
