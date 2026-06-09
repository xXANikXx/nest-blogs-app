import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { Server } from 'node:http';

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  // вспомогательная функция чтобы не дублировать
  async function createTestBlog() {
    return blogsTestManager.createBlog({
      name: 'Test Blog',
      description: 'Test Description',
      websiteUrl: 'https://testblog.com',
    });
  }

  describe('POST /blogs', () => {
    it('should create blog and return correct structure', async () => {
      const dto = {
        name: 'Test Blog',
        description: 'Test Description',
        websiteUrl: 'https://testblog.com',
      };

      const blog = await blogsTestManager.createBlog(dto);

      expect(blog).toEqual({
        id: expect.any(String) as string,
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
        createdAt: expect.any(String) as string,
        isMembership: false,
      });
    });

    it('should return 401 for unauthorized request', async () => {
      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/blogs`)
        .send({
          name: 'Test Blog',
          description: 'Test Description',
          websiteUrl: 'https://testblog.com',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 for empty name', async () => {
      await blogsTestManager.createBlog(
        {
          name: '',
          description: 'Test Description',
          websiteUrl: 'https://testblog.com',
        },
        HttpStatus.BAD_REQUEST,
      );
    });

    it('should return 400 for invalid websiteUrl', async () => {
      await blogsTestManager.createBlog(
        {
          name: 'Test Blog',
          description: 'Test Description',
          websiteUrl: 'not-a-url',
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('GET /blogs', () => {
    it('should return empty list', async () => {
      const response = await blogsTestManager.getAll();

      expect(response.totalCount).toBe(0);
      expect(response.items).toHaveLength(0);
      expect(response.pagesCount).toBe(0);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(10);
    });

    it('should return blogs with correct pagination', async () => {
      await blogsTestManager.createSeveralBlogs(15);

      const response = await blogsTestManager.getAll({
        pageSize: 10,
        pageNumber: 1,
      });

      expect(response.totalCount).toBe(15);
      expect(response.items).toHaveLength(10);
      expect(response.pagesCount).toBe(2);
      expect(response.page).toBe(1);
    });

    it('should return second page', async () => {
      await blogsTestManager.createSeveralBlogs(15);

      const response = await blogsTestManager.getAll({
        pageSize: 10,
        pageNumber: 2,
      });

      expect(response.totalCount).toBe(15);
      expect(response.items).toHaveLength(5);
      expect(response.page).toBe(2);
    });

    it('should return blogs sorted by createdAt desc by default', async () => {
      const blogs = await blogsTestManager.createSeveralBlogs(3);
      const response = await blogsTestManager.getAll();

      expect(response.items[0].id).toBe(blogs[blogs.length - 1].id);
    });

    it('should filter blogs by searchNameTerm', async () => {
      await blogsTestManager.createBlog({
        name: 'JavaScript Blog',
        description: 'About JS',
        websiteUrl: 'https://jsblog.com',
      });
      await blogsTestManager.createBlog({
        name: 'Python Blog',
        description: 'About Python',
        websiteUrl: 'https://pyblog.com',
      });

      const response = await blogsTestManager.getAll({
        searchNameTerm: 'java',
      });

      expect(response.totalCount).toBe(1);
      expect(response.items[0].name).toBe('JavaScript Blog');
    });
  });

  describe('GET /blogs/:id', () => {
    it('should return blog by id', async () => {
      const created = await createTestBlog();
      const found = await blogsTestManager.getById(created.id);

      expect(found).toEqual(created);
    });

    it('should return 404 for non-existing blog', async () => {
      await blogsTestManager.getById(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('PUT /blogs/:id', () => {
    it('should update blog', async () => {
      const created = await createTestBlog();

      await blogsTestManager.updateBlog(created.id, {
        name: 'Updated Blog',
        description: 'Updated Description',
        websiteUrl: 'https://updatedblog.com',
      });

      const updated = await blogsTestManager.getById(created.id);

      expect(updated.name).toBe('Updated Blog');
      expect(updated.description).toBe('Updated Description');
      expect(updated.websiteUrl).toBe('https://updatedblog.com');
    });

    it('should return 401 for unauthorized request', async () => {
      const created = await createTestBlog();

      await request(app.getHttpServer() as Server)
        .put(`/${GLOBAL_PREFIX}/blogs/${created.id}`)
        .send({
          name: 'Updated Blog',
          description: 'Updated Description',
          websiteUrl: 'https://updatedblog.com',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existing blog', async () => {
      await blogsTestManager.updateBlog(
        '000000000000000000000000',
        {
          name: 'Updated Blog',
          description: 'Updated Description',
          websiteUrl: 'https://updatedblog.com',
        },
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('should soft delete blog', async () => {
      const created = await createTestBlog();

      await blogsTestManager.deleteBlog(created.id);
      await blogsTestManager.getById(created.id, HttpStatus.NOT_FOUND);
    });

    it('should return 401 for unauthorized request', async () => {
      const created = await createTestBlog();

      await request(app.getHttpServer() as Server)
        .delete(`/${GLOBAL_PREFIX}/blogs/${created.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existing blog', async () => {
      await blogsTestManager.deleteBlog(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('GET /blogs/:blogId/posts', () => {
    it('should return posts for specific blog', async () => {
      const { blog } = await blogsTestManager.createBlogWithPosts(3);
      const response = await blogsTestManager.getPostsByBlogId(blog.id);

      expect(response.totalCount).toBe(3);
      expect(response.items).toHaveLength(3);
      expect(response.items[0].blogId).toBe(blog.id);
    });

    it('should return empty list for blog without posts', async () => {
      const blog = await createTestBlog();
      const response = await blogsTestManager.getPostsByBlogId(blog.id);

      expect(response.totalCount).toBe(0);
      expect(response.items).toHaveLength(0);
    });

    it('should return 404 for non-existing blog', async () => {
      await blogsTestManager.getPostsByBlogId(
        '000000000000000000000000',
        {},
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
