import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../src/modules/bloggers_platform/blogs/api/input-dto/blogs.create.input-dto';
import { BlogViewDto } from '../../src/modules/bloggers_platform/blogs/api/view-dto/blog.view-dto';
import { Server } from 'node:http';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import request from 'supertest';
import { delay } from './delay';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { UpdateBlogInputDto } from '../../src/modules/bloggers_platform/blogs/api/input-dto/blogs.update-dto';
import { PostsTestManager } from './posts-test-manager';
import { PostViewDto } from '../../src/modules/bloggers_platform/posts/api/view-dto/post.view-dto';

export class BlogsTestManager {
  constructor(
    private readonly app: INestApplication,
    private postsTestManager: PostsTestManager,
  ) {}

  private get httpServer(): Server {
    return this.app.getHttpServer() as Server;
  }

  async getPostsByBlogId(
    blogId: string,
    query: Record<string, unknown> = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .query(query)
      .expect(statusCode);

    return response.body as PaginatedViewDto<PostViewDto[]>;
  }

  async createBlog(
    createModel: CreateBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewDto> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as BlogViewDto;
  }

  async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
    const blogs: BlogViewDto[] = [];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const blog = await this.createBlog({
        name: `test` + i,
        description: `testText`,
        websiteUrl: 'https://testblog.com',
      });
      blogs.push(blog);
    }

    return blogs;
  }

  async createBlogWithPosts(
    postsCount: number,
  ): Promise<{ blog: BlogViewDto; posts: PostViewDto[] }> {
    const blog = await this.createBlog({
      name: 'test blog',
      description: 'test description',
      websiteUrl: 'https://testblog.com',
    });

    const posts = await this.postsTestManager.createSeveralPosts(
      blog.id,
      postsCount,
    );

    return { blog, posts };
  }

  async getAll(
    query: Record<string, unknown> = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .query(query)
      .expect(statusCode);

    return response.body as PaginatedViewDto<BlogViewDto[]>;
  }

  async getById(
    blogId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<BlogViewDto> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .expect(statusCode);

    return response.body as BlogViewDto;
  }

  async updateBlog(
    blogId: string,
    updateModel: UpdateBlogInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<BlogViewDto> {
    const response = await request(this.httpServer)
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as BlogViewDto;
  }

  async deleteBlog(
    blogId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`/${GLOBAL_PREFIX}/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
