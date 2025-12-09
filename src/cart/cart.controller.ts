import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { CreateCartItemDto } from 'src/cart-item/dto/create-cart-item.dto';

@ApiTags('Cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cart fetched' })
  getCart(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.cartService.get(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item added' })
  addToCart(@Request() req, @Body() payload: CreateCartItemDto): Promise<BaseResponseTypeDTO> {
    return this.cartService.add(req.user.id, payload);
  }

  @Delete('remove/:cartItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item removed' })
  removeFromCart(@Request() req, @Param('cartItemId') cartItemId: string): Promise<BaseResponseTypeDTO> {
    return this.cartService.remove(req.user.id, cartItemId);
  }

  @Delete('clear/all')
  @ApiOperation({ summary: 'Clear all cart items' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cart cleared' })
  async clearCart(@Request() req): Promise<BaseResponseTypeDTO> {
    await this.cartService.clear(req.user.id);
    return {
      data: { cart: [], total: 0 },
      success: true,
      code: HttpStatus.OK,
      message: 'Cart cleared',
    };
  }
}

