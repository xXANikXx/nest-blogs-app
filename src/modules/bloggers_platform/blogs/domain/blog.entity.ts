import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { ResultStatus } from '../../../../core/object-result/resultCode';

export interface BlogsFilter {
  name?: any;
  deletedAt: null;
}

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200,
  })
  name: string;
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200,
  })
  description: string;
  @Prop({
    type: String,
    required: true,
    maxlength: 100,
    match:
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  })
  websiteUrl: string;
  createdAt: Date;
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isMembership: boolean;
  @Prop({
    type: Date,
    default: null,
  })
  deletedAt: Date | null;

  public static createBlog(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocument;
  }

  updateBlog(name: string, description: string, websiteUrl: string): void {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new DomainException(
        'Entity already deleted',
        ResultStatus.InternalServerError,
      );
    }
    this.deletedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
