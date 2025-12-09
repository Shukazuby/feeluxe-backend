import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({ description: 'Product ID to add', example: '671234abcd1234abcd1234ef' })
  productId: string;

  @ApiProperty({ description: 'Quantity for the product', example: 1, default: 1 })
  quantity: number;
}

