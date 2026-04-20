import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../../domain/blog.entity';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({ _id: id, deletedAt: null });
  }
}
