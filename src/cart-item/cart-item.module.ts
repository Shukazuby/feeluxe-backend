import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/entities/product.entity';
import { CartItemService } from './cart-item.service';
import { CartItem, CartItemSchema } from './entities/cart-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule {}

