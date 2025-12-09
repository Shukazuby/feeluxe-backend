import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  imageUrl?: string;

  @Prop()
  category?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'shipped', 'delivered', 'cancelled'] })
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';

  @Prop({
    default: 'pending',
    enum: ['pending', 'initiated', 'paid', 'failed'],
  })
  paymentStatus: 'pending' | 'initiated' | 'paid' | 'failed';

  @Prop()
  paymentReference?: string;

  @Prop()
  paymentProvider?: string;

  @Prop()
  paymentAuthorizationUrl?: string;

  @Prop({ type: Date, default: () => new Date() })
  placedAt: Date;

  @Prop()
  userId?: string;

  @Prop()
  shippingAddress?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactName?: string;

  @Prop()
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

