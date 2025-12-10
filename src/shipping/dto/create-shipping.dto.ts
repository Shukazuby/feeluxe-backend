import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingDto {
  @ApiProperty({ example: 2500, description: 'Flat shipping cost (NGN)' })
  cost: number;

  @ApiProperty({ required: false, example: 'Standard shipping' })
  name?: string;
}

