import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostInputDto } from '../api/input-dto/posts.create-dto';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { CreatePostDomainDto } from '../domain/dto/create-post.domain.dto';
import { Result } from '../../../../core/object-result/result.entity';
import { Post, type PostModelType } from '../domain/post.entity';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';
import { UpdatePostInputDto } from '../api/input-dto/posts.update-dto';
import { CreatePostByBlogInputDto } from '../api/input-dto/postsByBlogs.create-dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async createPost(dto: CreatePostInputDto): Promise<Result<PostViewDto>> {
    const blog = await this.blogsExternalQueryRepository.findById(dto.blogId);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    const domainDto: CreatePostDomainDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    };

    const newPost = this.PostModel.createPost(domainDto);
    await this.postsRepository.save(newPost);
    return Result.success(PostViewDto.mapToView(newPost));
  }

  async updatePost(id: string, dto: UpdatePostInputDto): Promise<Result> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      return Result.notFound('Post not found');
    }

    const blog = await this.blogsExternalQueryRepository.findById(dto.blogId);
    if (!blog) {
      return Result.notFound('Blog not found');
    }

    post.updatePost(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      blog.name,
    );
    await this.postsRepository.save(post);

    return Result.success();
  }

  async deletePost(id: string): Promise<Result> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      return Result.notFound('Post not found');
    }

    await this.postsRepository.delete(post);
    return Result.success();
  }

  async createPostByBlog(
    blogId: string,
    dto: CreatePostByBlogInputDto,
  ): Promise<Result<PostViewDto>> {
    const blog = await this.blogsExternalQueryRepository.findById(blogId);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    const domainDto: CreatePostDomainDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId, //  из параметра
      blogName: blog.name,
    };

    const newPost = this.PostModel.createPost(domainDto);
    await this.postsRepository.save(newPost);
    return Result.success(PostViewDto.mapToView(newPost));
  }
}
