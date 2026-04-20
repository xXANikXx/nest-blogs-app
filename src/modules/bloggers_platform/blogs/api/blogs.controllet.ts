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
import { BlogsQueryService } from '../application/blogs.query.service';
import { BlogsService } from '../application/blogs.service';
import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { UpdateBlogInputDto } from './input-dto/blogs.update-dto';
import { PostsQueryService } from '../../posts/application/posts.query.service';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input.dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { CreatePostByBlogInputDto } from '../../posts/api/input-dto/postsByBlogs.create-dto';
import { PostsService } from '../../posts/application/posts.service';

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
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const result = await this.blogsQueryService.getAll(query);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: 'blogId' })
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Проверяем что блог существует
    const blogResult = await this.blogsQueryService.findById(blogId);
    blogResult.throwIfError();

    // 2. Получаем посты блога
    const result = await this.postsQueryService.getByBlogId(blogId, query);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    const result = await this.blogsService.updateBlog(id, body);
    result.throwIfError();
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const result = await this.blogsService.createBlog(body);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: 'blogId' })
  @Post(':blogId/posts')
  async createPostByBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogInputDto,
  ): Promise<PostViewDto> {
    const result = await this.postsService.createPostByBlog(blogId, body);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    const result = await this.blogsService.deleteBlog(id);
    result.throwIfError();
  }
}
