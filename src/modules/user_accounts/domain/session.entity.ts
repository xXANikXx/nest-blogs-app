import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string; // User-Agent

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  static createSession(dto: {
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: Date;
    expiresAt: Date;
  }): SessionDocument {
    const session = new this();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.ip = dto.ip;
    session.title = dto.title;
    session.lastActiveDate = dto.lastActiveDate;
    session.expiresAt = dto.expiresAt;
    return session as SessionDocument;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);
export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;
