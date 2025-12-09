import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemModule } from 'src/cart-item/cart-item.module';

@Module({
  imports: [CartItemModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

