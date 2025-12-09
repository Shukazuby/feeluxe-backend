import { Injectable } from '@nestjs/common';
import { BaseResponseTypeDTO } from 'src/utils';
import { CreateCartItemDto } from 'src/cart-item/dto/create-cart-item.dto';
import { CartItemService } from 'src/cart-item/cart-item.service';

@Injectable()
export class CartService {
  constructor(private readonly cartItemService: CartItemService) {}

  add(userId: string, payload: CreateCartItemDto): Promise<BaseResponseTypeDTO> {
    return this.cartItemService.add(userId, payload);
  }

  remove(userId: string, cartItemId: string): Promise<BaseResponseTypeDTO> {
    return this.cartItemService.remove(userId, cartItemId);
  }

  clear(userId: string): Promise<void> {
    return this.cartItemService.clear(userId);
  }

  get(userId: string): Promise<BaseResponseTypeDTO> {
    return this.cartItemService.getCart(userId);
  }
}

