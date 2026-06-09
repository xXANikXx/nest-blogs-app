import {
  Like,
  LikeDocument,
  type LikeModelType,
  LikeStatus,
} from '../domain/like.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewestLikeDto } from './newest-like.dto';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async findByUserAndParent(
    userId: string,
    parentId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ userId, parentId });
  }

  // ===== чтение =====
  async findMyStatus(userId: string, parentId: string): Promise<LikeStatus> {
    const like = await this.LikeModel.findOne({ userId, parentId });
    return like?.status ?? LikeStatus.None;
  }

  async countByParentAndStatus(
    parentId: string,
    status: LikeStatus,
  ): Promise<number> {
    return this.LikeModel.countDocuments({ parentId, status });
  }

  async findNewestLikes(parentId: string, limit = 3): Promise<NewestLikeDto[]> {
    const likes = await this.LikeModel.find({
      parentId,
      status: LikeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return likes.map((like) => ({
      addedAt: like.createdAt.toISOString(),
      userId: like.userId,
      login: like.userLogin,
    }));
  }

  async getLikesInfo(
    parentId: string,
    userId: string | null,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  }> {
    const [likesCount, dislikesCount, myStatus] = await Promise.all([
      this.countByParentAndStatus(parentId, LikeStatus.Like),
      this.countByParentAndStatus(parentId, LikeStatus.Dislike),
      userId
        ? this.findMyStatus(userId, parentId)
        : Promise.resolve(LikeStatus.None),
    ]);

    return { likesCount, dislikesCount, myStatus };
  }
}
