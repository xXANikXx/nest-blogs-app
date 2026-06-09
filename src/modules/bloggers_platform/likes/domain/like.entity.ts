import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export enum LikeParentType {
  Post = 'post',
  Comment = 'comment',
}

export interface CreateLikeDomainDto {
  userId: string;
  userLogin: string;
  parentId: string;
  parentType: LikeParentType;
  status: LikeStatus;
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ type: String, required: true })
  parentId: string;

  @Prop({
    type: String,
    enum: LikeParentType,
    required: true,
  })
  parentType: LikeParentType;

  @Prop({
    type: String,
    enum: LikeStatus,
    default: LikeStatus.None,
  })
  status: LikeStatus;

  createdAt: Date;

  static createLike(dto: CreateLikeDomainDto): LikeDocument {
    const like = new this();
    like.userId = dto.userId;
    like.userLogin = dto.userLogin;
    like.parentId = dto.parentId;
    like.parentType = dto.parentType;
    like.status = dto.status;
    return like as LikeDocument;
  }

  updateStatus(newStatus: LikeStatus): void {
    if (!Object.values(LikeStatus).includes(newStatus)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid like status',
      });
    }
    this.status = newStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);

// индексы для быстрого поиска
LikeSchema.index({ parentId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ parentId: 1, status: 1 });

export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument> & typeof Like;
