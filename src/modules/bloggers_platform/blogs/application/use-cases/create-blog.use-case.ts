import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../../domain/blog.entity';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain.dto';

export interface CreateBlogData {
  name: string;
  description: string;
  websiteUrl: string;
}

export class CreateBlogCommand {
  constructor(public readonly data: CreateBlogData) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Result<BlogViewDto>> {
    const { data } = command;
    const domainDto: CreateBlogDomainDto = {
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl,
    };

    const newBlog = this.BlogModel.createBlog(domainDto);

    await this.blogsRepository.save(newBlog);

    return Result.success(BlogViewDto.mapToView(newBlog));
  }
}
