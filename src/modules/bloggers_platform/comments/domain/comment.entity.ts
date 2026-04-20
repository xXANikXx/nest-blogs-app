import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentatorInfoSchema';
import { HydratedDocument, Model } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { ResultStatus } from '../../../../core/object-result/resultCode';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';

export interface CommentsFilter {
  postId: string;
  deletedAt: null;
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String,
    required: true,
    minlength: 20,
    maxlength: 300,
  })
  content: string;
  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop({ type: String, required: true })
  postId: string;

  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createComment(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    return comment as CommentDocument;
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

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
