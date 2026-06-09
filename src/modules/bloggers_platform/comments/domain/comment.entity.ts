import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentatorInfoSchema';
import { HydratedDocument, Model } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

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

  updateContent(content: string, userId: string): void {
    if (this.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to edit this comment',
      });
    }
    this.content = content;
  }

  makeDeleted(userId: string): void {
    if (this.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to delete this comment',
      });
    }
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Entity already deleted',
      });
    }
    this.deletedAt = new Date();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
