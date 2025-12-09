import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'amina.b@example.com' })
  email: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  password: string;
}

