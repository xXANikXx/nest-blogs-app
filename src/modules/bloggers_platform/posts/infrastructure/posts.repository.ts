import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id: id, deletedAt: null });
  }

  async delete(post: PostDocument): Promise<void> {
    post.makeDeleted();
    await this.save(post);
  }
}
