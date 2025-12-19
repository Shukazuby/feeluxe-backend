import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@feeluxe.ng' })
  email: string;

  @ApiProperty({ example: 'AdminPassword123!' })
  password: string;
}

