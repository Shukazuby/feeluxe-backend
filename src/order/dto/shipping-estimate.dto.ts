import { ApiProperty } from '@nestjs/swagger';

export class ShippingEstimateDto {
  @ApiProperty({
    type: [String],
    description: 'IDs of cart items to calculate shipping for',
    example: ['671234abcd1234abcd1234ef'],
  })
  cartItemIds: string[];
}

