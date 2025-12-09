import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/entities/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './entities/order.entity';
import { Customer, CustomerSchema } from 'src/customer/entities/customer.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { CartItem, CartItemSchema } from 'src/cart-item/entities/cart-item.entity';
import { CartItemModule } from 'src/cart-item/cart-item.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    CustomerModule,
    CartItemModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

