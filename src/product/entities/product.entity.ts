import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop()
  name: string;

  @Prop()
  amount: number;

  @Prop()
  price?: number;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop()
  imageurl?: string;

  @Prop({ default: false })
  isNew?: boolean;

  @Prop({ default: false })
  isFeatured?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
