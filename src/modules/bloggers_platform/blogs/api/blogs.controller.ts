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
import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blogs.create.input-dto';
import { UpdateBlogInputDto } from './input-dto/blogs.update-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input.dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { CreatePostByBlogInputDto } from '../../posts/api/input-dto/postsByBlogs.create-dto';
import { handleResult } from '../../../../core/object-result/handleresult';
import { BasicAuthGuard } from '../../../user_accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../user_accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../../user_accounts/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { Result } from '../../../../core/object-result/result.entity';
import { CreatePostByBlogCommand } from '../../posts/application/usecases/create-post-by-blog.use-case';
import { GetPostsByBlogIdQuery } from '../../posts/application/queries/get-posts-by-blog-id.query-handler';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiParam({ name: `id` })
  @Get(`:id`)
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    const result = await this.queryBus.execute<
      GetBlogByIdQuery,
      Result<BlogViewDto>
    >(new GetBlogByIdQuery(id));
    return handleResult(result);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const result = await this.queryBus.execute<
      GetBlogsQuery,
      Result<PaginatedViewDto<BlogViewDto[]>>
    >(new GetBlogsQuery(query));
    return handleResult(result);
  }

  @ApiParam({ name: 'blogId' })
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Проверяем что блог существует
    const blogResult = await this.queryBus.execute<
      GetBlogByIdQuery,
      Result<BlogViewDto>
    >(new GetBlogByIdQuery(blogId));
    handleResult(blogResult);

    // 2. Получаем посты блога
    const result = await this.queryBus.execute<
      GetPostsByBlogIdQuery,
      Result<PaginatedViewDto<PostViewDto[]>>
    >(new GetPostsByBlogIdQuery(blogId, query, user?.id ?? null));
    return handleResult(result);
  }

  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<UpdateBlogCommand, Result>(
      new UpdateBlogCommand(id, body),
    );
    handleResult(result);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const result = await this.commandBus.execute<
      CreateBlogCommand,
      Result<BlogViewDto>
    >(new CreateBlogCommand(body));
    return handleResult(result);
  }

  @ApiParam({ name: 'blogId' })
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogInputDto,
  ): Promise<PostViewDto> {
    const result = await this.commandBus.execute<
      CreatePostByBlogCommand,
      Result<PostViewDto>
    >(new CreatePostByBlogCommand(blogId, body));
    return handleResult(result);
  }

  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteBlogCommand, Result>(
      new DeleteBlogCommand(id),
    );
    handleResult(result);
  }
}
