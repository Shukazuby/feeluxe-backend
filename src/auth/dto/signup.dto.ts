import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'Amina Bakare' })
  name: string;

  @ApiProperty({ example: 'amina.b@example.com' })
  email: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  password: string;

  @ApiProperty({ required: false, example: '+2348012345678' })
  phone?: string;

  @ApiProperty({ required: false, example: '123 Luxury Lane, Lagos, Nigeria' })
  address?: string;
}

