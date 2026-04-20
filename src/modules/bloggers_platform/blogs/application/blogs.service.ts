import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Result } from '../../../../core/object-result/result.entity';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import { CreateBlogDomainDto } from '../domain/dto/create-blog.domain.dto';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { UpdateBlogInputDto } from '../api/input-dto/blogs.update-dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async findById(id: string): Promise<Result<BlogViewDto>> {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    return Result.success(BlogViewDto.mapToView(blog));
  }

  async createBlog(dto: CreateBlogInputDto): Promise<Result<BlogViewDto>> {
    const domainDto: CreateBlogDomainDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    const newBlog = this.BlogModel.createBlog(domainDto);

    await this.blogsRepository.save(newBlog);

    return Result.success(BlogViewDto.mapToView(newBlog));
  }

  async updateBlog(id: string, dto: UpdateBlogInputDto): Promise<Result> {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    blog.updateBlog(dto.name, dto.description, dto.websiteUrl);
    await this.blogsRepository.save(blog);

    return Result.success();
  }

  async deleteBlog(id: string): Promise<Result> {
    const blog = await this.blogsRepository.findById(id); // ← ищем по id здесь

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    await this.blogsRepository.delete(blog); // ← передаём уже найденного пользователя

    return Result.success();
  }
}
