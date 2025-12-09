import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ description: 'Product ID to add', example: '671234abcd1234abcd1234ef' })
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', example: 1 })
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Quantity to update', example: 2 })
  quantity: number;
}

