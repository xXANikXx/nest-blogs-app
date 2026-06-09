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
import { BlogsQueryService } from '../application/blogs.query.service';
import { BlogsService } from '../application/blogs.service';
import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blogs.create.input-dto';
import { UpdateBlogInputDto } from './input-dto/blogs.update-dto';
import { PostsQueryService } from '../../posts/application/posts.query.service';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input.dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { CreatePostByBlogInputDto } from '../../posts/api/input-dto/postsByBlogs.create-dto';
import { PostsService } from '../../posts/application/posts.service';
import { handleResult } from '../../../../core/object-result/handleresult';
import { BasicAuthGuard } from '../../../user_accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../user_accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user_accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../../user_accounts/guards/dto/user-context.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryService: BlogsQueryService,
    private postsQueryService: PostsQueryService,
    private postsService: PostsService,
  ) {}

  @ApiParam({ name: `id` })
  @Get(`:id`)
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    const result = await this.blogsQueryService.findById(id);
    return handleResult(result);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const result = await this.blogsQueryService.getAll(query);
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
    const blogResult = await this.blogsQueryService.findById(blogId);
    handleResult(blogResult);

    // 2. Получаем посты блога
    const result = await this.postsQueryService.getByBlogId(
      blogId,
      query,
      user?.id ?? null,
    );
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
    const result = await this.blogsService.updateBlog(id, body);
    handleResult(result);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const result = await this.blogsService.createBlog(body);
    return handleResult(result);
  }

  @ApiParam({ name: 'blogId' })
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogInputDto,
  ): Promise<PostViewDto> {
    const result = await this.postsService.createPostByBlog(blogId, body);
    return handleResult(result);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    const result = await this.blogsService.deleteBlog(id);
    handleResult(result);
  }
}
