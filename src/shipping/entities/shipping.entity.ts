import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShippingDocument = Shipping & Document;

@Schema({ timestamps: true })
export class Shipping {
  @Prop({ required: true })
  cost: number;

  @Prop()
  name?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ShippingSchema = SchemaFactory.createForClass(Shipping);

