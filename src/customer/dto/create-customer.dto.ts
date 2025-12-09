import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Amina Bakare' })
  name: string;

  @ApiProperty({ example: 'amina.b@example.com' })
  email: string;

  @ApiProperty({ required: false, example: '+2348012345678' })
  phone?: string;

  @ApiProperty({ required: false, example: '123 Luxury Lane, Lagos, Nigeria' })
  address?: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ required: false, description: 'Plain text password to store (hashed internally)' })
  password?: string;
}

