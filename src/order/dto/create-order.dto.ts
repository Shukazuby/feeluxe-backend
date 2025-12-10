import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    type: [String],
    description: 'IDs of cart items to convert to an order',
    example: ['671234abcd1234abcd1234ef'],
  })
  cartItemIds: string[];

  @ApiProperty({ required: false, description: 'Optional note from customer' })
  notes?: string;

  @ApiProperty({ required: false, description: 'Shipping cost to add to order total', example: 0 })
  shippingCost?: number;
}

export class OrderFilterDto {
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false, description: 'Filter by order status' })
  status?: 'pending' | 'shipped' | 'delivered' | 'cancelled';

  @ApiProperty({ required: false, description: 'Search by order number' })
  search?: string;

  @ApiProperty({ required: false, description: 'Start date (ISO string) for filtering orders' })
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (ISO string) for filtering orders' })
  endDate?: string;
}

