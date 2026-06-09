import { UpdatePostInputDto } from '../../src/modules/bloggers_platform/posts/api/input-dto/posts.update-dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import { CreatePostInputDto } from '../../src/modules/bloggers_platform/posts/api/input-dto/posts.create-dto';
import { PostViewDto } from '../../src/modules/bloggers_platform/posts/api/view-dto/post.view-dto';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { CreatePostByBlogInputDto } from '../../src/modules/bloggers_platform/posts/api/input-dto/postsByBlogs.create-dto';
import { delay } from './delay';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class PostsTestManager {
  constructor(private readonly app: INestApplication) {}

  private get httpServer(): Server {
    return this.app.getHttpServer() as Server;
  }

  async createPost(
    createModel: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as PostViewDto;
  }

  async createPostByBlog(
    blogId: string,
    createModel: CreatePostByBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as PostViewDto;
  }

  async createSeveralPosts(
    blogId: string,
    count: number,
  ): Promise<PostViewDto[]> {
    const postsPromises = [] as Promise<PostViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createPostByBlog(blogId, {
        title: `test post ${i}`,
        shortDescription: `test description ${i}`,
        content: `test content ${i}`,
      });
      postsPromises.push(response);
    }

    return Promise.all(postsPromises);
  }

  async getById(
    postId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<PostViewDto> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .expect(statusCode);

    return response.body as PostViewDto;
  }

  async getAll(
    query: Record<string, unknown> = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/posts`)
      .query(query)
      .expect(statusCode);

    return response.body as PaginatedViewDto<PostViewDto[]>;
  }

  async getByBlogId(
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

  async updatePost(
    postId: string,
    updateModel: UpdatePostInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async deletePost(
    postId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
