import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { PostsTestManager } from './helpers/posts-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { Server } from 'node:http';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';

describe('posts', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  async function createTestBlog() {
    return blogsTestManager.createBlog({
      name: 'Test Blog',
      description: 'Test Description',
      websiteUrl: 'https://testblog.com',
    });
  }

  async function createTestPost(blogId: string) {
    return postsTestManager.createPost({
      title: 'Test Post',
      shortDescription: 'Test Short Description',
      content: 'Test Content',
      blogId,
    });
  }

  // используем хелперы везде где нужен блог+пост
  describe('PUT /posts/:id', () => {
    let blogId: string;
    let postId: string;

    beforeEach(async () => {
      const blog = await createTestBlog();
      blogId = blog.id;
      const post = await createTestPost(blogId);
      postId = post.id;
    });

    it('should update post', async () => {
      await postsTestManager.updatePost(postId, {
        title: 'Updated Post',
        shortDescription: 'Updated Short Description',
        content: 'Updated Content',
        blogId,
      });

      const updated = await postsTestManager.getById(postId);
      expect(updated.title).toBe('Updated Post');
      expect(updated.shortDescription).toBe('Updated Short Description');
      expect(updated.content).toBe('Updated Content');
    });

    it('should return 401 for unauthorized request', async () => {
      await request(app.getHttpServer() as Server)
        .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
        .send({
          title: 'Updated Post',
          shortDescription: 'Updated Short Description',
          content: 'Updated Content',
          blogId,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existing post', async () => {
      await postsTestManager.updatePost(
        '000000000000000000000000',
        {
          title: 'Updated Post',
          shortDescription: 'Updated Short Description',
          content: 'Updated Content',
          blogId,
        },
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('DELETE /posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const blog = await createTestBlog();
      const post = await createTestPost(blog.id);
      postId = post.id;
    });

    it('should soft delete post', async () => {
      await postsTestManager.deletePost(postId);
      await postsTestManager.getById(postId, HttpStatus.NOT_FOUND);
    });

    it('should return 401 for unauthorized request', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existing post', async () => {
      await postsTestManager.deletePost(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
