import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { ResultStatus } from '../../../../core/object-result/resultCode';

export interface PostsFilter {
  deletedAt: null;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
  })
  title: string;
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  })
  shortDescription: string;
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  })
  content: string;
  @Prop({
    type: String,
    required: true,
  })
  blogId: string;
  @Prop({
    type: String,
    required: true,
  })
  blogName: string;
  createdAt: Date;
  @Prop({
    type: Date,
    default: null,
  })
  deletedAt: Date | null;

  public static createPost(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    return post as PostDocument;
  }

  updatePost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ): void {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
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

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
