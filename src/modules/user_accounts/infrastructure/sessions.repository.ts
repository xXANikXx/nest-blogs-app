import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async findAllByUserId(userId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({ userId });
  }

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.SessionModel.deleteOne({ deviceId });
  }

  async deleteAllExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.SessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
}
