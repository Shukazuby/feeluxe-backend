import { ApiProperty } from '@nestjs/swagger';

export class WishlistDto {
  @ApiProperty({ description: 'Product ID to toggle in wishlist' })
  productId: string;
}

