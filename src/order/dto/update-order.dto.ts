import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({ required: false, enum: ['pending', 'shipped', 'delivered', 'cancelled'] })
  status?: 'pending' | 'shipped' | 'delivered' | 'cancelled';

  @ApiProperty({ required: false })
  shippingAddress?: string;

  @ApiProperty({ required: false })
  notes?: string;
}

