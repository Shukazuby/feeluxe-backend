import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Amina Bakare' })
  name: string;

  @ApiProperty({ example: 'amina.b@example.com' })
  email: string;

  @ApiProperty({ example: 'Question about my order' })
  subject: string;

  @ApiProperty({ example: 'I would like to confirm shipping details for my scarf.' })
  message: string;

  @ApiProperty({ required: false, example: 'FLX12345' })
  orderNumber?: string;
}

export class ContactQueryDto {
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false, description: 'Filter by status' })
  status?: 'open' | 'resolved';

  @ApiProperty({ required: false, description: 'Search by subject or email' })
  search?: string;
}

