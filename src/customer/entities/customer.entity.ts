import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export type CustomerDocument = Customer & Document;

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  resetPasswordCode?: string;

  @Prop()
  resetPasswordCodeExpires?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  wishlist: Types.ObjectId[];

  @Prop({ type: [CartItemSchema], default: [] })
  cart: CartItem[];

  @Prop()
  lastLogin?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

