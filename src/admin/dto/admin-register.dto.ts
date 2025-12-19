import { ApiProperty } from '@nestjs/swagger';

export class AdminRegisterDto {
  @ApiProperty({ example: 'Admin User' })
  name: string;

  @ApiProperty({ example: 'admin@feeluxe.ng' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  password: string;
}


