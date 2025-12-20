import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog {
  @Prop()
  ipAddress?: string;

  @Prop()
  visitedPage?: string;

  @Prop()
  activity?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  deviceType?: string; // mobile, tablet, desktop

  @Prop()
  browser?: string;

  @Prop()
  os?: string;

  @Prop()
  userId?: string; // Generic user ID (can be customer or admin)

  // @Prop()
  // customerId?: string; // Customer ID

  // @Prop()
  // email?: string;

  @Prop()
  lastLogged?: Date; // User's last login timestamp

  @Prop()
  method?: string; // HTTP method (GET, POST, etc.)

  @Prop()
  statusCode?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional data

  @Prop()
  sessionId?: string;

  @Prop()
  referer?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type AuditLogDocument = AuditLog & Document;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

